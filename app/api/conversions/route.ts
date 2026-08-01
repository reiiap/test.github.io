import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { analyzeResourcePack, calculateCostCoins } from "@/lib/conversion/analyzer";
import { ensureDirFor, inputPath, MAX_UPLOAD_BYTES } from "@/lib/conversion/storage";
import { assertZipUpload, sanitizeFilename } from "@/lib/conversion/zip";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limited = rateLimit(`conversion-upload:${session.user.id}`, 5, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Terlalu banyak upload. Coba lagi sebentar." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const upload = form?.get("file");
  if (!(upload instanceof File)) return NextResponse.json({ error: "File ZIP wajib diunggah." }, { status: 400 });
  if (upload.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: `Ukuran ZIP melebihi batas ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` }, { status: 413 });
  const allowedTypes = new Set(["", "application/zip", "application/x-zip-compressed", "application/octet-stream"]);
  if (!allowedTypes.has(upload.type)) return NextResponse.json({ error: "MIME file tidak cocok untuk ZIP." }, { status: 400 });

  try {
    const buffer = Buffer.from(await upload.arrayBuffer());
    assertZipUpload(buffer, upload.name, MAX_UPLOAD_BYTES);
    const analysis = analyzeResourcePack(buffer);
    const jobId = randomUUID();
    const safeFilename = sanitizeFilename(upload.name);
    const inPath = inputPath(session.user.id, jobId, safeFilename);
    await ensureDirFor(inPath);
    await fs.writeFile(inPath, buffer, { mode: 0o600 });
    const costCoins = calculateCostCoins(analysis);
    const job = await prisma.conversionJob.create({
      data: { id: jobId, userId: session.user.id, originalFilename: upload.name, safeFilename, inputPath: inPath, sizeBytes: buffer.length, packFormat: analysis.packFormat, minecraftVersion: analysis.minecraftVersion, texturesCount: analysis.texturesCount, modelsCount: analysis.modelsCount, animationsCount: analysis.animationsCount, otherAssetsCount: analysis.otherAssetsCount, costCoins, analysis: { entries: analysis.entries.slice(0, 200), rootPrefix: analysis.rootPrefix }, warnings: analysis.warnings, steps: [{ label: "Unggah Resource Pack", status: "done" }, { label: "Analisis", status: "done" }, { label: "Konversi Texture", status: "pending" }, { label: "Konversi Model", status: "pending" }, { label: "Packaging", status: "pending" }, { label: "Selesai", status: "pending" }] },
    });
    return NextResponse.json({ ok: true, job });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ZIP tidak dapat dianalisis." }, { status: 400 });
  }
}
