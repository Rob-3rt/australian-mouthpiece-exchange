/*
  Warnings:

  - You are about to drop the column `size` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "size",
ADD COLUMN     "paypal_link_override" TEXT;
