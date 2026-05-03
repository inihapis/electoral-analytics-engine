-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('LOCKED', 'LEAN', 'SWING');

-- CreateEnum
CREATE TYPE "Characteristic" AS ENUM ('SOLID', 'RENTAN', 'WASPADA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bpd" (
    "id" TEXT NOT NULL,
    "provinceName" TEXT NOT NULL,
    "totalVotes" INTEGER NOT NULL DEFAULT 5,
    "targetMc" TEXT,
    "politicalAffiliation" TEXT,
    "supportStatus" "SupportStatus" NOT NULL DEFAULT 'SWING',
    "characteristic" "Characteristic" NOT NULL DEFAULT 'WASPADA',
    "suratBaiat" BOOLEAN NOT NULL DEFAULT false,
    "afiliasiPolitik" BOOLEAN NOT NULL DEFAULT false,
    "videoDukungan" BOOLEAN NOT NULL DEFAULT false,
    "kedekatanMc" BOOLEAN NOT NULL DEFAULT false,
    "atributFisik" BOOLEAN NOT NULL DEFAULT false,
    "sosialMedia" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bpd_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Bpd_provinceName_key" ON "Bpd"("provinceName");

-- AddForeignKey
ALTER TABLE "Bpd" ADD CONSTRAINT "Bpd_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
