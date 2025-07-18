-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "open_to_loan" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Loan" (
    "loan_id" SERIAL NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "borrower_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_return_date" TIMESTAMP(3) NOT NULL,
    "actual_return_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("loan_id")
);

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_borrower_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
