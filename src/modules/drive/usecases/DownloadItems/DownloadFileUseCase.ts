import { FileRepository } from "../../repositories/FileRepository"
import { PermissionService } from "../../services/PermissionService"

export class DownloadFileUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly permission: PermissionService
  ) {}

  async execute(fileId: string, userId?: string) {
    const file = await this.fileRepo.findById(fileId)
    if (!file) throw new Error("NOT_FOUND")

    if (!this.permission.canDownloadFile(file, userId)) {
      throw new Error("FORBIDDEN")
    }

    return file
  }
}
