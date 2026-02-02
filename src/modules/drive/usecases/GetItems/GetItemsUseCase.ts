// usecases/GetItems/GetItemsUseCase.ts
import { FileRepository } from "@/modules/drive/repositories/FileRepository"
import { FolderRepository } from "@/modules/drive/repositories/FolderRepository"
import { ItemViewType } from "@/modules/drive/domain/enums/ItemTypeView"
import { DriveItem } from "@/modules/drive/domain/entities/DriveItem"

export class GetItemsUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly folderRepo: FolderRepository
  ) {}

  async execute(
    userId: string,
    viewType: ItemViewType,
    folderId: string | null
  ): Promise<DriveItem[]> {
    switch (viewType) {
      case ItemViewType.SHARED:
        return this.fileRepo.findShared(userId)

      case ItemViewType.IMAGES:
        return this.fileRepo.findImages(userId)

      case ItemViewType.VIDEOS:
        return this.fileRepo.findVideos(userId)

      case ItemViewType.DOCUMENTS:
        return this.fileRepo.findDocuments(userId)

      case ItemViewType.TRASH:
        return this.fileRepo.findTrashed(userId)

      case ItemViewType.ROOT:
      case ItemViewType.FOLDER: {
        const folders = await this.folderRepo.findByParent(userId, folderId)
        const files = await this.fileRepo.findByFolder(userId, folderId)
        return [...folders, ...files]
      }
    }
  }
}
