import { getServerSession } from "next-auth";
import Link from "next/link";
import { getCoinPackages, formatPrice } from "@/lib/wallet/packages";
import { authOptions } from "@/lib/auth";
import { getWalletSummary } from "@/lib/wallet/server";
import { CoinPurchaseButton } from "@/components/coins/coin-purchase-button";

export default async function CoinsPage() {
  const session = await getServerSession(authOptions);
  const summary = session?.user ? await getWalletSummary(session.user.id) : null;
  const packages = getCoinPackages();
  return <main className="section"><div className="glass rounded-[2rem] p-6 sm:p-8"><p className="text-emerald-300">Coin Store</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Beli Coin</h1><p className="muted mt-4 max-w-3xl">Gunakan Coin untuk melakukan konversi Resource Pack Java ke Bedrock.</p><p className="muted mt-2 max-w-3xl text-sm">Jumlah Coin, harga, dan identitas paket selalu diselesaikan di server. Harga komersial final dikonfigurasi lewat <code>COIN_PACKAGES_JSON</code>.</p>{summary && <p className="mt-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-emerald-100">🪙 {summary.wallet.balance} Coin</p>}</div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{packages.map((pack) => <article className="glass flex flex-col rounded-3xl p-6" key={pack.id}><h2 className="text-xl font-bold">{pack.name}</h2><p className="mt-4 text-3xl font-black">{pack.coins} Coin</p><p className="mt-2 font-semibold text-emerald-200">{formatPrice(pack)}</p><p className="muted mt-3 flex-1">{pack.description}</p>{session?.user ? <CoinPurchaseButton packageId={pack.id} disabled={!pack.priceIdr} /> : <Link className="btn btn-primary mt-6 w-full" href="/login">Login untuk Beli</Link>}</article>)}</div></main>;
}
