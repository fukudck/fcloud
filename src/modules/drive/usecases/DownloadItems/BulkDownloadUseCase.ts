import { FileRepository } from "../../repositories/FileRepository"
import { PermissionService } from "../../services/PermissionService"
import { ZipBuilder } from "../../services/ZipBuilder"

export class BulkDownloadUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly zip: ZipBuilder,
    private readonly permission: PermissionService
  ) {}

  async execute(
    fileIds: string[],
    folderIds: string[],
    userId: string
  ) {
    const files = await this.fileRepo.findByIds(fileIds)

    for (const f of files) {
      if (this.permission.canDownloadFile(f, userId)) {
        await this.zip.addFile(f.name, f.storagePath)
      }
    }

    for (const folderId of folderIds) {
      await this.zip.addFolder(folderId, userId)
    }

    return this.zip.build()
  }
}
