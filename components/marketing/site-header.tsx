import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";

const links = [
  ["Services", "/services"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur"><nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"><Link href="/" className="text-sm font-black tracking-wide text-white sm:text-base">ReiiKajurawa<span className="text-cyan-300">.</span></Link><div className="hidden items-center gap-6 md:flex">{links.map(([label, href]) => <Link key={href} href={href} className="text-sm text-slate-300 transition hover:text-white">{label}</Link>)}</div><div className="flex items-center gap-2">{session ? <ButtonLink href="/dashboard" variant="secondary">Dashboard</ButtonLink> : <><Link href="/auth/login" className="hidden text-sm text-slate-300 hover:text-white sm:block">Login</Link><ButtonLink href="/auth/register">Start project</ButtonLink></>}</div></nav></header>;
}
