/*
  Warnings:

  - You are about to drop the column `topic` on the `Feedback` table. All the data in the column will be lost.
  - Made the column `userId` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_userId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "topic",
ADD COLUMN     "lessonId" TEXT,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NEW',
ADD COLUMN     "topicId" TEXT,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_topicId_idx" ON "Feedback"("topicId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
