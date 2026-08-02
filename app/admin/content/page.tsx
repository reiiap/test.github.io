import { getCoinPackages, formatPrice } from "@/lib/wallet/packages";
import { requireAdmin } from "../_helpers";

export default async function AdminContentPage() {
  await requireAdmin();
  const packages = getCoinPackages();
  return <main className="section"><h1 className="text-4xl font-black">Admin Paket Coin</h1><p className="muted mt-3">Konfigurasi paket dibaca dari server melalui <code>COIN_PACKAGES_JSON</code>. Browser tidak menjadi sumber harga final.</p><div className="mt-8 overflow-hidden rounded-3xl border border-white/10"><div className="grid grid-cols-2 gap-3 bg-white/5 p-4 text-sm font-bold md:grid-cols-5"><span>Paket</span><span>Coin</span><span className="hidden md:block">Harga</span><span className="hidden md:block">Status</span><span className="hidden md:block">Keterangan</span></div>{packages.map((pack) => <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-4 text-sm md:grid-cols-5" key={pack.id}><span>{pack.name}</span><span>{pack.coins.toLocaleString("id-ID")} Coin</span><span className="hidden md:block">{formatPrice(pack)}</span><span className="hidden md:block">{pack.active ? "Aktif" : "Nonaktif"}</span><span className="hidden md:block">{pack.description}</span></div>)}</div></main>;
}
