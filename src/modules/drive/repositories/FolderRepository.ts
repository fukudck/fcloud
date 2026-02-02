// repositories/FolderRepository.ts
import { FileItem } from "../domain/entities/FileItem"
import { FolderItem } from "../domain/entities/FolderItem"

export interface FolderRepository {
  findByParent(userId: string, parentId: string | null): Promise<FolderItem[]>
  findById(Id: string): Promise<FolderItem>
  updateParentId(folderIds: string[], userId: string, targetFolderId: string): Promise<void>

  create(userId: string, name: string, parentId: string| null): Promise<FolderItem>
  findChildren(id: string): Promise<FolderItem[]>
  findFiles(id: string): Promise<FileItem[]>


  findByIds(ids: string[]): Promise<FolderItem[]>
  deleteRecursive(folderId: string, userId: string): Promise<number>

  rename(id: string, name: string): Promise<void>

}
