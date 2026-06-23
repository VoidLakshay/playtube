/*
  Warnings:

  - Made the column `videoUrl` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "spriteUrl" TEXT,
ALTER COLUMN "videoUrl" SET NOT NULL;
