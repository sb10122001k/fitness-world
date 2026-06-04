/*
  Warnings:

  - You are about to drop the column `gymExipriDate` on the `PaymentLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber,adminId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gymExpiryDate` to the `PaymentLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_phoneNumber_key";

-- AlterTable
ALTER TABLE "PaymentLog" DROP COLUMN "gymExipriDate",
ADD COLUMN     "gymExpiryDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_adminId_key" ON "User"("phoneNumber", "adminId");
