-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "slugEn" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "slugEn" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "slugEn" TEXT;
