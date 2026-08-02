import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../_helpers";

export default async function AdminTicketsPage() {
  await requireAdmin();
  const tickets = await prisma.ticket.findMany({ include: { user: { select: { name: true, email: true, phone: true } }, messages: { select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 50 });
  return <main className="section"><h1 className="text-4xl font-black">Admin Tiket</h1><p className="muted mt-3">Pantau tiket bantuan pengguna tanpa membuka secret atau token.</p><div className="mt-8 space-y-3">{tickets.map((ticket) => <article className="glass rounded-3xl p-5 text-sm" key={ticket.id}><div className="flex flex-col justify-between gap-2 lg:flex-row"><p className="font-semibold">{ticket.subject} · {ticket.status}</p><p>{ticket.updatedAt.toLocaleString("id-ID")}</p></div><p className="muted">{ticket.user.name ?? ticket.user.email ?? ticket.user.phone ?? "Pengguna"} · Prioritas {ticket.priority}</p></article>)}{tickets.length === 0 && <p className="muted">Belum ada tiket.</p>}</div></main>;
}
