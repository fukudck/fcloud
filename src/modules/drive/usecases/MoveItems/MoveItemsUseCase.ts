import { FileRepository } from "@/modules/drive/repositories/FileRepository"
import { FolderRepository } from "@/modules/drive/repositories/FolderRepository"


export class MoveItemsUseCase{
    constructor(
        private readonly fileRepo: FileRepository,
        private readonly folderRepo: FolderRepository
    ) {}

    async execute(
        userId: string,
        fileIds: string[],
        folderIds: string[],
        targetFolderId: string
    ) {
       if (targetFolderId) {
            const targetFolder = await this.folderRepo.findById(targetFolderId);
            if (!targetFolder) {
                throw new Error("Target folder not found")
            }
        }
        await this.folderRepo.updateParentId(folderIds, userId, targetFolderId)
        await this.fileRepo.updateParentId(fileIds, userId, targetFolderId)
    }
}


