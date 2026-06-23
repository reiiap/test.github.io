import Link from "next/link";
import { MotionShell } from "@/components/motion-shell";
import { faqs, portfolio, pricing, services } from "@/lib/platform";

const stats = ["40+ launches", "99.9% uptime", "4 payment rails", "<100ms UI intent"];
const testimonials = [
  ["ReiiKajurawa shipped our SaaS portal faster than our internal team expected.", "Alya — Founder, NusaPay"],
  ["The dashboard feels premium, fast, and ready for enterprise demos.", "Raka — CTO, Vertex Labs"],
  ["Clear architecture, clean handoff, and Vercel deployment without drama.", "Mira — Ops Lead, FrameOps"],
];

export default function Home() {
  return (
    <main>
      <section className="section grid min-h-[86vh] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <MotionShell>
          <p className="mb-4 inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm text-sky-200">Premium full-stack agency platform</p>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">Build a client-ready SaaS platform with <span className="bg-gradient-to-r from-sky-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">ReiiKajurawa Studio</span>.</h1>
          <p className="muted mt-6 max-w-2xl text-lg">Strategy, design, engineering, auth, order management, payments architecture, and admin operations in one polished product system.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link className="btn btn-primary" href="/register">Start a project</Link><Link className="btn btn-secondary" href="#portfolio">View portfolio</Link></div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map((s) => <div className="glass rounded-2xl p-4 text-sm font-bold" key={s}>{s}</div>)}</div>
        </MotionShell>
        <MotionShell className="glass relative overflow-hidden rounded-[2rem] p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-violet-500/20" />
          <div className="relative rounded-3xl bg-black/30 p-5">
            <div className="mb-5 flex gap-2"><span className="h-3 w-3 rounded-full bg-red-400"/><span className="h-3 w-3 rounded-full bg-amber-300"/><span className="h-3 w-3 rounded-full bg-emerald-400"/></div>
            <pre className="overflow-hidden text-sm text-sky-100">{`platform.deploy({\n  auth: ['google','email','otp'],\n  orders: ['pending','processing','completed'],\n  payments: ['qris','ewallet','va'],\n  admin: true\n})`}</pre>
          </div>
        </MotionShell>
      </section>
      <section id="services" className="section"><h2 className="text-4xl font-black">Service catalog</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{services.map((s) => <article key={s.slug} className="glass rounded-3xl p-6"><h3 className="text-xl font-bold">{s.name}</h3><p className="muted mt-2">{s.description}</p><p className="mt-5 text-sky-300">From IDR {s.priceFrom.toLocaleString("id-ID")}</p></article>)}</div></section>
      <section id="portfolio" className="section"><h2 className="text-4xl font-black">Portfolio showcase</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{portfolio.map((p) => <article key={p.title} className="glass rounded-3xl p-6"><div className="mb-5 h-36 rounded-2xl bg-gradient-to-br from-sky-400/30 to-violet-500/30"/><h3 className="text-xl font-bold">{p.title}</h3><p className="muted mt-2">{p.summary}</p><div className="mt-4 flex gap-2">{p.tags.map((t) => <span className="rounded-full bg-white/10 px-3 py-1 text-xs" key={t}>{t}</span>)}</div></article>)}</div></section>
      <section className="section"><h2 className="text-4xl font-black">Pricing</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{pricing.map((p) => <article key={p.name} className="glass rounded-3xl p-6"><h3 className="text-xl font-bold">{p.name}</h3><p className="mt-4 text-3xl font-black">{p.price}</p><p className="muted mt-3">{p.description}</p></article>)}</div></section>
      <section className="section grid gap-4 md:grid-cols-3">{testimonials.map(([q, a]) => <blockquote className="glass rounded-3xl p-6" key={a}><p>“{q}”</p><footer className="mt-4 text-sm text-sky-300">{a}</footer></blockquote>)}</section>
      <section className="section"><h2 className="text-4xl font-black">FAQ</h2><div className="mt-8 grid gap-4">{faqs.map(([q, a]) => <details className="glass rounded-2xl p-5" key={q}><summary className="cursor-pointer font-bold">{q}</summary><p className="muted mt-3">{a}</p></details>)}</div></section>
      <section id="contact" className="section"><div className="glass rounded-[2rem] p-10 text-center"><h2 className="text-4xl font-black">Ready to sell a better digital product?</h2><p className="muted mx-auto mt-3 max-w-2xl">Create an account, submit an order, and track delivery from dashboard to invoice.</p><Link className="btn btn-primary mt-8" href="/register">Launch client portal</Link></div></section>
    </main>
  );
}
