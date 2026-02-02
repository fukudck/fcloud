import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { DownloadFileUseCase } from "@/modules/drive/usecases/DownloadItems/DownloadFileUseCase"
import { PermissionService } from "@/modules/drive/services/PermissionService"
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository"

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params

  const session = await auth()
  const userId = session?.user?.id // có thể undefined

  try {
    const usecase = new DownloadFileUseCase(
      new PrismaFileRepository(),
      new PermissionService()
    )

    const file = await usecase.execute(id, userId)

    const res = await fetch(file.storagePath)
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      )
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          file.name
        )}"`,
      },
    })
  } catch (err: any) {
    if (err.message === "FILE_NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
