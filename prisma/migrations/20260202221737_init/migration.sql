-- CreateEnum
CREATE TYPE "public"."ItemStatus" AS ENUM ('NORMAL', 'TRASH');

-- DropForeignKey
ALTER TABLE "public"."Folder" DROP CONSTRAINT "Folder_userId_fkey";

-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."ItemStatus" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "public"."Folder" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."ItemStatus" NOT NULL DEFAULT 'NORMAL';

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
