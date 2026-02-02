// modules/drive/infrastructure/mappers/ItemResponseMapper.ts
import { DriveItem } from "@/modules/drive/domain/entities/DriveItem"
import { ItemType } from "@/modules/drive/domain/enums/ItemType"
import { FileItem } from "@/modules/drive/domain/entities/FileItem"
import { FolderItem } from "@/modules/drive/domain/entities/FolderItem"

export function mapToResponse(item: DriveItem) {
  if (item.getType() === ItemType.FILE) {
    const f = item as FileItem
    return {
      id: f.id,
      name: f.name,
      type: "file",
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      mimeType: f.mimeType,
      dateUploaded: f.createdAt.toISOString(),
      lastModified: f.updatedAt.toISOString(),
      isShared: f.shareable,
      parentId: f.parentId,
      url: f.storagePath,
    }
  }

  const folder = item as FolderItem
  return {
    id: folder.id,
    name: folder.name,
    type: "folder",
    itemCount: folder.itemCount,
    dateUploaded: folder.createdAt.toISOString(),
    parentId: folder.parentId,
    url: null,
  }
}
