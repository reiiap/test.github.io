import { inflateRawSync } from "zlib";
import { getEntryData, readZip, type ZipEntry } from "@/lib/conversion/zip";

const PACK_FORMATS: Record<number, string> = { 1: "1.6.1–1.8.9", 2: "1.9–1.10.2", 3: "1.11–1.12.2", 4: "1.13–1.14.4", 5: "1.15–1.16.1", 6: "1.16.2–1.16.5", 7: "1.17–1.17.1", 8: "1.18–1.18.2", 9: "1.19–1.19.2", 12: "1.19.3", 13: "1.19.4", 15: "1.20–1.20.1", 18: "1.20.2", 22: "1.20.3–1.20.4", 32: "1.20.5–1.20.6", 34: "1.21–1.21.1", 42: "1.21.2–1.21.3", 46: "1.21.4" };

export type ConversionAnalysis = { packFormat?: number; minecraftVersion?: string; texturesCount: number; modelsCount: number; animationsCount: number; otherAssetsCount: number; rootPrefix: string; warnings: string[]; entries: string[] };

export function analyzeResourcePack(buffer: Buffer): ConversionAnalysis {
  const zip = readZip(buffer);
  const entries = zip.entries.filter((entry) => !entry.isDirectory);
  const names = entries.map((entry) => entry.name.replace(/\\/g, "/"));
  const packMeta = entries.find((entry) => entry.name.endsWith("pack.mcmeta"));
  const rootPrefix = packMeta ? packMeta.name.replace(/pack\.mcmeta$/, "") : "";
  const pack = packMeta ? readJsonEntry(buffer, packMeta) : undefined;
  const packFormat = typeof pack?.pack?.pack_format === "number" ? pack.pack.pack_format : undefined;
  const scoped = (segment: string) => names.filter((name) => name.startsWith(`${rootPrefix}assets/minecraft/${segment}/`));
  const texturesCount = scoped("textures").filter((name) => /\.png$/i.test(name)).length;
  const modelsCount = scoped("models").filter((name) => /\.json$/i.test(name)).length;
  const animationsCount = scoped("textures").filter((name) => /\.png\.mcmeta$/i.test(name)).length;
  const known = names.filter((name) => name.startsWith(`${rootPrefix}assets/minecraft/`)).length;
  const warnings: string[] = [];
  if (!packMeta) warnings.push("pack.mcmeta tidak ditemukan; versi Java tidak dapat dideteksi.");
  if (modelsCount > 0) warnings.push("Model Java tidak selalu kompatibel dengan Bedrock; fase ini hanya menyalin file model sebagai referensi.");
  if (animationsCount > 0) warnings.push("Animation mcmeta terdeteksi; konversi Animation Bedrock belum dijamin.");
  return { packFormat, minecraftVersion: packFormat ? PACK_FORMATS[packFormat] : undefined, texturesCount, modelsCount, animationsCount, otherAssetsCount: Math.max(0, known - texturesCount - modelsCount - animationsCount), rootPrefix, warnings, entries: names };
}

function readJsonEntry(buffer: Buffer, entry: ZipEntry) {
  const raw = getEntryData(buffer, entry);
  const data = entry.method === 8 ? inflateRawSync(raw) : raw;
  return JSON.parse(data.toString("utf8"));
}

export function calculateCostCoins(analysis: ConversionAnalysis) {
  const assetUnits = analysis.texturesCount + analysis.modelsCount + analysis.animationsCount;
  return Math.max(1, Math.ceil(assetUnits / 250));
}
