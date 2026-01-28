/*
  Warnings:

  - You are about to drop the column `date` on the `TargetActivities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TargetActivities" DROP COLUMN "date",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
