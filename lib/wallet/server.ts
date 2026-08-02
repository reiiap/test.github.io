import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertNoNegativeBalance, assertPositiveAmount, signedAmount } from "@/lib/wallet/core";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
type LedgerInput = { userId: string; amount: number; type: Prisma.CoinTransactionCreateInput["type"]; referenceType?: string; referenceId?: string; idempotencyKey?: string; description: string; metadata?: Prisma.InputJsonValue; adminId?: string };

async function ensureWallet(userId: string, tx: Tx = prisma) { return tx.coinWallet.upsert({ where: { userId }, update: {}, create: { userId } }); }
export async function getWalletSummary(userId: string) { const wallet = await ensureWallet(userId); const transactions = await prisma.coinTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }); return { wallet, transactions }; }

export async function creditCoins(input: LedgerInput) {
  assertPositiveAmount(input.amount);
  return prisma.$transaction(async (tx) => {
    if (input.idempotencyKey) { const existing = await tx.coinTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } }); if (existing) return existing; }
    const wallet = await ensureWallet(input.userId, tx);
    const updated = await tx.coinWallet.update({ where: { id: wallet.id }, data: { balance: { increment: input.amount } } });
    return tx.coinTransaction.create({ data: { userId: input.userId, walletId: updated.id, amount: signedAmount("credit", input.amount), type: input.type, referenceType: input.referenceType, referenceId: input.referenceId, idempotencyKey: input.idempotencyKey, description: input.description, metadata: input.metadata, adminId: input.adminId, status: "COMPLETED" } });
  });
}

export async function debitCoins(input: LedgerInput) {
  assertPositiveAmount(input.amount);
  return prisma.$transaction(async (tx) => {
    if (input.idempotencyKey) { const existing = await tx.coinTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } }); if (existing) return existing; }
    const wallet = await ensureWallet(input.userId, tx);
    assertNoNegativeBalance(wallet.balance, input.amount);
    const update = await tx.coinWallet.updateMany({ where: { id: wallet.id, balance: { gte: input.amount } }, data: { balance: { decrement: input.amount } } });
    if (update.count !== 1) throw new Error("Saldo Coin tidak cukup.");
    return tx.coinTransaction.create({ data: { userId: input.userId, walletId: wallet.id, amount: signedAmount("debit", input.amount), type: input.type, referenceType: input.referenceType, referenceId: input.referenceId, idempotencyKey: input.idempotencyKey, description: input.description, metadata: input.metadata, adminId: input.adminId, status: "COMPLETED" } });
  });
}

export async function chargeConversion(userId: string, conversionId: string, amount: number) { return debitCoins({ userId, amount, type: "DEBIT_CONVERSION", referenceType: "CONVERSION", referenceId: conversionId, idempotencyKey: `conversion:${conversionId}:debit`, description: "Debit Coin untuk Konversi Resource Pack" }); }
export async function refundConversion(userId: string, conversionId: string, amount: number, reason: string) { return creditCoins({ userId, amount, type: "REFUND_CONVERSION", referenceType: "CONVERSION", referenceId: conversionId, idempotencyKey: `conversion:${conversionId}:refund`, description: "Refund Coin karena Konversi gagal", metadata: { reason } }); }
