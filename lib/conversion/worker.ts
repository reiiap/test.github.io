import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { inflateRawSync } from "zlib";
import { analyzeResourcePack } from "@/lib/conversion/analyzer";
import { createZip } from "@/lib/conversion/zip-writer";
import { getEntryData, readZip } from "@/lib/conversion/zip";
import { ensureDirFor, expiresAt, outputPath } from "@/lib/conversion/storage";
import { prisma } from "@/lib/prisma";
import { refundConversion } from "@/lib/wallet/server";

const MANIFEST_VERSION = [1, 0, 0];
const STEPS = ["Unggah Resource Pack", "Analisis", "Konversi Texture", "Konversi Model", "Packaging", "Selesai"];
function stepState(active: number, failed = false) { return STEPS.map((label, index) => ({ label, status: failed && index === active ? "failed" : index < active ? "done" : index === active ? "active" : "pending" })); }
function safeError(error: unknown) { return error instanceof Error ? error.message.replace(/\/[^\s]+/g, "[path]") : "Konversi gagal."; }

export async function queueConversionJob(jobId: string) {
  setTimeout(() => { processConversionJob(jobId).catch((error) => console.error("[conversion:worker]", { jobId, error })); }, 0);
}

export async function processConversionJob(jobId: string) {
  const job = await prisma.conversionJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "PENDING") return;
  await prisma.conversionJob.update({ where: { id: jobId }, data: { status: "PROCESSING", startedAt: new Date(), steps: stepState(1) } });
  try {
    const input = await fs.readFile(job.inputPath);
    const analysis = analyzeResourcePack(input);
    await prisma.conversionJob.update({ where: { id: jobId }, data: { steps: stepState(2) } });
    const files = buildBedrockPack(input, analysis.rootPrefix);
    await prisma.conversionJob.update({ where: { id: jobId }, data: { steps: stepState(4) } });
    const outName = `${path.basename(job.safeFilename, ".zip")}-bedrock.mcpack`;
    const outPath = outputPath(job.userId, job.id, outName);
    await ensureDirFor(outPath);
    await fs.writeFile(outPath, createZip(files));
    await prisma.conversionJob.update({ where: { id: jobId }, data: { status: "COMPLETED", outputPath: outPath, outputFilename: outName, completedAt: new Date(), expiresAt: expiresAt(), steps: stepState(6), warnings: analysis.warnings } });
  } catch (error) {
    const reason = safeError(error);
    await prisma.conversionJob.update({ where: { id: jobId }, data: { status: "FAILED", errorReason: reason, completedAt: new Date(), steps: stepState(4, true) } });
    await refundConversion(job.userId, job.id, job.costCoins, reason).catch((refundError) => console.error("[conversion:refund]", { jobId, refundError }));
  }
}

function buildBedrockPack(input: Buffer, rootPrefix: string) {
  const zip = readZip(input);
  const files: Array<{ name: string; data: Buffer | string }> = [];
  const header = { format_version: 2, header: { name: "Converted Java Resource Pack", description: "Dikonversi oleh ReiiKajurawa JvsB. Verifikasi manual tetap disarankan.", uuid: randomUUID(), version: MANIFEST_VERSION, min_engine_version: [1, 20, 0] }, modules: [{ type: "resources", uuid: randomUUID(), version: MANIFEST_VERSION }] };
  files.push({ name: "manifest.json", data: JSON.stringify(header, null, 2) });
  for (const entry of zip.entries) {
    if (entry.isDirectory) continue;
    const name = entry.name.replace(/\\/g, "/");
    const relative = name.startsWith(rootPrefix) ? name.slice(rootPrefix.length) : name;
    let outName = "";
    if (relative === "pack.png") outName = "pack_icon.png";
    if (relative.startsWith("assets/minecraft/textures/") && /\.(png)$/i.test(relative)) outName = relative.replace("assets/minecraft/", "");
    if (relative.startsWith("assets/minecraft/models/") && /\.(json)$/i.test(relative)) outName = `java_reference/${relative}`;
    if (!outName) continue;
    const raw = getEntryData(input, entry);
    files.push({ name: outName, data: entry.method === 8 ? inflateRawSync(raw) : raw });
  }
  if (files.length === 1) throw new Error("Tidak ada Texture PNG yang dapat dikemas ke Bedrock Resource Pack.");
  return files;
}
