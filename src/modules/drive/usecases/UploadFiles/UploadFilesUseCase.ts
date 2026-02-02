// modules/drive/usecases/UploadFiles/UploadFilesUseCase.ts
import { FileRepository } from "@/modules/drive/repositories/FileRepository"
import { UserRepository } from "@/modules/user/repositories/UserRepository"
import { UploadFilesInput } from "./UploadFilesInput"

export class UploadFilesUseCase {
  constructor(
    private readonly fileRepo: FileRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(input: UploadFilesInput) {
    // CHECK USER VALID
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new Error("User not found")

    const totalUploadSize = input.files.reduce(
      (sum, f) => sum + f.size,
      0
    )
    const usedSpace = await this.userRepo.getUsedSpace(user.id)
    if (usedSpace + totalUploadSize > user.totalQuota) {
      throw new Error("Storage quota exceeded: " + usedSpace)
    }

    const createdFiles = []

    for (const f of input.files) {
      const file = await this.fileRepo.create({
        name: f.name,
        size: f.size,
        mimeType: f.mimeType,
        storagePath: f.storagePath,
        userId: input.userId,
        folderId: input.folderId,
      })
      createdFiles.push(file)
    }


    return createdFiles
  }
}
