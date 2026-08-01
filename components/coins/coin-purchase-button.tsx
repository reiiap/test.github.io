"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CoinPurchaseButton({ packageId, disabled }: { packageId: string; disabled?: boolean }) {
  const router = useRouter();
  async function buy() {
    const res = await fetch("/api/coins/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId, idempotencyKey: crypto.randomUUID() }) });
    const json = await res.json().catch(() => ({ error: "Respons server tidak valid." }));
    if (!res.ok) return toast.error(json.error ?? "Pembelian gagal.");
    toast.success("Pesanan dibuat. Selesaikan pembayaran untuk menerima Coin.");
    if (json.checkoutUrl) window.location.href = json.checkoutUrl;
    else router.refresh();
  }
  return <button className="btn btn-primary mt-6 w-full" disabled={disabled} onClick={buy}>{disabled ? "Belum Tersedia" : "Beli Coin"}</button>;
}
