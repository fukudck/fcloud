import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// Đệ quy thêm folder và file vào zip
async function addFolderToZip(zip: JSZip, folderId: string, basePath = "") {
  const folder = await db.folder.findUnique({
    where: { id: folderId },
    include: { files: true, children: true },
  });

  if (!folder) return;

  const folderPath = `${basePath}${folder.name}/`;
  const folderZip = zip.folder(folderPath);

  if (!folderZip) return;

  // Nếu thư mục rỗng (không file, không subfolder) → vẫn giữ entry
  if (folder.files.length === 0 && folder.children.length === 0) {
    folderZip.file(".keep", ""); // giữ thư mục trống
  }

  // Thêm file
  for (const file of folder.files) {
    const res = await fetch(file.storagePath);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      folderZip.file(file.name, buf);
    }
  }

  // Đệ quy con
  for (const child of folder.children) {
    await addFolderToZip(zip, child.id, folderPath);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileIds = [], folderIds = [] } = await req.json();

    if (fileIds.length === 1 && folderIds.length === 0) {
      return NextResponse.redirect(
        new URL(`/api/download/${fileIds[0]}`, req.url),
        303
      );
    }

    const zip = new JSZip();

    // Thêm file lẻ
    if (fileIds.length > 0) {
      const files = await db.file.findMany({
        where: { id: { in: fileIds } },
      });

      for (const file of files) {
        const res = await fetch(file.storagePath);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          zip.file(file.name, buf);
        }
      }
    }

    // Thêm folder (gồm cả folder trống)
    for (const folderId of folderIds) {
      await addFolderToZip(zip, folderId);
    }

    const content = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="bulk.zip"`,
      },
    });
  } catch (err) {
    console.error("Bulk download error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
