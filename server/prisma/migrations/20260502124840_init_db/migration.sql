/*
  Warnings:

  - You are about to drop the column `afiliasiPolitik` on the `Bpd` table. All the data in the column will be lost.
  - You are about to drop the column `atributFisik` on the `Bpd` table. All the data in the column will be lost.
  - You are about to drop the column `kedekatanMc` on the `Bpd` table. All the data in the column will be lost.
  - You are about to drop the column `sosialMedia` on the `Bpd` table. All the data in the column will be lost.
  - You are about to drop the column `suratBaiat` on the `Bpd` table. All the data in the column will be lost.
  - You are about to drop the column `videoDukungan` on the `Bpd` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CandidateColor" AS ENUM ('BLUE', 'RED', 'YELLOW', 'GREEN');

-- AlterTable
ALTER TABLE "Bpd" DROP COLUMN "afiliasiPolitik",
DROP COLUMN "atributFisik",
DROP COLUMN "kedekatanMc",
DROP COLUMN "sosialMedia",
DROP COLUMN "suratBaiat",
DROP COLUMN "videoDukungan";

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" "CandidateColor" NOT NULL,
    "totalVotes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateIndicator" (
    "id" TEXT NOT NULL,
    "bpdId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "suratBaiat" BOOLEAN NOT NULL DEFAULT false,
    "afiliasiPolitik" BOOLEAN NOT NULL DEFAULT false,
    "videoDukungan" BOOLEAN NOT NULL DEFAULT false,
    "kedekatanMc" BOOLEAN NOT NULL DEFAULT false,
    "atributFisik" BOOLEAN NOT NULL DEFAULT false,
    "sosialMedia" BOOLEAN NOT NULL DEFAULT false,
    "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedVotes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_name_key" ON "Candidate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateIndicator_bpdId_candidateId_key" ON "CandidateIndicator"("bpdId", "candidateId");

-- AddForeignKey
ALTER TABLE "CandidateIndicator" ADD CONSTRAINT "CandidateIndicator_bpdId_fkey" FOREIGN KEY ("bpdId") REFERENCES "Bpd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateIndicator" ADD CONSTRAINT "CandidateIndicator_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
