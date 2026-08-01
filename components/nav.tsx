"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function Nav() {
  const { data } = useSession();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!data?.user) return;
    fetch("/api/wallet", { cache: "no-store" }).then((res) => res.ok ? res.json() : null).then((json) => { if (json) setBalance(json.balance); }).catch(() => setBalance(null));
  }, [data?.user]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816cc] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-black tracking-tight">
          ReiiKajurawa <span className="text-emerald-300">JvsB</span>
        </Link>
        <div className="hidden gap-6 text-sm text-slate-300 lg:flex">
          <Link href="/">Beranda</Link>
          <Link href="/converter">Konverter</Link>
          <Link href="/coins">Harga Coin</Link>
          <Link href="/dashboard/orders">Riwayat</Link>
          <Link href="/dashboard/tickets">Bantuan</Link>
        </div>
        <div className="flex items-center gap-2">
          {data?.user ? (
            <>
              <Link href="/coins" className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100 sm:inline-flex">
                🪙 {balance ?? "—"} Coin
              </Link>
              <Link className="btn btn-secondary px-4 py-2" href="/dashboard">Dasbor</Link>
              <Link className="btn btn-secondary px-4 py-2" href="/profile">Akun</Link>
              <button className="btn btn-primary px-4 py-2" onClick={() => signOut({ callbackUrl: "/" })}>Keluar</button>
            </>
          ) : (
            <>
              <Link className="btn btn-secondary px-4 py-2" href="/login">Login</Link>
              <Link className="btn btn-secondary px-4 py-2" href="/register">Daftar</Link>
              <Link className="btn btn-primary hidden px-4 py-2 sm:inline-flex" href="/converter">Mulai Konversi</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
