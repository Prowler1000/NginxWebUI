/*
  Warnings:

  - You are about to drop the column `connect_timeout` on the `ProxyServer` table. All the data in the column will be lost.
  - You are about to drop the column `proxy_http_ver` on the `ProxyServer` table. All the data in the column will be lost.
  - You are about to drop the column `proxy_ssl_protos` on the `ProxyServer` table. All the data in the column will be lost.
  - You are about to drop the column `read_timeout` on the `ProxyServer` table. All the data in the column will be lost.
  - You are about to drop the column `send_timeout` on the `ProxyServer` table. All the data in the column will be lost.
  - You are about to drop the column `ssl_server_name` on the `ProxyServer` table. All the data in the column will be lost.
  - You are about to drop the column `ssl_session_reuse` on the `ProxyServer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProxyServer" DROP COLUMN "connect_timeout",
DROP COLUMN "proxy_http_ver",
DROP COLUMN "proxy_ssl_protos",
DROP COLUMN "read_timeout",
DROP COLUMN "send_timeout",
DROP COLUMN "ssl_server_name",
DROP COLUMN "ssl_session_reuse";

-- DropEnum
DROP TYPE "HTTP_VERSION";

-- DropEnum
DROP TYPE "SSL_Protocol";
