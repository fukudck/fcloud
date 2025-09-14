// app/api/move/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemIds, targetFolderId } = await req.json();

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: "No items to move" }, { status: 400 });
    }

    // Kiểm tra target folder (nếu null => move về root)
    if (targetFolderId) {
      const targetFolder = await db.folder.findUnique({
        where: { id: targetFolderId, userId: session.user.id },
      });
      if (!targetFolder) {
        return NextResponse.json({ error: "Target folder not found" }, { status: 404 });
      }
    }

    // Cập nhật cả file và folder
    const movedFiles = await db.file.updateMany({
      where: { id: { in: itemIds }, userId: session.user.id },
      data: { folderId: targetFolderId || null },
    });

    const movedFolders = await db.folder.updateMany({
      where: { id: { in: itemIds }, userId: session.user.id },
      data: { parentId: targetFolderId || null },
    });

    return NextResponse.json({
      message: "Move successful",
      moved: {
        files: movedFiles.count,
        folders: movedFolders.count,
      },
    });
  } catch (err) {
    console.error("Error moving items:", err);
    return NextResponse.json({ error: "Failed to move items" }, { status: 500 });
  }
}
