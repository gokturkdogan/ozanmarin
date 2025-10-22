-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "isShipping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0;
