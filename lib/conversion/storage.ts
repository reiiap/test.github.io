import { promises as fs } from "fs";
import path from "path";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const OUTPUT_TTL_DAYS = 7;
const root = process.env.CONVERSION_STORAGE_DIR ?? path.join(process.cwd(), ".data", "conversions");

export function userJobDir(userId: string, jobId: string) { return path.join(root, userId, jobId); }
export function inputPath(userId: string, jobId: string, filename: string) { return path.join(userJobDir(userId, jobId), "input", filename); }
export function outputPath(userId: string, jobId: string, filename: string) { return path.join(userJobDir(userId, jobId), "output", filename); }
export async function ensureDirFor(filePath: string) { await fs.mkdir(path.dirname(filePath), { recursive: true }); }
export function expiresAt() { const date = new Date(); date.setDate(date.getDate() + OUTPUT_TTL_DAYS); return date; }
