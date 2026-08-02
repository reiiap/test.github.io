import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<string, string> = { PENDING: "Menunggu", PROCESSING: "Diproses", COMPLETED: "Selesai", FAILED: "Gagal", EXPIRED: "Kedaluwarsa", CANCELLED: "Dibatalkan" };

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const [jobs, refunds] = await Promise.all([
    prisma.conversionJob.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.coinTransaction.findMany({ where: { userId: session.user.id, type: "REFUND_CONVERSION" }, select: { referenceId: true, amount: true }, orderBy: { createdAt: "desc" } }),
  ]);
  const refundByConversion = new Map(refunds.map((tx) => [tx.referenceId, tx.amount]));
  return <main className="section"><div className="glass rounded-[2rem] p-6 sm:p-8"><p className="text-emerald-300">Riwayat Konversi</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Riwayat</h1><p className="muted mt-3">Resource Pack, biaya Coin, status, dan download milik akun kamu.</p></div><div className="mt-6 overflow-hidden rounded-3xl border border-white/10"><div className="grid grid-cols-2 gap-3 bg-white/5 p-4 text-sm font-bold sm:grid-cols-5"><span>Resource Pack</span><span>Tanggal</span><span className="hidden sm:block">Biaya</span><span className="hidden sm:block">Status</span><span className="hidden sm:block">Unduh</span></div>{jobs.map((job) => <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-4 text-sm sm:grid-cols-5" key={job.id}><span>{job.originalFilename}</span><span>{job.createdAt.toLocaleDateString("id-ID")}</span><span>{job.costCoins} Coin{refundByConversion.has(job.id) ? <span className="ml-2 text-emerald-300">Refund +{refundByConversion.get(job.id)} Coin</span> : null}</span><span>{statusLabel[job.status] ?? job.status}</span><span>{job.status === "COMPLETED" ? <Link className="text-emerald-300" href={`/api/conversions/${job.id}/download`}>Unduh</Link> : "—"}</span></div>)}{jobs.length === 0 && <p className="muted border-t border-white/10 p-4">Belum ada riwayat konversi.</p>}</div></main>;
}
