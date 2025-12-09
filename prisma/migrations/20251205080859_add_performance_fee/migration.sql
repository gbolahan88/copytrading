-- AlterTable
ALTER TABLE "CopiedTrade" ADD COLUMN     "followerProfit" DOUBLE PRECISION,
ADD COLUMN     "masterFee" DOUBLE PRECISION,
ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MasterToken" ADD COLUMN     "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "performanceFee" DOUBLE PRECISION NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "MasterEarning" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "copierId" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "followerProfit" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MasterEarning_masterId_idx" ON "MasterEarning"("masterId");

-- AddForeignKey
ALTER TABLE "MasterEarning" ADD CONSTRAINT "MasterEarning_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MasterToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterEarning" ADD CONSTRAINT "MasterEarning_copierId_fkey" FOREIGN KEY ("copierId") REFERENCES "CopierToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
