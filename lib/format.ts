export function formatCurrency(value?: number | null) {
  if (!value) return "Custom quote";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}
