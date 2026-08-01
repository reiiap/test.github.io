CREATE TYPE "ConversionJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED');

CREATE TABLE "ConversionJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "ConversionJobStatus" NOT NULL DEFAULT 'PENDING',
  "originalFilename" TEXT NOT NULL,
  "safeFilename" TEXT NOT NULL,
  "inputPath" TEXT NOT NULL,
  "outputPath" TEXT,
  "outputFilename" TEXT,
  "sizeBytes" INTEGER NOT NULL,
  "packFormat" INTEGER,
  "minecraftVersion" TEXT,
  "texturesCount" INTEGER NOT NULL DEFAULT 0,
  "modelsCount" INTEGER NOT NULL DEFAULT 0,
  "animationsCount" INTEGER NOT NULL DEFAULT 0,
  "otherAssetsCount" INTEGER NOT NULL DEFAULT 0,
  "costCoins" INTEGER NOT NULL DEFAULT 0,
  "analysis" JSONB,
  "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "errorReason" TEXT,
  "steps" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "ConversionJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConversionJob_userId_status_idx" ON "ConversionJob"("userId", "status");
CREATE INDEX "ConversionJob_expiresAt_idx" ON "ConversionJob"("expiresAt");

ALTER TABLE "ConversionJob" ADD CONSTRAINT "ConversionJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
