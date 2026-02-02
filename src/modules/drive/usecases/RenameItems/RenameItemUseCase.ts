import { FileRepository } from "../../repositories/FileRepository"
import { FolderRepository } from "../../repositories/FolderRepository"

export type RenameType = "file" | "folder"

export class RenameItemUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly folderRepo: FolderRepository
  ) {}

  async execute(
    userId: string,
    itemId: string,
    type: RenameType,
    newName: string
  ) {
    if (!newName.trim()) {
      throw new Error("Invalid name")
    }

    if (type === "file") {
      const file = await this.fileRepo.findById(itemId)

      if (file.userId !== userId) {
        throw new Error("Forbidden")
      }

      await this.fileRepo.rename(itemId, newName)
      return { id: itemId, type, name: newName }
    }

    if (type === "folder") {
      const folder = await this.folderRepo.findById(itemId)

      if (!folder.isOwnedBy(userId)) {
        throw new Error("Forbidden")
      }

      await this.folderRepo.rename(itemId, newName)
      return { id: itemId, type, name: newName }
    }

    throw new Error("Invalid type")
  }
}
