/*
  Warnings:

  - You are about to drop the `Header` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServerHeader` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServerHeader" DROP CONSTRAINT "ServerHeader_headerId_fkey";

-- DropForeignKey
ALTER TABLE "ServerHeader" DROP CONSTRAINT "ServerHeader_serverId_fkey";

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "csp" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "permissions_policy" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "referrer_policy" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sts" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "xss_protection" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "Header";

-- DropTable
DROP TABLE "ServerHeader";
