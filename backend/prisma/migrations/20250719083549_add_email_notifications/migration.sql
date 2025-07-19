-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_listing_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_notifications" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;
