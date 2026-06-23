import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const base = "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60";
const variants = {
  primary: "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-200",
  secondary: "border border-white/15 bg-white/10 text-white hover:bg-white/15",
  ghost: "text-slate-200 hover:bg-white/10",
};

type Variant = keyof typeof variants;

export function Button({ variant = "primary", className = "", ...props }: ComponentPropsWithoutRef<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: Variant; className?: string }) {
  return <Link href={href} className={`${base} ${variants[variant]} ${className}`}>{children}</Link>;
}
