-- CreateTable
CREATE TABLE "infographics" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "infographics_pkey" PRIMARY KEY ("id")
);
