import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const userId = session.user.id

  // Lấy query param folderId từ URL
  const { searchParams } = new URL(req.url)
  const folderIdParam = searchParams.get("folderId")
  const folderId = !folderIdParam || folderIdParam === "0" ? null : folderIdParam

  // Lấy folder con + file trong folder hiện tại
  const folders = await db.folder.findMany({
    where: {
      userId,
      parentId: folderId, // null = root
    },
    include: {
      _count: {
        select: { children: true, files: true },
      },
    },
  })

  const files = await db.file.findMany({
    where: {
      userId,
      folderId: folderId, // null = root
    },
  })

  // Mapping
  const items = [
    ...folders.map((f) => ({
      id: f.id,
      name: f.name,
      type: "folder" as const,
      itemCount: f._count.children + f._count.files,
      dateUploaded: f.createdAt.toISOString(),
      isShared: false, // chinh sau
    })),
    ...files.map((file) => ({
      id: file.id,
      name: file.name,
      type: "file" as const,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      mimeType: file.mimeType,
      dateUploaded: file.createdAt.toISOString(),
      lastModified: file.updatedAt.toISOString(),
      isShared: file.shareable,
    })),
  ]

  return new Response(JSON.stringify(items), { status: 200 })
}
