export type LedgerEntry = { amount: number; status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" };
export function applyLedgerBalance(entries: LedgerEntry[]) { return entries.filter((entry) => entry.status === "COMPLETED").reduce((sum, entry) => sum + entry.amount, 0); }
export function assertPositiveAmount(amount: number) { if (!Number.isInteger(amount) || amount <= 0) throw new Error("Jumlah Coin harus bilangan bulat positif."); }
export function signedAmount(direction: "credit" | "debit", amount: number) { assertPositiveAmount(amount); return direction === "credit" ? amount : -amount; }
export function assertNoNegativeBalance(balance: number, debitAmount: number) { assertPositiveAmount(debitAmount); if (balance < debitAmount) throw new Error("Saldo Coin tidak cukup."); }
