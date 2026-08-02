import Link from "next/link";
import { MotionShell } from "@/components/motion-shell";
import { coinPackages, compatibility, conversionSteps, faqs, features } from "@/lib/platform";

export default function Home() {
  return (
    <main>
      <section className="section grid min-h-[86vh] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <MotionShell>
          <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
            Java Edition → Bedrock Edition Resource Pack Converter
          </p>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Konversi Resource Pack Java ke <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">Bedrock</span>
          </h1>
          <p className="muted mt-6 max-w-2xl text-lg">
            Ubah Resource Pack Minecraft Java Edition menjadi Resource Pack Bedrock dengan proses yang sederhana dan praktis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/converter">Mulai Konversi</Link>
            <Link className="btn btn-secondary" href="#harga-coin">Lihat Harga Coin</Link>
          </div>
        </MotionShell>
        <MotionShell className="glass relative overflow-hidden rounded-[2rem] p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-sky-500/20" />
          <div className="relative grid gap-4 text-center">
            {[
              ["Java Edition", "Resource Pack .zip"],
              ["ReiiKajurawa JvsB", "Pilih opsi Konversi"],
              ["Bedrock Edition", "Pack siap digunakan"],
            ].map(([title, subtitle], index) => (
              <div key={title}>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-xl font-black text-white">{title}</p>
                  <p className="muted mt-1 text-sm">{subtitle}</p>
                </div>
                {index < 2 && <div className="py-2 text-3xl text-emerald-300">↓</div>}
              </div>
            ))}
          </div>
        </MotionShell>
      </section>

      <section className="section" id="cara-kerja">
        <h2 className="text-4xl font-black">Cara Kerja</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {conversionSteps.map((item) => (
            <article className="glass rounded-3xl p-6" key={item.step}>
              <p className="text-emerald-300">{item.step}</p>
              <h3 className="mt-3 text-2xl font-bold">{item.title}</h3>
              <p className="muted mt-3">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="konverter-preview">
        <div className="glass grid gap-8 rounded-[2rem] p-8 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-emerald-300">Preview Konverter</p>
            <h2 className="mt-3 text-4xl font-black">Unggah, atur opsi, lalu proses.</h2>
            <p className="muted mt-4">Pengunjung dapat melihat alur ini. Untuk Konversi berbayar, pengguna akan diarahkan login sebelum membuat order.</p>
            <Link className="btn btn-primary mt-6" href="/converter">Mulai Konversi</Link>
          </div>
          <div className="rounded-3xl border border-dashed border-emerald-300/40 bg-black/20 p-6">
            <p className="font-bold">Unggah Resource Pack</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">Drop file ZIP Java Edition di sini</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {['Texture', 'Model', 'Animation', 'ZIP validation'].map((option) => <span className="rounded-full bg-white/10 px-4 py-2 text-sm" key={option}>{option}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="harga-coin">
        <h2 className="text-4xl font-black">Harga Coin</h2>
        <p className="muted mt-3">Gunakan Coin untuk melakukan konversi. Harga final belum dikonfigurasi dan akan dihubungkan ke arsitektur payment yang sudah ada.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {coinPackages.map((pack) => (
            <article className="glass rounded-3xl p-6" key={pack.name}>
              <h3 className="text-xl font-bold">{pack.name}</h3>
              <p className="mt-4 text-3xl font-black">{pack.coins}</p>
              <p className="muted mt-3">{pack.description}</p>
              <Link className="btn btn-secondary mt-6" href="/dashboard/payments">Beli Coin</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="features"><h2 className="text-4xl font-black">Fitur Produk</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{features.map((f) => <article className="glass rounded-3xl p-6" key={f.title}><h3 className="text-xl font-bold">{f.title}</h3><p className="muted mt-2">{f.description}</p></article>)}</div></section>
      <section className="section"><h2 className="text-4xl font-black">Kompatibilitas Konversi</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{compatibility.map(([k, v]) => <article className="glass rounded-3xl p-6" key={k}><h3 className="text-xl font-bold">{k}</h3><p className="muted mt-2">{v}</p></article>)}</div></section>
      <section className="section"><h2 className="text-4xl font-black">FAQ</h2><div className="mt-8 grid gap-4">{faqs.map(([q, a]) => <details className="glass rounded-2xl p-5" key={q}><summary className="cursor-pointer font-bold">{q}</summary><p className="muted mt-3">{a}</p></details>)}</div></section>
      <section className="section"><div className="glass rounded-[2rem] p-10 text-center"><h2 className="text-4xl font-black">Siap mengubah Resource Pack kamu?</h2><p className="muted mx-auto mt-3 max-w-2xl">Unggah Resource Pack Java kamu, pilih opsi konversi, dan dapatkan Resource Pack Bedrock yang siap digunakan.</p><div className="mt-8 flex justify-center gap-3"><Link className="btn btn-primary" href="/converter">Mulai Konversi</Link><Link className="btn btn-secondary" href="#harga-coin">Beli Coin</Link></div></div></section>
      <footer className="section pt-0"><div className="border-t border-white/10 pt-8 text-sm text-slate-400">© 2026 ReiiKajurawa JvsB. Resource Pack Converter untuk Minecraft Java Edition ke Bedrock Edition.</div></footer>
    </main>
  );
}
