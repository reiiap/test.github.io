import Link from "next/link";
import { getCoinPackages } from "@/lib/wallet/packages";
import { prisma } from "@/lib/prisma";
import { idr, requireAdmin } from "./_helpers";

export default async function Admin() {
  await requireAdmin();
  const [users, orders, payments, conversions, failedConversions, coinTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.conversionJob.count(),
    prisma.conversionJob.count({ where: { status: "FAILED" } }),
    prisma.coinTransaction.count(),
  ]);
  const cards = [
    ["Pengguna", users.toLocaleString("id-ID"), "/admin/users"],
    ["Pesanan", orders.toLocaleString("id-ID"), "/admin/orders"],
    ["Pembayaran", `${payments._count.toLocaleString("id-ID")} · ${idr(payments._sum.amount ?? 0)}`, "/admin/payments"],
    ["Konversi", conversions.toLocaleString("id-ID"), "/admin/orders"],
    ["Konversi Gagal", failedConversions.toLocaleString("id-ID"), "/admin/orders?status=FAILED"],
    ["Transaksi Coin", coinTransactions.toLocaleString("id-ID"), "/admin/payments"],
    ["Paket Coin", getCoinPackages().length.toLocaleString("id-ID"), "/admin/content"],
  ];
  return <main className="section"><h1 className="text-5xl font-black">Admin ReiiKajurawa JvsB</h1><p className="muted mt-3">Audit operasional berbasis data nyata untuk pengguna, Coin, pembayaran, pesanan, dan konversi.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([k, v, h]) => <Link href={String(h)} className="glass rounded-3xl p-6" key={String(k)}><p className="muted">{k}</p><p className="mt-2 text-2xl font-black">{v}</p></Link>)}</div></main>;
}
