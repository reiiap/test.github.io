import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { idr, requireAdmin } from "../../_helpers";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true, role: true, provider: true, createdAt: true,
      coinWallet: { select: { balance: true } },
      coinTransactions: { orderBy: { createdAt: "desc" }, take: 10 },
      conversions: { orderBy: { createdAt: "desc" }, take: 10 },
      orders: { orderBy: { createdAt: "desc" }, take: 10, include: { payments: { select: { status: true, amount: true, currency: true, provider: true, createdAt: true } } } },
    },
  });
  if (!user) notFound();
  return <main className="section"><h1 className="text-4xl font-black">Detail Pengguna</h1><p className="muted mt-3">{user.name ?? "Tanpa nama"} · {user.email ?? user.phone ?? "Kontak belum lengkap"} · {user.role}</p><section className="mt-6 grid gap-4 lg:grid-cols-3"><div className="glass rounded-3xl p-5"><p className="muted">Saldo Coin</p><p className="mt-2 text-3xl font-black">🪙 {user.coinWallet?.balance ?? 0}</p></div><div className="glass rounded-3xl p-5"><p className="muted">Provider</p><p className="mt-2 text-2xl font-bold">{user.provider}</p></div><div className="glass rounded-3xl p-5"><p className="muted">Bergabung</p><p className="mt-2 text-2xl font-bold">{user.createdAt.toLocaleDateString("id-ID")}</p></div></section><section className="mt-8 grid gap-5 lg:grid-cols-2"><div className="glass rounded-3xl p-5"><h2 className="text-2xl font-bold">Transaksi Coin</h2>{user.coinTransactions.map((tx) => <p className="mt-3 flex justify-between gap-3 text-sm" key={tx.id}><span>{tx.description}</span><span>{tx.amount > 0 ? "+" : ""}{tx.amount} Coin · {tx.status}</span></p>)}{user.coinTransactions.length === 0 && <p className="muted mt-3">Belum ada transaksi.</p>}</div><div className="glass rounded-3xl p-5"><h2 className="text-2xl font-bold">Konversi</h2>{user.conversions.map((job) => <p className="mt-3 text-sm" key={job.id}>{job.originalFilename} · {job.status} · {job.costCoins} Coin</p>)}{user.conversions.length === 0 && <p className="muted mt-3">Belum ada konversi.</p>}</div><div className="glass rounded-3xl p-5 lg:col-span-2"><h2 className="text-2xl font-bold">Pesanan & Pembayaran</h2>{user.orders.map((order) => <div className="mt-3 rounded-2xl border border-white/10 p-4 text-sm" key={order.id}><p className="font-semibold">{order.title} · {order.status} · {idr(order.amount)}</p>{order.payments.map((payment) => <p className="muted mt-1" key={`${order.id}-${payment.createdAt.toISOString()}`}>{payment.provider} · {payment.status} · {idr(payment.amount)}</p>)}</div>)}{user.orders.length === 0 && <p className="muted mt-3">Belum ada pesanan.</p>}</div></section></main>;
}
