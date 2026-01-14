/*
  Warnings:

  - You are about to drop the column `number` on the `turn` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `turn` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[slug]` on the table `Clinic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Clinic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketCode` to the `Turn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clinic` ADD COLUMN `avgTime` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `turn` DROP COLUMN `number`,
    ADD COLUMN `patientName` VARCHAR(191) NULL,
    ADD COLUMN `ticketCode` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('WAITING', 'ACTIVE', 'DELAYED', 'DONE', 'CANCELLED', 'URGENT') NOT NULL DEFAULT 'WAITING';

-- CreateIndex
CREATE UNIQUE INDEX `Clinic_slug_key` ON `Clinic`(`slug`);
