/*
  Warnings:

  - A unique constraint covering the columns `[hostname,http_port]` on the table `Server` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hostname,ssl_port]` on the table `Server` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Server_hostname_http_port_key" ON "Server"("hostname", "http_port");

-- CreateIndex
CREATE UNIQUE INDEX "Server_hostname_ssl_port_key" ON "Server"("hostname", "ssl_port");
