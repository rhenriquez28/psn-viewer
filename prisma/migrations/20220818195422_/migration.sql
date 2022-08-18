/*
  Warnings:

  - A unique constraint covering the columns `[titleId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Game_titleId_key` ON `Game`(`titleId`);
