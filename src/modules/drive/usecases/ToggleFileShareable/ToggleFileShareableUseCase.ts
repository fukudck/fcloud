import { FileRepository } from "../../repositories/FileRepository"

export class ToggleFileShareableUseCase {
  constructor(
    private readonly fileRepo: FileRepository
  ) {}

  async execute(userId: string, fileId: string) {
    const file = await this.fileRepo.findById(fileId)

    if (file.userId !== userId) {
      throw new Error("Forbidden")
    }

    const newShareable = !file.shareable

    await this.fileRepo.setShareable(fileId, newShareable)

    return {
      id: file.id,
      shareable: newShareable,
      url: newShareable ? file.storagePath : null,
    }
  }
}
