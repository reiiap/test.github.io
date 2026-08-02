import { getServerSession } from "next-auth";
import Link from "next/link";
import { ConverterClient } from "@/components/converter/converter-client";
import { authOptions } from "@/lib/auth";

export default async function Converter() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <main className="section"><div className="glass rounded-[2rem] p-8"><p className="text-emerald-300">Konverter Resource Pack</p><h1 className="mt-3 text-5xl font-black">Login untuk Mulai Konversi.</h1><p className="muted mt-4 max-w-3xl">Unggah, Analisis, Opsi, Cost, Konfirmasi, Processing, dan Unduh hanya tersedia untuk akun terautentikasi.</p><Link className="btn btn-primary mt-6" href="/login">Login untuk Mulai Konversi</Link></div></main>;
  }
  return <main className="section"><div className="glass rounded-[2rem] p-8"><p className="text-emerald-300">Konverter Resource Pack</p><h1 className="mt-3 text-5xl font-black">Java Edition → Bedrock Edition.</h1><p className="muted mt-4 max-w-3xl">Unggah Resource Pack ZIP, lihat hasil analisis, konfirmasi estimasi Coin dari server, lalu antrekan konversi. Fase ini mendukung packaging Texture PNG ke format .mcpack dan menyertakan model Java sebagai referensi, bukan kompatibilitas penuh.</p></div><div className="mt-8"><ConverterClient /></div></main>;
}
