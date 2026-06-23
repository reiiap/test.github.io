export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getActiveServices } from "@/server/services/services";

export default async function ServicesPage() {
  const services = await getActiveServices();
  return <main className="section"><div className="max-w-3xl"><p className="text-cyan-300">Services</p><h1 className="mt-2 text-4xl font-black">Production services for serious teams</h1><p className="mt-4 text-slate-300">Every offer is backed by discovery, architecture, delivery, QA, deployment, and post-launch support.</p></div>{services.length === 0 ? <div className="mt-10"><EmptyState title="No active services" description="The team is updating the service catalog. Please contact us for a custom quote." /></div> : <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{services.map((service) => <Card key={service.id} className="flex flex-col"><h2 className="text-xl font-bold">{service.title}</h2><p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{service.description}</p><div className="mt-6 flex items-center justify-between gap-4"><span className="font-bold text-cyan-300">{formatCurrency(service.price)}</span><ButtonLink href="/contact" variant="secondary">Request</ButtonLink></div></Card>)}</div>}</main>;
}
