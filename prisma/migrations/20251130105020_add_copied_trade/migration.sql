-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('REAL', 'DEMO');

-- CreateEnum
CREATE TYPE "StakeType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT,
    "balance" DOUBLE PRECISION,
    "currency" TEXT,

    CONSTRAINT "MasterToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopierToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "CopierToken" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "riskMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "accountType" "AccountType" NOT NULL,
    "stakeType" TEXT DEFAULT 'PERCENTAGE',
    "stakeAmount" DOUBLE PRECISION DEFAULT 10,
    "validatedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CopierToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopiedTrade" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "copierId" TEXT NOT NULL,
    "masterTxId" TEXT NOT NULL,
    "copierContractId" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopiedTrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MasterToken_userId_idx" ON "MasterToken"("userId");

-- CreateIndex
CREATE INDEX "CopierToken_userId_idx" ON "CopierToken"("userId");

-- CreateIndex
CREATE INDEX "CopiedTrade_masterId_idx" ON "CopiedTrade"("masterId");

-- CreateIndex
CREATE INDEX "CopiedTrade_copierId_idx" ON "CopiedTrade"("copierId");

-- AddForeignKey
ALTER TABLE "MasterToken" ADD CONSTRAINT "MasterToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopierToken" ADD CONSTRAINT "CopierToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopierToken" ADD CONSTRAINT "CopierToken_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MasterToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopiedTrade" ADD CONSTRAINT "CopiedTrade_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MasterToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopiedTrade" ADD CONSTRAINT "CopiedTrade_copierId_fkey" FOREIGN KEY ("copierId") REFERENCES "CopierToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
