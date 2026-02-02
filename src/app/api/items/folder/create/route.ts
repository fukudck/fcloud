import { CreateFolderUseCase } from "@/modules/drive/usecases/CreateFolder/CreateFolderUseCase";
import { PrismaFolderRepository } from "@/modules/drive/infrastructure/prisma/PrismaFolderRepository";
import { PrismaUserRepository } from "@/modules/user/infrastructure/prisma/PrismaUserRepository";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, parentId } = await req.json();

    const usecase = new CreateFolderUseCase(
      new PrismaFolderRepository(),
      new PrismaUserRepository()
    )

    await usecase.execute(session.user.id, name, parentId)

    return NextResponse.json("Folder created.");
  } catch (err) {
    console.error("Error creating folder:", err);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}