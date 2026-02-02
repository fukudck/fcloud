// app/api/items/parseItemView.ts
import { ItemViewType } from "@/modules/drive/domain/enums/ItemTypeView"

export function parseItemView(folderId: string | null): {
  viewType: ItemViewType
  folderId: string | null
} {
  if (!folderId || folderId === "0") {
    return { viewType: ItemViewType.ROOT, folderId: null }
  }

  if (folderId === "shared") {
    return { viewType: ItemViewType.SHARED, folderId: null }
  }

  if (folderId === "images") {
    return { viewType: ItemViewType.IMAGES, folderId: null }
  }

  if (folderId === "videos") {
    return { viewType: ItemViewType.VIDEOS, folderId: null }
  }

  if (folderId === "documents") {
    return { viewType: ItemViewType.DOCUMENTS, folderId: null }
  }

  if (folderId === "trash") {
    return { viewType: ItemViewType.TRASH, folderId: null }
  }

  return {
    viewType: ItemViewType.FOLDER,
    folderId,
  }
}
