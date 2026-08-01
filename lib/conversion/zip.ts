import { randomUUID } from "crypto";
import path from "path";

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;
const MAX_ENTRIES = 4000;
const MAX_UNCOMPRESSED_BYTES = 150 * 1024 * 1024;

export type ZipEntry = { name: string; compressedSize: number; uncompressedSize: number; method: number; localHeaderOffset: number; isDirectory: boolean };
export type ZipReadResult = { entries: ZipEntry[]; totalUncompressedBytes: number };

export function sanitizeFilename(name: string) {
  const base = path.basename(name).toLowerCase().replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return base.toLowerCase().endsWith(".zip") ? base : `${base || randomUUID()}.zip`;
}

export function assertZipUpload(buffer: Buffer, filename: string, maxBytes: number) {
  if (!filename.toLowerCase().endsWith(".zip")) throw new Error("File harus berformat ZIP.");
  if (buffer.length < 22 || buffer.readUInt32LE(0) !== LOC_SIG) throw new Error("Konten file bukan ZIP yang valid.");
  if (buffer.length > maxBytes) throw new Error(`Ukuran ZIP melebihi batas ${Math.floor(maxBytes / 1024 / 1024)} MB.`);
}

export function readZip(buffer: Buffer): ZipReadResult {
  const start = Math.max(0, buffer.length - 0xffff - 22);
  let eocd = -1;
  for (let i = buffer.length - 22; i >= start; i--) if (buffer.readUInt32LE(i) === EOCD_SIG) { eocd = i; break; }
  if (eocd < 0) throw new Error("Struktur ZIP tidak lengkap.");
  const entriesCount = buffer.readUInt16LE(eocd + 10);
  const centralSize = buffer.readUInt32LE(eocd + 12);
  let offset = buffer.readUInt32LE(eocd + 16);
  if (entriesCount > MAX_ENTRIES) throw new Error("ZIP memiliki terlalu banyak file.");
  if (offset + centralSize > buffer.length) throw new Error("Central directory ZIP tidak valid.");

  const entries: ZipEntry[] = [];
  let totalUncompressedBytes = 0;
  for (let i = 0; i < entriesCount; i++) {
    if (buffer.readUInt32LE(offset) !== CEN_SIG) throw new Error("Entry ZIP tidak valid.");
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    validateEntryName(name);
    if (![0, 8].includes(method)) throw new Error("ZIP memakai metode kompresi yang tidak didukung.");
    totalUncompressedBytes += uncompressedSize;
    if (totalUncompressedBytes > MAX_UNCOMPRESSED_BYTES) throw new Error("ZIP terlalu besar setelah diekstrak.");
    if (compressedSize > 0 && uncompressedSize / compressedSize > 100) throw new Error("ZIP terdeteksi berisiko decompression abuse.");
    entries.push({ name, compressedSize, uncompressedSize, method, localHeaderOffset, isDirectory: name.endsWith("/") });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return { entries, totalUncompressedBytes };
}

function validateEntryName(name: string) {
  const normalized = name.replace(/\\/g, "/");
  if (!normalized || normalized.startsWith("/") || normalized.includes("../") || normalized === ".." || /^[a-zA-Z]:/.test(normalized)) throw new Error("ZIP mengandung path tidak aman.");
  if (/\.(exe|bat|cmd|sh|ps1|jar|dll|so|dylib)$/i.test(normalized)) throw new Error("ZIP mengandung file executable yang tidak diizinkan.");
}

export function getEntryData(buffer: Buffer, entry: ZipEntry) {
  const offset = entry.localHeaderOffset;
  if (buffer.readUInt32LE(offset) !== LOC_SIG) throw new Error("Local header ZIP tidak valid.");
  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (end > buffer.length) throw new Error("Data entry ZIP tidak valid.");
  return buffer.subarray(start, end);
}
