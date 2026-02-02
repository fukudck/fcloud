// app/api/items/route.ts
import { auth } from "@/auth"
import { parseItemView } from "./parseItemView"
import { GetItemsUseCase } from "@/modules/drive/usecases/GetItems/GetItemsUseCase"
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository"
import { PrismaFolderRepository } from "@/modules/drive/infrastructure/prisma/PrismaFolderRepository"
import { mapToResponse } from "@/modules/drive/infrastructure/mappers/ItemResponseMapper"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const { viewType, folderId } = parseItemView(
    searchParams.get("folderId")
  )

  const usecase = new GetItemsUseCase(
    new PrismaFileRepository(),
    new PrismaFolderRepository()
  )

  const items = await usecase.execute(
    session.user.id,
    viewType,
    folderId
  )

  return Response.json(items.map(mapToResponse))
}
