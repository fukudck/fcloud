import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { UploadFilesUseCase } from "@/modules/drive/usecases/UploadFiles/UploadFilesUseCase";
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository";
import { PrismaUserRepository } from "@/modules/user/infrastructure/prisma/PrismaUserRepository";
const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    blob: { maxFileSize: "64MB", maxFileCount: 10 },
  })
    .input(z.object({ folderId: z.string().optional() }))
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("Unauthorized");

      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user) throw new UploadThingError("User not found");

      return {
        userId: user.id,
        usedSpace: user.usedSpace,
        totalQuota: user.totalQuota,
        folderId: input.folderId ?? null,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const usecase = new UploadFilesUseCase(
        new PrismaFileRepository(),
        new PrismaUserRepository()
      )

      try {
        const savedFiles = await usecase.execute({
          userId: metadata.userId,
          folderId:
            !metadata.folderId || metadata.folderId === "0"
              ? null
              : metadata.folderId,
          files: [{
            name: file.name,
            size: file.size,
            mimeType: file.type,
            storagePath: file.ufsUrl,
          }],
        })

        // ✅ RETURN = SUCCESS
        return {
          status: "success",
        }
      } catch (err) {
        console.error(err)

        // ❌ THROW = FAIL
        throw new UploadThingError("Upload failed")
      }

    }),
} satisfies FileRouter;


export type OurFileRouter = typeof ourFileRouter;
