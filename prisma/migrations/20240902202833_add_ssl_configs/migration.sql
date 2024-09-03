-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "sSLConfigId" INTEGER;

-- CreateTable
CREATE TABLE "SSLConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "cert_location" TEXT NOT NULL DEFAULT '/ssl/default/fullkey.pem',
    "cert_key_location" TEXT NOT NULL DEFAULT '/ssl/default/privkey.pem',
    "session_timeout" TEXT NOT NULL DEFAULT '1d',
    "session_cache" TEXT NOT NULL DEFAULT 'shared:MozSSL:10m',
    "session_tickets" BOOLEAN NOT NULL DEFAULT false,
    "protocols" TEXT[] DEFAULT ARRAY['TLSv1.3']::TEXT[],
    "prefer_server_ciphers" BOOLEAN NOT NULL DEFAULT false,
    "stapling" BOOLEAN NOT NULL DEFAULT false,
    "stapling_verify" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SSLConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_sSLConfigId_fkey" FOREIGN KEY ("sSLConfigId") REFERENCES "SSLConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
