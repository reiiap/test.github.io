import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const paymentState: Record<string, string> = { PENDING: "Menunggu Pembayaran", PAID: "Pembayaran Berhasil", FAILED: "Pembayaran Gagal", EXPIRED: "Pesanan Kedaluwarsa", REFUNDED: "Pembayaran Dikembalikan" };

export default async function CoinCheckoutPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const { payment: externalId } = await searchParams;
  if (!externalId) redirect("/coins");
  const payment = await prisma.payment.findFirst({ where: { externalId, userId: session.user.id }, include: { order: true } });
  if (!payment) redirect("/coins");
  const state = payment.status === "PENDING" && payment.rawPayload ? "Menunggu Pembayaran" : paymentState[payment.status] ?? "Pembayaran Diproses";
  return <main className="section"><div className="glass rounded-[2rem] p-6 sm:p-8"><p className="text-emerald-300">Pembayaran Coin</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">{state}</h1><p className="muted mt-3 max-w-3xl">Coin hanya ditambahkan setelah webhook server yang tepercaya memverifikasi pembayaran. Halaman ini tidak pernah mengkredit Coin hanya dari callback browser.</p><div className="mt-6 grid gap-3 rounded-3xl border border-white/10 p-5 text-sm"><p><strong>Pesanan:</strong> {payment.order.title}</p><p><strong>Status:</strong> {paymentState[payment.status] ?? payment.status}</p><p><strong>Total:</strong> {new Intl.NumberFormat("id-ID", { style: "currency", currency: payment.currency, maximumFractionDigits: 0 }).format(payment.amount)}</p></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link className="btn btn-primary" href="/dashboard">Kembali ke Dasbor</Link><Link className="btn btn-secondary" href="/transactions">Lihat Transaksi</Link></div></div></main>;
}
