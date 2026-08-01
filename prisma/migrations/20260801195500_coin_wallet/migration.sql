CREATE TYPE "CoinTransactionType" AS ENUM ('CREDIT_PURCHASE', 'CREDIT_BONUS', 'CREDIT_ADMIN', 'DEBIT_CONVERSION', 'REFUND_CONVERSION', 'DEBIT_ADJUSTMENT', 'CREDIT_ADJUSTMENT');
CREATE TYPE "CoinTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

CREATE TABLE "CoinWallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CoinWallet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CoinTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "type" "CoinTransactionType" NOT NULL,
  "status" "CoinTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
  "referenceType" TEXT,
  "referenceId" TEXT,
  "idempotencyKey" TEXT,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "adminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CoinWallet_userId_key" ON "CoinWallet"("userId");
CREATE UNIQUE INDEX "CoinTransaction_idempotencyKey_key" ON "CoinTransaction"("idempotencyKey");
CREATE INDEX "CoinTransaction_userId_createdAt_idx" ON "CoinTransaction"("userId", "createdAt");
CREATE INDEX "CoinTransaction_referenceType_referenceId_idx" ON "CoinTransaction"("referenceType", "referenceId");

ALTER TABLE "CoinWallet" ADD CONSTRAINT "CoinWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "CoinWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_amount_nonzero" CHECK ("amount" <> 0);
ALTER TABLE "CoinWallet" ADD CONSTRAINT "CoinWallet_balance_nonnegative" CHECK ("balance" >= 0);
