-- CreateEnum
CREATE TYPE "Scheme" AS ENUM ('HTTP', 'HTTPS');

-- CreateTable
CREATE TABLE "Header" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "Header_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "http_port" INTEGER NOT NULL,
    "ssl_port" INTEGER NOT NULL,
    "use_ssl" BOOLEAN NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerHeader" (
    "headerId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL,

    CONSTRAINT "ServerHeader_pkey" PRIMARY KEY ("headerId","serverId")
);

-- CreateTable
CREATE TABLE "ProxyServer" (
    "id" SERIAL NOT NULL,
    "forward_scheme" "Scheme" NOT NULL DEFAULT 'HTTP',
    "forward_server" TEXT NOT NULL,
    "forward_port" INTEGER NOT NULL,
    "ssl_server_name" BOOLEAN NOT NULL DEFAULT true,
    "serverId" INTEGER NOT NULL,

    CONSTRAINT "ProxyServer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServerHeader" ADD CONSTRAINT "ServerHeader_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "Header"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerHeader" ADD CONSTRAINT "ServerHeader_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProxyServer" ADD CONSTRAINT "ProxyServer_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
