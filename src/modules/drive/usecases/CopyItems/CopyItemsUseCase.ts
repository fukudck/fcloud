import { FileRepository } from "../../repositories/FileRepository"
import { FolderRepository } from "../../repositories/FolderRepository"
import { CopyNameService } from "../../services/CopyNameService"

type CopyResult = {
  files: string[]
  folders: string[]
}

export class CopyItemsUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly folderRepo: FolderRepository
  ) {}

  async execute(params: {
    userId: string
    fileIds: string[]
    folderIds: string[]
    targetFolderId: string | null
  }): Promise<CopyResult> {
    const { userId, fileIds, folderIds, targetFolderId } = params

    const result: CopyResult = { files: [], folders: [] }

    // 1️⃣ COPY FILES
    for (const fileId of fileIds) {
      const file = await this.fileRepo.findById(fileId)
      if (!file || file.userId !== userId) continue

      const copied = await this.fileRepo.create({
        name: CopyNameService.generate(file.name),
        size: file.size,
        mimeType: file.mimeType,
        storagePath: file.storagePath,
        userId,
        folderId: targetFolderId,
      })

      result.files.push(copied.id)
    }

    // 2️⃣ COPY FOLDERS (RECURSIVE)
    for (const folderId of folderIds) {
      const folder = await this.folderRepo.findById(folderId)
      if (!folder || folder.userId !== userId) continue

      const newFolder = await this.copyFolderRecursive(
        folder.id,
        userId,
        targetFolderId,
        true
      )

      result.folders.push(newFolder.id)
    }

    return result
  }

  // ================= PRIVATE =================

  private async copyFolderRecursive(
    folderId: string,
    userId: string,
    parentId: string | null,
    addCopySuffix: boolean
  ) {
    const folder = await this.folderRepo.findById(folderId)
    if (!folder) throw new Error("Folder not found")

    const newFolder = await this.folderRepo.create(
      userId,
      addCopySuffix
        ? CopyNameService.generate(folder.name)
        : folder.name,
      parentId
    )

    // Copy files
    const files = await this.folderRepo.findFiles(folderId)
    for (const file of files) {
      await this.fileRepo.create({
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        storagePath: file.storagePath,
        userId,
        folderId: newFolder.id,
      })
    }

    // Copy children folders
    const children = await this.folderRepo.findChildren(folderId)
    for (const child of children) {
      await this.copyFolderRecursive(child.id, userId, newFolder.id, false)
    }

    return newFolder
  }
}
