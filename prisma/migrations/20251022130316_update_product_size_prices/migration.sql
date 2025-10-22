/*
  Warnings:

  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sizes` on the `products` table. All the data in the column will be lost.
  - Added the required column `sizePrices` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "price",
DROP COLUMN "sizes",
ADD COLUMN     "sizePrices" JSONB NOT NULL;
