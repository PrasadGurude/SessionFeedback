-- AlterTable
ALTER TABLE "Contacted" ADD COLUMN     "sessionId" TEXT;

-- AddForeignKey
ALTER TABLE "Contacted" ADD CONSTRAINT "Contacted_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
