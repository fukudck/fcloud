import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

function generateCopyName(originalName: string): string {
  const lastDotIndex = originalName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return `${originalName} (copy)`;
  }
  const base = originalName.slice(0, lastDotIndex);
  const ext = originalName.slice(lastDotIndex);
  return `${base} (copy)${ext}`;
}

async function copyFolderRecursive(
  folderId: string,
  userId: string,
  targetParentId: string | null,
  addCopySuffix = false
) {
  const folder = await db.folder.findUnique({
    where: { id: folderId, userId },
    include: {
      files: true,
      children: true,
    },
  });
  if (!folder) return null;

  const newFolderName = addCopySuffix ? `${folder.name} (copy)` : folder.name;

  const newFolder = await db.folder.create({
    data: {
      name: newFolderName,
      userId,
      parentId: targetParentId,
    },
  });

  for (const file of folder.files) {
    await db.file.create({
      data: {
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        storagePath: file.storagePath,
        userId,
        folderId: newFolder.id,
      },
    });
  }

  for (const child of folder.children) {
    await copyFolderRecursive(child.id, userId, newFolder.id, false);
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
      const file = await db.file.findUnique({
        where: { id, userId: session.user.id },
      });
      if (file) {
        const newFile = await db.file.create({
          data: {
            name: generateCopyName(file.name), // thêm (copy) cho file gốc
            size: file.size,
            mimeType: file.mimeType,
            storagePath: file.storagePath,
            userId: session.user.id,
            folderId: destinationFolderId,
          },
        });
        copied.files.push(newFile.id);
        continue;
      }

      const folderExists = await db.folder.findUnique({
        where: { id, userId: session.user.id },
      });
      if (folderExists) {
        const newFolder = await copyFolderRecursive(id, session.user.id, destinationFolderId, true);
        if (newFolder) copied.folders.push(newFolder.id);
        continue;
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
