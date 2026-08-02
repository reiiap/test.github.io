import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../_helpers";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const query = q.trim();
  const users = await prisma.user.findMany({
    where: query ? { OR: [{ email: { contains: query, mode: "insensitive" } }, { name: { contains: query, mode: "insensitive" } }, { phone: { contains: query } }] } : undefined,
    select: { id: true, name: true, email: true, phone: true, role: true, provider: true, createdAt: true, coinWallet: { select: { balance: true } }, _count: { select: { conversions: true, orders: true, payments: true, coinTransactions: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return <main className="section"><h1 className="text-4xl font-black">Admin Pengguna</h1><p className="muted mt-3">Cari dan audit pengguna tanpa menampilkan password, token, atau secret.</p><form className="mt-6 flex flex-col gap-3 sm:flex-row"><input className="input" name="q" defaultValue={query} placeholder="Cari nama, email, atau telepon" /><button className="btn btn-primary">Cari</button></form><div className="mt-8 space-y-3">{users.map((user) => <article className="glass rounded-3xl p-5" key={user.id}><div className="flex flex-col justify-between gap-3 lg:flex-row"><div><h2 className="text-xl font-bold">{user.name ?? "Tanpa nama"}</h2><p className="muted text-sm">{user.email ?? user.phone ?? "Kontak belum lengkap"} · {user.role} · {user.provider}</p></div><p className="text-2xl font-black">🪙 {user.coinWallet?.balance ?? 0}</p></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-4"><span>{user._count.coinTransactions} transaksi Coin</span><span>{user._count.conversions} konversi</span><span>{user._count.orders} pesanan</span><span>{user._count.payments} pembayaran</span></div><Link className="mt-4 inline-flex text-sm text-emerald-300" href={`/admin/users/${user.id}`}>Lihat detail</Link></article>)}</div></main>;
}
