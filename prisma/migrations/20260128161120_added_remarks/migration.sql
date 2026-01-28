/*
  Warnings:

  - Added the required column `remarks` to the `subOngoingResearch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subOngoingResearch" ADD COLUMN     "remarks" TEXT NOT NULL;
