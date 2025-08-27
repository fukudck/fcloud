import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const file = await db.file.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      createdAt: true,
      shareable: true,
      storagePath: true,
    },
  })

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  if (!file.shareable) {
    return NextResponse.json({ error: "File is not shared" }, { status: 403 })
  }

  return NextResponse.json({
    id: file.id,
    name: file.name,
    type: file.mimeType?.split("/").pop() || "file",
    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    modifiedDate: file.createdAt.toISOString().split("T")[0],
    shared: file.shareable,
    isFolder: false,
    url: file.storagePath,
  })
}
