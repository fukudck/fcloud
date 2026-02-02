import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository"
import { PrismaFolderRepository } from "@/modules/drive/infrastructure/prisma/PrismaFolderRepository"
import { RenameItemUseCase } from "@/modules/drive/usecases/RenameItems/RenameItemUseCase"

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const { name, type } = await req.json()

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      )
    }

    const useCase = new RenameItemUseCase(
      new PrismaFileRepository(),
      new PrismaFolderRepository()
    )

    const result = await useCase.execute(
      session.user.id,
      id,
      type,
      name
    )

    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Rename error:", err)

    if (err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(
      { error: err.message ?? "Rename failed" },
      { status: 500 }
    )
  }
}
