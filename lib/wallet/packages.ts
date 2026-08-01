export type CoinPackage = { id: string; name: string; coins: number; description: string; active: boolean };
const defaults: CoinPackage[] = [
  { id: "STARTER", name: "Starter", coins: 50, description: "Placeholder paket awal untuk mencoba Conversion.", active: true },
  { id: "CREATOR", name: "Creator", coins: 150, description: "Placeholder paket creator Resource Pack.", active: true },
  { id: "PRO", name: "Pro", coins: 500, description: "Placeholder paket untuk kebutuhan Conversion rutin.", active: true },
  { id: "STUDIO", name: "Studio", coins: 1500, description: "Placeholder paket besar untuk studio atau tim.", active: true },
];
export function getCoinPackages() { return defaults; }
export function getCoinPackage(id: string) { return defaults.find((pack) => pack.id === id && pack.active); }
