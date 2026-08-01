import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { queueConversionJob } from "@/lib/conversion/worker";
import { chargeConversion } from "@/lib/wallet/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security";

type Ctx = { params: Promise<{ id: string }> };
export async function POST(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limited = rateLimit(`conversion-confirm:${session.user.id}`, 10, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Terlalu banyak permintaan konversi." }, { status: 429 });
  const { id } = await ctx.params;
  const job = await prisma.conversionJob.findFirst({ where: { id, userId: session.user.id } });
  if (!job) return NextResponse.json({ error: "Conversion tidak ditemukan." }, { status: 404 });
  if (job.status !== "PENDING") return NextResponse.json({ error: "Conversion ini sudah diproses atau tidak dapat dikonfirmasi." }, { status: 409 });
  try {
    await chargeConversion(session.user.id, job.id, job.costCoins);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Saldo Coin tidak cukup." }, { status: 402 });
  }
  await queueConversionJob(job.id);
  return NextResponse.json({ ok: true, jobId: job.id, status: "PENDING", costCoins: job.costCoins });
}
