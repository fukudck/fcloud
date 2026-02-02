import { FileRepository } from "../../repositories/FileRepository"
import { FolderRepository } from "../../repositories/FolderRepository"

export class DeleteItemsUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly folderRepo: FolderRepository
  ) {}

  async execute(
    userId: string,
    fileIds: string[],
    folderIds: string[]
  ): Promise<void> {

    /* ========= FILE ========= */
    if (fileIds.length > 0) {
      const files = await this.fileRepo.findByIds(fileIds)

      for (const file of files) {
        if (!file.isOwnedBy(userId)) {
          throw new Error("FORBIDDEN")
        }
      }

      await this.fileRepo.deleteMany(fileIds, userId)
    }

    /* ========= FOLDER ========= */
    for (const folderId of folderIds) {
      const folder = await this.folderRepo.findById(folderId)

      if (!folder || !folder.isOwnedBy(userId)) {
        throw new Error("FORBIDDEN")
      }

      const space = await this.folderRepo.deleteRecursive(
        folderId,
        userId
      )

    }

  }
}
