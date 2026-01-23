-- CreateTable
CREATE TABLE "Objectives" (
    "id" SERIAL NOT NULL,
    "objectives" TEXT NOT NULL,
    "targetActivities" TEXT,
    "date" TIMESTAMP(3),
    "ongoingResearchId" INTEGER NOT NULL,

    CONSTRAINT "Objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetActivities" (
    "id" SERIAL NOT NULL,
    "targetActivity" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "objectivesId" INTEGER NOT NULL,

    CONSTRAINT "TargetActivities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Objectives" ADD CONSTRAINT "Objectives_ongoingResearchId_fkey" FOREIGN KEY ("ongoingResearchId") REFERENCES "ongoingResearch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetActivities" ADD CONSTRAINT "TargetActivities_objectivesId_fkey" FOREIGN KEY ("objectivesId") REFERENCES "Objectives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
