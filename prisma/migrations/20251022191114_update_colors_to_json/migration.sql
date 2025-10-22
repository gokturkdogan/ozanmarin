/*
  Warnings:

  - Changed the type of `colors` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- First, add a temporary column
ALTER TABLE "products" ADD COLUMN "colors_temp" JSONB;

-- Convert existing string array data to JSON format
UPDATE "products" 
SET "colors_temp" = (
  SELECT jsonb_agg(
    jsonb_build_object('tr', color_value, 'en', color_value)
  )
  FROM unnest("colors") AS color_value
);

-- Drop the old column and rename the new one
ALTER TABLE "products" DROP COLUMN "colors";
ALTER TABLE "products" RENAME COLUMN "colors_temp" TO "colors";
ALTER TABLE "products" ALTER COLUMN "colors" SET NOT NULL;
