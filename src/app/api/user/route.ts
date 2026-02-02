import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
function toGB(bytes: number): string {
  return (bytes / (1024 * 1024 )).toFixed(2)
}

// app/api/user/route.ts
import { PrismaUserRepository } from "@/modules/user/infrastructure/prisma/PrismaUserRepository"
import { GetCurrentUserUseCase } from "@/modules/user/usecase/GetCurrentUserUseCase"
import { UpdateUserUseCase } from "@/modules/user/usecase/UpdateUserUseCase"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const useCase = new GetCurrentUserUseCase(
      new PrismaUserRepository()
    )

    const user = await useCase.execute(session.user.id)
    return NextResponse.json({
    ...user,
    totalQuota: toGB(user.totalQuota),
    usedSpace: toGB(user.usedSpace),
  })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 })
  }
}


export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    const useCase = new UpdateUserUseCase(
      new PrismaUserRepository()
    )

    const result = await useCase.execute(session.user.id, body.name)

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to update user" },
      { status: 400 }
    )
  }
}
