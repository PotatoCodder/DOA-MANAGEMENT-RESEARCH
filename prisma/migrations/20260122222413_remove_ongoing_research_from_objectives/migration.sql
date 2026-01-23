/*
  Warnings:

  - You are about to drop the column `ongoingResearchId` on the `Objectives` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Objectives" DROP CONSTRAINT "Objectives_ongoingResearchId_fkey";

-- AlterTable
ALTER TABLE "Objectives" DROP COLUMN "ongoingResearchId";
