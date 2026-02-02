import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository"
import { ToggleFileShareableUseCase } from "@/modules/drive/usecases/ToggleFileShareable/ToggleFileShareableUseCase"

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

    const useCase = new ToggleFileShareableUseCase(
      new PrismaFileRepository()
    )

    const result = await useCase.execute(session.user.id, id)

    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Toggle share error:", err)

    if (err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(
      { error: "Failed to toggle share" },
      { status: 500 }
    )
  }
}
