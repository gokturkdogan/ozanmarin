-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "status" SET DEFAULT 'received';
