export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getActiveServices } from "@/server/services/services";
import { formatCurrency } from "@/lib/format";

const testimonials = [
  ["The team shipped our SaaS dashboard faster than expected and with a clean production architecture.", "Nadia, Startup Founder"],
  ["ReiiKajurawa transformed our manual process into a secure platform our clients love.", "Arif, Agency Owner"],
  ["Excellent communication, strong engineering decisions, and Vercel deployment done right.", "Mika, Product Lead"],
];

export default async function Home() {
  const services = await getActiveServices();
  return <main><section className="section relative overflow-hidden"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(129,140,248,.2),transparent_35%)]" /><div className="max-w-3xl"><p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">Premium development agency</p><h1 className="text-5xl font-black tracking-tight sm:text-7xl">ReiiKajurawa Development Service</h1><p className="mt-6 text-lg leading-8 text-slate-300">We build secure, scalable SaaS products, dashboards, and business platforms with modern Next.js, PostgreSQL, Prisma, and Vercel infrastructure.</p><div className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/contact">Book a project call</ButtonLink><ButtonLink href="/services" variant="secondary">Explore services</ButtonLink></div></div></section><section className="section"><div className="mb-10 flex items-end justify-between gap-4"><div><p className="text-cyan-300">Services</p><h2 className="mt-2 text-3xl font-black">Database-driven delivery offers</h2></div><ButtonLink href="/services" variant="ghost">View all</ButtonLink></div><div className="grid gap-6 md:grid-cols-3">{services.slice(0,3).map((service) => <Card key={service.id}><h3 className="text-xl font-bold">{service.title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{service.description}</p><p className="mt-6 font-bold text-cyan-300">{formatCurrency(service.price)}</p></Card>)}</div></section><section className="section grid gap-6 md:grid-cols-3"><Card><h3 className="font-bold">Secure by default</h3><p className="mt-3 text-slate-300">Credentials auth, hashed passwords, validation, protected dashboards, and least-privilege admin flows.</p></Card><Card><h3 className="font-bold">Built to scale</h3><p className="mt-3 text-slate-300">Clean App Router architecture with Prisma-backed data models and production deployment paths.</p></Card><Card><h3 className="font-bold">Premium UX</h3><p className="mt-3 text-slate-300">Dark SaaS design, glass cards, responsive layouts, subtle motion, and clear conversion flows.</p></Card></section><section className="section"><h2 className="text-3xl font-black">Trusted by ambitious teams</h2><div className="mt-8 grid gap-6 md:grid-cols-3">{testimonials.map(([quote, person]) => <Card key={person}><p className="text-slate-200">“{quote}”</p><p className="mt-5 text-sm font-semibold text-cyan-300">{person}</p></Card>)}</div></section></main>;
}
