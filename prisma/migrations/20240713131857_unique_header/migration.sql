/*
  Warnings:

  - A unique constraint covering the columns `[name,value]` on the table `Header` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Header_name_value_key" ON "Header"("name", "value");
