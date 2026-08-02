import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };
export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const job = await prisma.conversionJob.findFirst({ where: { id, userId: session.user.id } });
  if (!job) return NextResponse.json({ error: "Konversi tidak ditemukan." }, { status: 404 });
  if (job.status === "COMPLETED" && job.expiresAt && job.expiresAt < new Date()) {
    const expired = await prisma.conversionJob.update({ where: { id: job.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ job: expired });
  }
  return NextResponse.json({ job });
}
