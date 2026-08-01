"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CoinPurchaseButton({ packageId }: { packageId: string }) { const router=useRouter(); async function buy(){const res=await fetch('/api/coins/purchase',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({packageId,idempotencyKey:crypto.randomUUID()})});const json=await res.json();if(!res.ok) return toast.error(json.error??'Pembelian gagal.');toast.success('Coin ditambahkan.');router.refresh();} return <button className="btn btn-primary mt-6" onClick={buy}>Simulasi Beli Coin</button>; }
