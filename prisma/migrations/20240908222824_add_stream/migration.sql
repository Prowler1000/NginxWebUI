-- CreateTable
CREATE TABLE "Stream" (
    "id" SERIAL NOT NULL,
    "incomming_port" INTEGER NOT NULL DEFAULT 0,
    "upstream_host" TEXT NOT NULL DEFAULT '',
    "upstream_port" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);
