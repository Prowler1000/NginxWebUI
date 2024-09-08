-- AlterTable
ALTER TABLE "Auth" ADD COLUMN     "directives" TEXT[] DEFAULT ARRAY[]::TEXT[];
