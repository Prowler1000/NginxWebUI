-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "authId" INTEGER;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
