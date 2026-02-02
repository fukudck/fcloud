import { auth } from "@/auth"
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository"
import { PrismaFolderRepository } from "@/modules/drive/infrastructure/prisma/PrismaFolderRepository"
import { PermissionService } from "@/modules/drive/services/PermissionService"
import { ZipBuilder } from "@/modules/drive/services/ZipBuilder"
import { BulkDownloadUseCase } from "@/modules/drive/usecases/DownloadItems/BulkDownloadUseCase"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 })

  const { fileIds, folderIds } = await req.json()

  if (fileIds.length === 1 && folderIds.length === 0) {
      return NextResponse.redirect(
        new URL(`/api/items/download/${fileIds[0]}`, req.url),
        303
      );
    }

  const usecase = new BulkDownloadUseCase(
    new PrismaFileRepository(),
    new ZipBuilder(new PrismaFolderRepository(), new PermissionService()),
    new PermissionService()
  )

  const zip = await usecase.execute(fileIds, folderIds, session.user.id)

  return new NextResponse(zip, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="drive.zip"`,
    },
  })
}
