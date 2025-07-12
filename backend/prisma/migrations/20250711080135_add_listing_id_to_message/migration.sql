-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "listing_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("listing_id") ON DELETE SET NULL ON UPDATE CASCADE;
