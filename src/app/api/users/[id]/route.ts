import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { PrismaUserRepository } from "@/modules/user/infrastructure/prisma/PrismaUserRepository"
import { DeleteUserUseCase } from "@/modules/user/usecase/DeleteUserUseCase"

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const useCase = new DeleteUserUseCase(
      new PrismaUserRepository()
    )

    await useCase.execute(id)

    return NextResponse.json({
      message: "User deleted successfully",
      user: { id },
    })
  } catch (err: any) {
    console.error("DELETE USER ERROR:", err)
    return NextResponse.json(
      { error: err.message || "Failed to delete user" },
      { status: 500 }
    )
  }
}
