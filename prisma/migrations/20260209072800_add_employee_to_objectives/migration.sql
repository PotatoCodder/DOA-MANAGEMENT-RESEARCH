-- AlterTable
ALTER TABLE "Objectives" ADD COLUMN     "employeeId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Objectives" ADD CONSTRAINT "Objectives_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
