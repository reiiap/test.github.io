import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function Converter() {
  const session = await getServerSession(authOptions);

  return (
    <main className="section">
      <div className="glass rounded-[2rem] p-8">
        <p className="text-emerald-300">Konverter Resource Pack</p>
        <h1 className="mt-3 text-5xl font-black">Mulai Conversion Java Edition ke Bedrock Edition.</h1>
        <p className="muted mt-4 max-w-3xl">Fase ini menyiapkan UI dan jalur authenticated workflow. Engine Conversion, Coin ledger, upload storage, dan payment checkout akan ditambahkan pada fase berikutnya.</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="glass rounded-3xl p-6">
          <h2 className="text-2xl font-bold">Unggah Resource Pack Java</h2>
          <div className="mt-5 rounded-3xl border border-dashed border-emerald-300/40 bg-black/20 p-10 text-center">
            <p className="text-lg font-bold">File ZIP Java Edition</p>
            <p className="muted mt-2">Upload aktif akan dihubungkan ke storage dan validasi pada fase engine.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {['Konversi Texture', 'Konversi Model', 'Konversi Animation', 'Validasi manifest'].map((option) => <label className="rounded-2xl border border-white/10 bg-white/5 p-4" key={option}><input className="mr-3" type="checkbox" disabled />{option}</label>)}
          </div>
          {session?.user ? <button className="btn btn-primary mt-6" disabled>Konversi segera tersedia</button> : <Link className="btn btn-primary mt-6" href="/login">Login untuk Mulai Konversi</Link>}
        </section>
        <aside className="glass rounded-3xl p-6">
          <h2 className="text-2xl font-bold">Ringkasan</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="flex justify-between gap-4"><dt className="muted">Saldo Coin</dt><dd>—</dd></div>
            <div className="flex justify-between gap-4"><dt className="muted">Estimasi Coin</dt><dd>Konfigurasi</dd></div>
            <div className="flex justify-between gap-4"><dt className="muted">Status</dt><dd>{session?.user ? 'Siap disiapkan' : 'Perlu login'}</dd></div>
          </dl>
          <Link className="btn btn-secondary mt-6 w-full" href="/#harga-coin">Beli Coin</Link>
        </aside>
      </div>
    </main>
  );
}
