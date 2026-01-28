-- CreateTable
CREATE TABLE "announcment" (
    "id" SERIAL NOT NULL,
    "userid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recentActivity" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activities" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recentActivity_pkey" PRIMARY KEY ("id")
);
