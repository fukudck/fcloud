import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { DeleteItemsUseCase } from "@/modules/drive/usecases/DeleteItems/DeleteItemsUseCase"
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository"
import { PrismaFolderRepository } from "@/modules/drive/infrastructure/prisma/PrismaFolderRepository"

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { fileIds = [], folderIds = [] } = await req.json()
  const { searchParams } = new URL(req.url)

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const usecase = new DeleteItemsUseCase(
      new PrismaFileRepository(),
      new PrismaFolderRepository()
    )

    const result = await usecase.execute(session.user.id, fileIds, folderIds)

    return NextResponse.json({
      message: "Deleted successfully",
    })
  } catch (err: any) {
    if (err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    console.error(err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
