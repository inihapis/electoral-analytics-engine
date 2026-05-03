/*
  Warnings:

  - You are about to drop the column `totalScore` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `totalVotes` on the `Candidate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "totalScore",
DROP COLUMN "totalVotes",
ADD COLUMN     "affiliation" TEXT;
