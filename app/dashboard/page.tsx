import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getWalletSummary } from "@/lib/wallet/server";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<string, string> = { PENDING: "Menunggu", PROCESSING: "Diproses", COMPLETED: "Selesai", FAILED: "Gagal", EXPIRED: "Kedaluwarsa", CANCELLED: "Dibatalkan" };
const transactionLabel: Record<string, string> = { CREDIT_PURCHASE: "Pembelian Coin", CREDIT_BONUS: "Bonus Coin", CREDIT_ADMIN: "Penyesuaian Admin", DEBIT_CONVERSION: "Konversi Resource Pack", REFUND_CONVERSION: "Pengembalian konversi", DEBIT_ADJUSTMENT: "Penyesuaian debit", CREDIT_ADJUSTMENT: "Penyesuaian kredit" };

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const [wallet, jobs] = await Promise.all([
    getWalletSummary(session.user.id),
    prisma.conversionJob.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return <main className="section">
    <div className="glass rounded-[2rem] p-6 sm:p-8">
      <p className="text-emerald-300">Dasbor ReiiKajurawa JvsB</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Dasbor</h1>
      <p className="muted mt-3 max-w-3xl">Kelola Coin, konversi Resource Pack, dan riwayat transaksi kamu dalam satu workspace aman.</p>
      <section className="mt-6 rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-5">
        <h2 className="text-2xl font-bold">Coin</h2>
        <p className="mt-3 text-4xl font-black">🪙 {wallet.wallet.balance}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link className="btn btn-primary" href="/coins">Beli Coin</Link><Link className="btn btn-secondary" href="/converter">Mulai Konversi</Link></div>
      </section>
    </div>

    <section className="mt-8 grid gap-5 lg:grid-cols-2">
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">Konversi Terbaru</h2><Link className="text-sm text-emerald-300" href="/history">Lihat semua</Link></div>
        <div className="mt-4 space-y-3">
          {jobs.map((job) => <div className="rounded-2xl border border-white/10 p-4 text-sm" key={job.id}>
            <div className="flex flex-col justify-between gap-2 sm:flex-row"><p className="font-semibold">{job.originalFilename}</p><span>{statusLabel[job.status] ?? job.status}</span></div>
            <div className="muted mt-2 flex flex-wrap gap-3"><span>{job.createdAt.toLocaleDateString("id-ID")}</span><span>{job.costCoins} Coin</span>{job.status === "COMPLETED" && <Link className="text-emerald-300" href={`/api/conversions/${job.id}/download`}>Unduh</Link>}</div>
          </div>)}
          {jobs.length === 0 && <p className="muted">Belum ada konversi.</p>}
        </div>
      </div>

      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">Transaksi Coin</h2><Link className="text-sm text-emerald-300" href="/transactions">Lihat semua</Link></div>
        <div className="mt-4 space-y-3">
          {wallet.transactions.slice(0, 5).map((tx) => <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-4 text-sm" key={tx.id}><div><p className="font-semibold">{transactionLabel[tx.type] ?? tx.description}</p><p className="muted">{tx.createdAt.toLocaleDateString("id-ID")} · {tx.status === "COMPLETED" ? "Berhasil" : tx.status}</p></div><span className={tx.amount > 0 ? "text-emerald-300" : "text-amber-300"}>{tx.amount > 0 ? "+" : ""}{tx.amount} Coin</span></div>)}
          {wallet.transactions.length === 0 && <p className="muted">Belum ada transaksi Coin.</p>}
        </div>
      </div>
    </section>
  </main>;
}
