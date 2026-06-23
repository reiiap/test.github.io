import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";
export const metadata: Metadata = { title: "ReiiKajurawa Studio | Developer SaaS Platform", description: "Premium developer studio for web platforms, automation, and authenticated SaaS experiences.", openGraph: { title: "ReiiKajurawa Studio", description: "Build futuristic developer products with production-ready auth and dashboards." } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers><Nav />{children}</Providers></body></html>; }
