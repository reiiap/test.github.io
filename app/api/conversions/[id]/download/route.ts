import { promises as fs } from "fs";
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
  if (job.status !== "COMPLETED" || !job.outputPath || !job.outputFilename) return NextResponse.json({ error: "Output belum tersedia." }, { status: 409 });
  if (job.expiresAt && job.expiresAt < new Date()) {
    await prisma.conversionJob.update({ where: { id: job.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Output sudah kedaluwarsa." }, { status: 410 });
  }
  const data = await fs.readFile(job.outputPath).catch(() => null);
  if (!data) return NextResponse.json({ error: "Output tidak ditemukan." }, { status: 404 });
  return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${job.outputFilename.replace(/"/g, "")}"`, "Cache-Control": "private, no-store" } });
}
