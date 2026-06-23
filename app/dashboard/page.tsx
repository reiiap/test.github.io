import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { authOptions } from "@/lib/auth";
import { getActiveServices } from "@/server/services/services";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  const services = await getActiveServices();
  return <main className="section"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-cyan-300">Dashboard</p><h1 className="mt-2 text-4xl font-black">Hello, {session.user.name}</h1></div><div className="flex gap-3">{session.user.role === "ADMIN" ? <ButtonLink href="/dashboard/admin" variant="secondary">Admin</ButtonLink> : null}<LogoutButton /></div></div><div className="mt-10 grid gap-6 lg:grid-cols-3"><Card><p className="text-sm text-slate-400">Account</p><h2 className="mt-2 text-xl font-bold">{session.user.email}</h2><p className="mt-3 text-sm text-slate-300">Role: {session.user.role.toLowerCase()}</p></Card><Card><p className="text-sm text-slate-400">Active services</p><h2 className="mt-2 text-3xl font-black">{services.length}</h2><p className="mt-3 text-sm text-slate-300">Available for new project requests.</p></Card><Card><p className="text-sm text-slate-400">Project status</p><h2 className="mt-2 text-xl font-bold">Discovery ready</h2><p className="mt-3 text-sm text-slate-300">Contact the team to turn a selected service into an active engagement.</p></Card></div><section className="mt-10"><h2 className="text-2xl font-black">Recommended services</h2><div className="mt-6 grid gap-6 md:grid-cols-3">{services.slice(0, 3).map((service) => <Card key={service.id}><h3 className="font-bold">{service.title}</h3><p className="mt-3 text-sm text-slate-300">{service.description}</p><p className="mt-5 text-cyan-300">{formatCurrency(service.price)}</p></Card>)}</div></section><section className="mt-10"><Card><h2 className="text-2xl font-black">Account settings</h2><p className="mt-3 text-slate-300">Profile, billing, and notification preferences are ready to extend from this secure dashboard foundation.</p></Card></section></main>;
}
