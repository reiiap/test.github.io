import { getServerSession } from "next-auth";
import Link from "next/link";
import { getCoinPackages } from "@/lib/wallet/packages";
import { authOptions } from "@/lib/auth";
import { getWalletSummary } from "@/lib/wallet/server";
import { CoinPurchaseButton } from "@/components/coins/coin-purchase-button";

export default async function CoinsPage(){const session=await getServerSession(authOptions);const summary=session?.user?await getWalletSummary(session.user.id):null;return <main className="section"><div className="glass rounded-[2rem] p-8"><p className="text-emerald-300">Coin Store</p><h1 className="mt-3 text-5xl font-black">Beli Coin untuk Conversion.</h1><p className="muted mt-4 max-w-3xl">Paket Coin masih placeholder konfigurasi aplikasi/admin. Nilai Coin ditentukan server-side dan tidak pernah dipercaya dari browser.</p>{summary&&<p className="mt-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-emerald-100">🪙 {summary.wallet.balance} Coin</p>}</div><div className="mt-8 grid gap-4 md:grid-cols-4">{getCoinPackages().map((pack)=><article className="glass rounded-3xl p-6" key={pack.id}><h2 className="text-xl font-bold">{pack.name}</h2><p className="mt-4 text-3xl font-black">{pack.coins} Coin</p><p className="muted mt-3">{pack.description}</p>{session?.user?<CoinPurchaseButton packageId={pack.id}/>:<Link className="btn btn-primary mt-6" href="/login">Login untuk Beli</Link>}</article>)}</div></main>}
