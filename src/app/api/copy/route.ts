import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// Helper: copy folder đệ quy
async function copyFolderRecursive(folderId: string, userId: string, targetParentId: string | null) {
  const folder = await db.folder.findUnique({
    where: { id: folderId, userId },
    include: {
      files: true,
      children: true,
    },
  });
  if (!folder) return null;

  // Tạo folder mới
  const newFolder = await db.folder.create({
    data: {
      name: `${folder.name} (copy)`,
      userId,
      parentId: targetParentId,
    },
  });

  // Copy files trong folder
  for (const file of folder.files) {
    await db.file.create({
      data: {
        name: `${file.name} (copy)`,
        size: file.size,
        mimeType: file.mimeType,
        storagePath: file.storagePath,
        userId,
        folderId: newFolder.id,
      },
    });
  }

  // Copy các folder con
  for (const child of folder.children) {
    await copyFolderRecursive(child.id, userId, newFolder.id);
  }

  return newFolder;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemIds, targetFolderId } = await req.json();

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: "No items to copy" }, { status: 400 });
    }

    // ✅ chuẩn hóa targetFolderId: root = null
    let destinationFolderId: string | null = null;
    if (targetFolderId && targetFolderId !== "0") {
      const destFolder = await db.folder.findUnique({
        where: { id: targetFolderId, userId: session.user.id },
      });
      if (!destFolder) {
        return NextResponse.json({ error: "Target folder not found" }, { status: 400 });
      }
      destinationFolderId = destFolder.id;
    }

    const copied: { files: string[]; folders: string[] } = { files: [], folders: [] };

    for (const id of itemIds) {
      // Thử copy file
      const file = await db.file.findUnique({
        where: { id, userId: session.user.id },
      });
      if (file) {
        const newFile = await db.file.create({
          data: {
            name: `${file.name} (copy)`,
            size: file.size,
            mimeType: file.mimeType,
            storagePath: file.storagePath,
            userId: session.user.id,
            folderId: destinationFolderId, // null = root
          },
        });
        copied.files.push(newFile.id);
        continue;
      }

      // Thử copy folder
      const folder = await db.folder.findUnique({
        where: { id, userId: session.user.id },
      });
      if (folder) {
        const newFolder = await copyFolderRecursive(folder.id, session.user.id, destinationFolderId);
        if (newFolder) copied.folders.push(newFolder.id);
      }
    }

    return NextResponse.json({
      message: "Copy successful",
      copied,
    });
  } catch (err) {
    console.error("Error copying items:", err);
    return NextResponse.json({ error: "Failed to copy items" }, { status: 500 });
  }
}
