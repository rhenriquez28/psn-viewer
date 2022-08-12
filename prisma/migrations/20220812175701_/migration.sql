-- DropIndex
DROP INDEX `Game_titleId_key` ON `Game`;

-- AlterTable
ALTER TABLE `Game` MODIFY `previewVideoUrl` VARCHAR(191) NULL;
