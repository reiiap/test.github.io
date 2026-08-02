import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const typeLabel: Record<string, string> = { CREDIT_PURCHASE: "Pembelian Coin", CREDIT_BONUS: "Bonus Coin", CREDIT_ADMIN: "Penyesuaian Admin", DEBIT_CONVERSION: "Konversi Resource Pack", REFUND_CONVERSION: "Pengembalian konversi", DEBIT_ADJUSTMENT: "Penyesuaian debit", CREDIT_ADJUSTMENT: "Penyesuaian kredit" };
const statusLabel: Record<string, string> = { COMPLETED: "Berhasil", PENDING: "Menunggu", FAILED: "Gagal", CANCELLED: "Dibatalkan" };

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const transactions = await prisma.coinTransaction.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <main className="section"><div className="glass rounded-[2rem] p-6 sm:p-8"><p className="text-emerald-300">Riwayat Coin</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Transaksi Coin</h1><p className="muted mt-3">Semua transaksi hanya diambil dari sesi akun kamu.</p></div><div className="mt-6 overflow-hidden rounded-3xl border border-white/10"><div className="grid grid-cols-2 gap-3 bg-white/5 p-4 text-sm font-bold sm:grid-cols-5"><span>Tanggal</span><span>Jenis</span><span className="hidden sm:block">Keterangan</span><span className="hidden sm:block">Jumlah</span><span className="hidden sm:block">Status</span></div>{transactions.map((tx) => <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-4 text-sm sm:grid-cols-5" key={tx.id}><span>{tx.createdAt.toLocaleString("id-ID")}</span><span>{typeLabel[tx.type] ?? tx.type}</span><span className="hidden sm:block">{tx.description}</span><span className={tx.amount > 0 ? "text-emerald-300" : "text-amber-300"}>{tx.amount > 0 ? "+" : ""}{tx.amount} Coin</span><span>{statusLabel[tx.status] ?? tx.status}</span></div>)}{transactions.length === 0 && <p className="muted border-t border-white/10 p-4">Belum ada transaksi Coin.</p>}</div></main>;
}
