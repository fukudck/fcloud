import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { PrismaUserRepository } from "@/modules/user/infrastructure/prisma/PrismaUserRepository"
import { AdminListUsersUseCase } from "@/modules/user/usecase/AdminListUsersUseCase"

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (currentUser?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)

  const useCase = new AdminListUsersUseCase(
    new PrismaUserRepository()
  )

  const result = await useCase.execute({
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 10),
    role: searchParams.get("role") || undefined,
    search: (searchParams.get("search") || "").trim() || undefined,
    sort: (searchParams.get("sort") || "newest").toLowerCase(),
  })

  return NextResponse.json(result)
}
