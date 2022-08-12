/*
  Warnings:

  - The primary key for the `Game` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Game` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[npCommunicationId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[titleId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `npCommunicationId` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleId` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Game_id_key` ON `Game`;

-- AlterTable
ALTER TABLE `Game` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `npCommunicationId` VARCHAR(191) NOT NULL,
    ADD COLUMN `titleId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`npCommunicationId`);

-- CreateIndex
CREATE UNIQUE INDEX `Game_npCommunicationId_key` ON `Game`(`npCommunicationId`);

-- CreateIndex
CREATE UNIQUE INDEX `Game_titleId_key` ON `Game`(`titleId`);
