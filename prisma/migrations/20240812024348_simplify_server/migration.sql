/*
  Warnings:

  - You are about to drop the column `csp` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `permissions_policy` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `referrer_policy` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `sts` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `xss_protection` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "csp",
DROP COLUMN "permissions_policy",
DROP COLUMN "referrer_policy",
DROP COLUMN "sts",
DROP COLUMN "xss_protection";
