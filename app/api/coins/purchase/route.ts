import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getCoinPackage } from "@/lib/wallet/packages";
import { creditCoins } from "@/lib/wallet/server";
import { rateLimit } from "@/lib/security";

const schema = z.object({ packageId: z.string(), idempotencyKey: z.string().min(8).max(120).optional() });
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limited = rateLimit(`coin-purchase:${session.user.id}`, 10, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Terlalu banyak simulasi pembelian." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload pembelian tidak valid." }, { status: 400 });
  const pack = getCoinPackage(parsed.data.packageId);
  if (!pack) return NextResponse.json({ error: "Paket Coin tidak tersedia." }, { status: 404 });
  const key = parsed.data.idempotencyKey ?? `purchase:${session.user.id}:${pack.id}:${Date.now()}`;
  const transaction = await creditCoins({ userId: session.user.id, amount: pack.coins, type: "CREDIT_PURCHASE", referenceType: "COIN_PACKAGE", referenceId: pack.id, idempotencyKey: key, description: `Simulasi pembelian paket ${pack.name}`, metadata: { packageId: pack.id, placeholder: true } });
  return NextResponse.json({ ok: true, transaction });
}
