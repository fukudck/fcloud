import { FolderRepository } from "@/modules/drive/repositories/FolderRepository"
import { UserRepository } from "@/modules/user/repositories/UserRepository"

export class CreateFolderUseCase {
    constructor (
        private readonly folderRepo: FolderRepository,
        private readonly userRepo: UserRepository
    ) {}
    async execute(userId: string, name: string, parentId: string ) {  
        await this.folderRepo.create(userId, name, parentId)
    }
}

