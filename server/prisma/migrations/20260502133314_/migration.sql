/*
  Warnings:

  - The values [LOCKED,LEAN,SWING] on the enum `SupportStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SupportStatus_new" AS ENUM ('TERKUNCI', 'MENGARAH', 'DINAMIS');
ALTER TABLE "Bpd" ALTER COLUMN "supportStatus" DROP DEFAULT;
ALTER TABLE "Bpd" ALTER COLUMN "supportStatus" TYPE "SupportStatus_new" USING ("supportStatus"::text::"SupportStatus_new");
ALTER TYPE "SupportStatus" RENAME TO "SupportStatus_old";
ALTER TYPE "SupportStatus_new" RENAME TO "SupportStatus";
DROP TYPE "SupportStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Bpd" ALTER COLUMN "supportStatus" DROP DEFAULT,
ALTER COLUMN "characteristic" DROP DEFAULT;
