import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getCoinPackage } from "@/lib/wallet/packages";
import { createPayment } from "@/lib/payments/provider";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security";

const schema = z.object({ packageId: z.string().min(1), idempotencyKey: z.string().min(8).max(120).optional() });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limited = rateLimit(`coin-purchase:${session.user.id}`, 10, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Terlalu banyak percobaan pembelian." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload pembelian tidak valid." }, { status: 400 });
  const pack = getCoinPackage(parsed.data.packageId);
  if (!pack) return NextResponse.json({ error: "Paket Coin tidak tersedia." }, { status: 404 });
  if (!pack.priceIdr) return NextResponse.json({ error: "Harga paket belum dikonfigurasi di server." }, { status: 409 });

  try {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: session.user.id,
        orderNumber: `COIN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        title: `Pembelian Coin ${pack.name}`,
        description: `Paket ${pack.name}: ${pack.coins} Coin`,
        status: "PENDING",
        amount: pack.priceIdr,
        currency: "IDR",
        files: [],
      },
    });
    const providerPayment = await createPayment({ orderId: order.id, amount: pack.priceIdr!, currency: "IDR", description: order.description, userId: session.user.id });
    const payment = await tx.payment.create({
      data: {
        userId: session.user.id,
        orderId: order.id,
        provider: providerPayment.provider,
        method: "MANUAL",
        status: "PENDING",
        amount: pack.priceIdr!,
        currency: "IDR",
        externalId: providerPayment.externalId,
        checkoutUrl: providerPayment.checkoutUrl,
        rawPayload: { packageId: pack.id, coins: pack.coins, sandbox: true, clientIdempotencyKey: parsed.data.idempotencyKey },
      },
    });
    return { order, payment };
  });

  return NextResponse.json({ ok: true, orderId: result.order.id, status: result.payment.status, checkoutUrl: result.payment.checkoutUrl });
  } catch (error) {
    console.error("[coin-purchase] create payment failed", { userId: session.user.id, packageId: pack.id, error });
    return NextResponse.json({ error: "Pembayaran belum dapat dibuat. Coba lagi nanti atau hubungi admin." }, { status: 503 });
  }
}
