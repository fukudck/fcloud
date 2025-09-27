import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    blob: { maxFileSize: "128MB", maxFileCount: 10 },
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
      const { userId, usedSpace, totalQuota, folderId } = metadata;

      if (usedSpace + file.size > totalQuota) {
        throw new UploadThingError("Storage quota exceeded");
      }

      const savedFile = await db.file.create({
        data: {
          name: file.name,
          size: file.size,
          mimeType: file.type,
          storagePath: file.ufsUrl,
          userId,
          folderId: !folderId || folderId === "0" ? null : folderId,
        },
      });

      await db.user.update({
        where: { id: userId },
        data: { usedSpace: usedSpace + file.size },
      });

      return {
        uploadedBy: userId,
        fileId: savedFile.id,
        fileUrl: savedFile.storagePath,
        folderId,
      };
    }),
} satisfies FileRouter;


export type OurFileRouter = typeof ourFileRouter;
