-- CreateTable
CREATE TABLE "Auth" (
    "id" SERIAL NOT NULL,
    "auth_request" TEXT NOT NULL DEFAULT '',
    "auth_request_headers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "proxy_headers" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "prefix" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "directives" TEXT[],

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AuthToLocation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AuthToLocation_AB_unique" ON "_AuthToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthToLocation_B_index" ON "_AuthToLocation"("B");

-- AddForeignKey
ALTER TABLE "_AuthToLocation" ADD CONSTRAINT "_AuthToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthToLocation" ADD CONSTRAINT "_AuthToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
