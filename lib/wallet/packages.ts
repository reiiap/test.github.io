export type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  description: string;
  active: boolean;
  priceIdr?: number;
};

const defaults: CoinPackage[] = [
  { id: "STARTER", name: "Starter", coins: 50, description: "Paket awal untuk mencoba konversi Resource Pack.", active: true },
  { id: "CREATOR", name: "Creator", coins: 150, description: "Paket untuk creator Resource Pack.", active: true },
  { id: "PRO", name: "Pro", coins: 500, description: "Paket untuk kebutuhan konversi rutin.", active: true },
  { id: "STUDIO", name: "Studio", coins: 1500, description: "Paket besar untuk studio atau tim.", active: true },
];

function isPackage(value: unknown): value is CoinPackage {
  if (!value || typeof value !== "object") return false;
  const pack = value as Record<string, unknown>;
  return typeof pack.id === "string" && typeof pack.name === "string" && Number.isInteger(pack.coins) && pack.coins > 0 && typeof pack.description === "string" && typeof pack.active === "boolean" && (pack.priceIdr === undefined || (Number.isInteger(pack.priceIdr) && pack.priceIdr > 0));
}

function configuredPackages() {
  if (!process.env.COIN_PACKAGES_JSON) return defaults;
  try {
    const parsed = JSON.parse(process.env.COIN_PACKAGES_JSON);
    if (!Array.isArray(parsed) || !parsed.every(isPackage)) throw new Error("Invalid package shape");
    return parsed;
  } catch (error) {
    console.error("[coin-packages] Invalid COIN_PACKAGES_JSON, falling back to non-priced defaults", error);
    return defaults;
  }
}

export function getCoinPackages() { return configuredPackages().filter((pack) => pack.active); }
export function getCoinPackage(id: string) { return getCoinPackages().find((pack) => pack.id === id); }
export function formatPrice(pack: CoinPackage) { return pack.priceIdr ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pack.priceIdr) : "Harga dikonfigurasi admin"; }
