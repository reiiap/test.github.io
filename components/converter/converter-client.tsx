"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Step = { label: string; status: "done" | "active" | "pending" | "failed" };
type Job = { id: string; status: string; originalFilename: string; sizeBytes: number; packFormat?: number | null; minecraftVersion?: string | null; texturesCount: number; modelsCount: number; animationsCount: number; otherAssetsCount: number; costCoins: number; warnings: string[]; errorReason?: string | null; steps?: Step[] | null; expiresAt?: string | null };
const labels: Record<string, string> = { PENDING: "Menunggu antrean", PROCESSING: "Sedang diproses", COMPLETED: "Konversi selesai", FAILED: "Konversi gagal", EXPIRED: "Output kedaluwarsa", CANCELLED: "Dibatalkan" };

export function ConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!file) return toast.error("Pilih file ZIP terlebih dahulu.");
    setLoading(true);
    const form = new FormData(); form.append("file", file);
    const res = await fetch("/api/conversions", { method: "POST", body: form });
    const json = await res.json(); setLoading(false);
    if (!res.ok) return toast.error(json.error ?? "Unggah gagal.");
    setJob(json.job); toast.success("Analisis selesai.");
  }

  async function confirm() {
    if (!job) return;
    setLoading(true);
    const res = await fetch(`/api/conversions/${job.id}/confirm`, { method: "POST" });
    const json = await res.json(); setLoading(false);
    if (!res.ok) return toast.error(json.error ?? "Konfirmasi gagal.");
    toast.success("Conversion masuk antrean."); poll(job.id);
  }

  async function poll(id: string) {
    const res = await fetch(`/api/conversions/${id}`, { cache: "no-store" });
    if (res.ok) { const json = await res.json(); setJob(json.job); }
  }

  useEffect(() => {
    if (!job || !["PENDING", "PROCESSING"].includes(job.status)) return;
    const timer = setInterval(() => poll(job.id), 1500);
    return () => clearInterval(timer);
  }, [job]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="glass rounded-3xl p-6">
        <h2 className="text-2xl font-bold">Unggah Resource Pack</h2>
        <p className="muted mt-2">Format ZIP, maksimum 25 MB. Validasi tetap dilakukan server-side.</p>
        <input className="input mt-5" type="file" accept=".zip,application/zip" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <button className="btn btn-primary mt-5" disabled={loading || !file} onClick={analyze}>{loading ? "Memproses…" : "Analisis"}</button>
      </section>
      <section className="glass rounded-3xl p-6">
        <h2 className="text-2xl font-bold">Informasi Conversion</h2>
        {!job ? <p className="muted mt-3">Unggah ZIP untuk melihat pack format, asset, peringatan, dan estimasi Coin.</p> : <JobSummary job={job} onConfirm={confirm} loading={loading} />}
      </section>
    </div>
  );
}

function JobSummary({ job, onConfirm, loading }: { job: Job; onConfirm: () => void; loading: boolean }) {
  return <div className="mt-4 space-y-5"><dl className="grid gap-3 text-sm"><Row k="Nama file" v={job.originalFilename}/><Row k="Ukuran" v={`${(job.sizeBytes/1024/1024).toFixed(2)} MB`}/><Row k="Pack format" v={job.packFormat ? String(job.packFormat) : "Tidak terdeteksi"}/><Row k="Versi Java" v={job.minecraftVersion ?? "Tidak terdeteksi"}/><Row k="Texture" v={String(job.texturesCount)}/><Row k="Model" v={String(job.modelsCount)}/><Row k="Animation" v={String(job.animationsCount)}/><Row k="Estimasi Coin" v={`${job.costCoins} Coin`}/><Row k="Status" v={labels[job.status] ?? job.status}/></dl>{job.warnings.length>0&&<div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100"><p className="font-bold">Peringatan</p><ul className="mt-2 list-disc pl-5">{job.warnings.map((w)=><li key={w}>{w}</li>)}</ul></div>}{job.steps&&<ol className="grid gap-2 text-sm">{job.steps.map((s)=><li className="flex items-center gap-2" key={s.label}><span>{s.status==='done'?'✓':s.status==='active'?'◉':s.status==='failed'?'!':'○'}</span><span>{s.label}</span></li>)}</ol>}{job.errorReason&&<p className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-100">{job.errorReason}</p>}{job.status==='PENDING'&&<button className="btn btn-primary" disabled={loading} onClick={onConfirm}>Konfirmasi Conversion</button>}{job.status==='COMPLETED'&&<a className="btn btn-primary" href={`/api/conversions/${job.id}/download`}>Unduh Bedrock Pack</a>}{job.expiresAt&&<p className="muted text-xs">Output kedaluwarsa: {new Date(job.expiresAt).toLocaleString('id-ID')}</p>}</div>;
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-4"><dt className="muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>; }
