import { auth } from "@/auth"
import { db } from "@/lib/db"
import { ItemStatus } from "@prisma/client"


function mapFile(file: any) {
  return {
    id: file.id,
    name: file.name,
    type: "file" as const,
    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    mimeType: file.mimeType,
    dateUploaded: file.createdAt.toISOString(),
    lastModified: file.updatedAt.toISOString(),
    isShared: file.shareable,
    parentId: file.folderId,
    url: file.storagePath, 
  }
}


function mapFolder(f: any) {
  return {
    id: f.id,
    name: f.name,
    type: "folder" as const,
    itemCount: f._count.children + f._count.files,
    dateUploaded: f.createdAt.toISOString(),
    isShared: false,
    parentId: f.parentId,
    url: null, // folder không có URL để preview
  }
}

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(req.url)
  const folderIdParam = searchParams.get("folderId")

  let items: any[] = []

  if (folderIdParam === "shared") {
    const files = await db.file.findMany({
      where: { userId, shareable: true },
    })
    items = files.map(mapFile)
  } else if (folderIdParam === "images") {
    const files = await db.file.findMany({
      where: { userId, mimeType: { startsWith: "image/" } },
    })
    items = files.map(mapFile)
  } else if (folderIdParam === "trash") {
    const files = await db.file.findMany({
      where: { userId, status: ItemStatus.TRASH },
    })
    items = files.map(mapFile)
  } else if (folderIdParam === "documents") {
    const files = await db.file.findMany({
      where: {
        userId,
        OR: [
          { mimeType: { startsWith: "application/pdf" } },
          { mimeType: { startsWith: "application/msword" } },
          { mimeType: { startsWith: "application/vnd.openxmlformats-officedocument" } },
          { mimeType: { startsWith: "text/" } },
        ],
      },
    })
    items = files.map(mapFile)
  } else if (folderIdParam === "videos") {
    const files = await db.file.findMany({
      where: { userId, mimeType: { startsWith: "video/" } },
    })
    items = files.map(mapFile)
  } else {
    const folderId = !folderIdParam || folderIdParam === "0" ? null : folderIdParam

    const folders = await db.folder.findMany({
      where: { userId, parentId: folderId },
      include: { _count: { select: { children: true, files: true } } },
    })

    const files = await db.file.findMany({
      where: { userId, folderId },
    })

    items = [...folders.map(mapFolder), ...files.map(mapFile)]
  }

  return new Response(JSON.stringify(items), { status: 200 })
}
