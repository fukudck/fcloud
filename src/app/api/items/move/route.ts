// app/api/move/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaFileRepository } from "@/modules/drive/infrastructure/prisma/PrismaFileRepository"
import { PrismaFolderRepository } from "@/modules/drive/infrastructure/prisma/PrismaFolderRepository"
import { MoveItemsUseCase } from "@/modules/drive/usecases/MoveItems/MoveItemsUseCase";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileIds, folderIds, targetFolderId } = await req.json();

    if (fileIds.length === 0 && folderIds.length === 0) {
      return NextResponse.json({ error: "No items to move" }, { status: 400 });
    }

    const usecase = new MoveItemsUseCase(
      new PrismaFileRepository(),
      new PrismaFolderRepository(),
    )
    await usecase.execute(session.user.id,fileIds, folderIds,targetFolderId)

    return NextResponse.json({
      message: "Move successful"
    });
  } catch (err) {
    console.error("Error moving items:", err);
    return NextResponse.json({ error: "Failed to move items" }, { status: 500 });
  }
}
