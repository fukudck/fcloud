import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository"
import { PrismaFolderRepository } from "@/modules/drive/infrastructure/prisma/PrismaFolderRepository"
import { CopyItemsUseCase } from "@/modules/drive/usecases/CopyItems/CopyItemsUseCase"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileIds = [], folderIds = [], targetFolderId } = await req.json()

    if (fileIds.length === 0 && folderIds.length === 0) {
      return NextResponse.json({ error: "No items to copy" }, { status: 400 })
    }

    const useCase = new CopyItemsUseCase(
      new PrismaFileRepository(),
      new PrismaFolderRepository()
    )

    const result = await useCase.execute({
      userId: session.user.id,
      fileIds,
      folderIds,
      targetFolderId:
        !targetFolderId || targetFolderId === "0"
          ? null
          : targetFolderId,
    })

    return NextResponse.json({
      message: "Copy successful",
      copied: result,
    })
  } catch (err) {
    console.error("Copy error:", err)
    return NextResponse.json(
      { error: "Failed to copy items" },
      { status: 500 }
    )
  }
}
