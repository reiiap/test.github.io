import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "ReiiKajurawa JvsB | Java ke Bedrock Resource Pack Converter",
  description: "Konversi Resource Pack Minecraft Java Edition menjadi Resource Pack Bedrock dengan alur sederhana, aman, dan siap untuk sistem Coin.",
  openGraph: {
    title: "ReiiKajurawa JvsB",
    description: "Java Edition → Bedrock Edition Resource Pack Converter.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><Providers><Nav />{children}</Providers></body></html>;
}
