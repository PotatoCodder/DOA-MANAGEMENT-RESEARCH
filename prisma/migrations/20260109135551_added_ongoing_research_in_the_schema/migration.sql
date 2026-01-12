-- CreateTable
CREATE TABLE "ongoingResearch" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "proponents" TEXT NOT NULL,
    "fundingSource" TEXT NOT NULL,
    "projectDuration" TEXT NOT NULL,
    "budgetAllocation" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "ongoingResearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subOngoingResearch" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "actualAccomplishment" TEXT NOT NULL,
    "dateConducted" TEXT NOT NULL,
    "documentation" TEXT NOT NULL,
    "ongoingResearchId" INTEGER NOT NULL,

    CONSTRAINT "subOngoingResearch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subOngoingResearch" ADD CONSTRAINT "subOngoingResearch_ongoingResearchId_fkey" FOREIGN KEY ("ongoingResearchId") REFERENCES "ongoingResearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
