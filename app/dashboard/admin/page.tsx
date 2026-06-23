import { ServiceStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { deleteService, toggleService, upsertService } from "@/server/actions/services";
import { getAllServices, getDashboardStats } from "@/server/services/services";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [stats, users, services] = await Promise.all([
    getDashboardStats(),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    getAllServices(),
  ]);

  return <main className="section"><div><p className="text-cyan-300">Admin</p><h1 className="mt-2 text-4xl font-black">Operations dashboard</h1></div><div className="mt-8 grid gap-6 md:grid-cols-3"><Card><p className="text-sm text-slate-400">Users</p><p className="mt-2 text-4xl font-black">{stats.users}</p></Card><Card><p className="text-sm text-slate-400">Services</p><p className="mt-2 text-4xl font-black">{stats.services}</p></Card><Card><p className="text-sm text-slate-400">Active services</p><p className="mt-2 text-4xl font-black">{stats.activeServices}</p></Card></div><section className="mt-10 grid gap-8 lg:grid-cols-[420px_1fr]"><Card><h2 className="text-2xl font-black">Create service</h2><form action={upsertService} className="mt-6 space-y-4"><input name="title" required placeholder="Service title" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3" /><textarea name="description" required minLength={20} rows={5} placeholder="Service description" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3" /><input name="price" type="number" min="1" placeholder="Price in IDR" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3" /><select name="status" defaultValue={ServiceStatus.ACTIVE} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><Button className="w-full">Save service</Button></form></Card><div className="space-y-4">{services.map((service) => <Card key={service.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-cyan-300">{service.status}</p><h3 className="text-xl font-bold">{service.title}</h3><p className="mt-2 text-sm text-slate-300">{service.description}</p><p className="mt-3 font-semibold">{formatCurrency(service.price)}</p></div><div className="flex gap-2"><form action={toggleService.bind(null, service.id)}><Button variant="secondary">Toggle</Button></form><form action={deleteService.bind(null, service.id)}><Button variant="ghost">Delete</Button></form></div></div></Card>)}</div></section><section className="mt-10"><h2 className="text-2xl font-black">Recent users</h2><div className="mt-6 grid gap-4">{users.map((user) => <Card key={user.id} className="flex items-center justify-between"><div><p className="font-bold">{user.name}</p><p className="text-sm text-slate-400">{user.email}</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{user.role}</span></Card>)}</div></section></main>;
}
