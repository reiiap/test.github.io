import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditCoins, debitCoins } from "@/lib/wallet/server";
import { rateLimit } from "@/lib/security";

const schema = z.object({ userId: z.string().min(1), amount: z.number().int().positive(), direction: z.enum(["CREDIT", "DEBIT"]), reason: z.string().min(8).max(500), idempotencyKey: z.string().min(8).max(120).optional() });
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limited = rateLimit(`admin-coin:${session.user.id}`, 20, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Terlalu banyak adjustment." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload adjustment tidak valid." }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  const fn = parsed.data.direction === "CREDIT" ? creditCoins : debitCoins;
  const type = parsed.data.direction === "CREDIT" ? "CREDIT_ADMIN" : "DEBIT_ADJUSTMENT";
  const tx = await fn({ userId: target.id, amount: parsed.data.amount, type, referenceType: "ADMIN_ADJUSTMENT", referenceId: parsed.data.idempotencyKey, idempotencyKey: parsed.data.idempotencyKey, description: parsed.data.reason, adminId: admin.id, metadata: { reason: parsed.data.reason } });
  return NextResponse.json({ ok: true, transaction: tx });
}
