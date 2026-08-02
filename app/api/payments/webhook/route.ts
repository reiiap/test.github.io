import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyWebhook } from "@/lib/payments/provider";
import { signedAmount } from "@/lib/wallet/core";

type PaymentMetadata = { packageId?: unknown; coins?: unknown };

function asPaymentMetadata(value: unknown): PaymentMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as PaymentMetadata;
}

const schema = z.object({
  provider: z.enum(["MIDTRANS", "XENDIT", "TRIPAY", "DUITKU", "MANUAL"]),
  externalId: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "FAILED", "EXPIRED", "REFUNDED"]),
  event: z.string().default("payment.updated"),
  providerTransactionId: z.string().optional(),
});

function paymentToOrderStatus(status: z.infer<typeof schema>["status"]) {
  if (status === "PAID") return "PROCESSING" as const;
  if (status === "FAILED" || status === "EXPIRED" || status === "REFUNDED") return "CANCELLED" as const;
  return "PENDING" as const;
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  try { await verifyWebhook(req, payload); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook tidak valid." }, { status: 401 }); }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });

  try {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { externalId: parsed.data.externalId }, include: { order: true } });
    if (!payment) throw new Error("Payment tidak ditemukan.");

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: parsed.data.status,
        paidAt: parsed.data.status === "PAID" && !payment.paidAt ? new Date() : payment.paidAt,
        rawPayload: payload,
        transactionLogs: { create: { event: parsed.data.event, payload } },
      },
      include: { order: true },
    });

    await tx.order.update({ where: { id: payment.orderId }, data: { status: paymentToOrderStatus(parsed.data.status) } });

    if (parsed.data.status !== "PAID") return { credited: false, payment: updatedPayment };

    const idempotencyKey = `coin-purchase:${payment.id}:credit`;
    const existing = await tx.coinTransaction.findUnique({ where: { idempotencyKey } });
    if (existing) return { credited: false, payment: updatedPayment };

    const metadata = asPaymentMetadata(payment.rawPayload);
    const packageId = typeof metadata.packageId === "string" ? metadata.packageId : undefined;
    const coins = Number.isInteger(Number(metadata.coins)) ? Number(metadata.coins) : 0;
    if (!packageId || coins <= 0) throw new Error("Metadata paket Coin tidak valid.");

    const wallet = await tx.coinWallet.upsert({ where: { userId: payment.userId }, update: {}, create: { userId: payment.userId } });
    const updatedWallet = await tx.coinWallet.update({ where: { id: wallet.id }, data: { balance: { increment: coins } } });
    await tx.coinTransaction.create({
      data: {
        userId: payment.userId,
        walletId: updatedWallet.id,
        amount: signedAmount("credit", coins),
        type: "CREDIT_PURCHASE",
        status: "COMPLETED",
        referenceType: "PAYMENT",
        referenceId: payment.id,
        idempotencyKey,
        description: "Pembelian Coin",
        metadata: { packageId, externalId: payment.externalId, providerTransactionId: parsed.data.providerTransactionId },
      },
    });
    return { credited: true, payment: updatedPayment };
  });

  return NextResponse.json({ ok: true, credited: result.credited });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook gagal diproses.";
    const status = message.includes("tidak ditemukan") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
