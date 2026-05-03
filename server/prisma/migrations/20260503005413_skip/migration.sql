-- AlterTable
ALTER TABLE "Bpd" ADD COLUMN     "afiliasiPolitik" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "atributFisik" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kedekatanMc" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sosialMedia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suratBaiat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoDukungan" BOOLEAN NOT NULL DEFAULT false;
