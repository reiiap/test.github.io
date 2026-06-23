import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/marketing/site-header";
import { Footer } from "@/components/marketing/footer";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ReiiKajurawa Development Service",
  description: "Production-grade SaaS, web, and cloud development agency.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><div className="min-h-screen bg-slate-950 text-white"><SiteHeader />{children}<Footer /></div></Providers></body></html>;
}
