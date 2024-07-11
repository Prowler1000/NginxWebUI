-- CreateEnum
CREATE TYPE "HTTP_VERSION" AS ENUM ('v10', 'v11', 'v20');

-- CreateEnum
CREATE TYPE "SSL_Protocol" AS ENUM ('TLSv12', 'TLSv13');

-- AlterTable
ALTER TABLE "ProxyServer" ADD COLUMN     "connect_timeout" INTEGER,
ADD COLUMN     "proxy_http_ver" "HTTP_VERSION" NOT NULL DEFAULT 'v11',
ADD COLUMN     "proxy_ssl_protos" "SSL_Protocol"[] DEFAULT ARRAY['TLSv12', 'TLSv13']::"SSL_Protocol"[],
ADD COLUMN     "read_timeout" INTEGER,
ADD COLUMN     "send_timeout" INTEGER,
ADD COLUMN     "ssl_session_reuse" BOOLEAN NOT NULL DEFAULT false;
