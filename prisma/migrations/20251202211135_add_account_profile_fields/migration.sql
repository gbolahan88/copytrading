-- AlterTable
ALTER TABLE "CopierToken" ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "MasterToken" ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT;
