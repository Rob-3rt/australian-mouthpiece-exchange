-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "start_date" DROP DEFAULT,
ALTER COLUMN "status" SET DEFAULT 'pending';
