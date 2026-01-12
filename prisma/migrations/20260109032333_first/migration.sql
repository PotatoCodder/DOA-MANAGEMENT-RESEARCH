-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT,
    "Email" TEXT,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "updationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "mobileNumber" TEXT,
    "password" TEXT NOT NULL,
    "status" BOOLEAN,
    "regDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updationDate" TIMESTAMP(3),

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completedResearch" (
    "id" SERIAL NOT NULL,
    "userid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "researcher" TEXT NOT NULL,
    "funding" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "file" TEXT NOT NULL,

    CONSTRAINT "completedResearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maturedResearch" (
    "id" SERIAL NOT NULL,
    "userid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "proponents" TEXT NOT NULL,
    "funding" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "file" TEXT NOT NULL,

    CONSTRAINT "maturedResearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicationResearch" (
    "id" SERIAL NOT NULL,
    "userid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "proponents" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "published" TEXT NOT NULL,
    "file" TEXT NOT NULL,

    CONSTRAINT "publicationResearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researchProposal" (
    "id" SERIAL NOT NULL,
    "userid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "proponents" TEXT NOT NULL,
    "fundingAgency" TEXT NOT NULL,
    "dateUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" TEXT NOT NULL,

    CONSTRAINT "researchProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Email_key" ON "Admin"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "employee_employeeId_key" ON "employee"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");
