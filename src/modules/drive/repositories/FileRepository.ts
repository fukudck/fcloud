// repositories/FileRepository.ts
import { FileItem } from "../domain/entities/FileItem"

export interface FileRepository {
  findByFolder(userId: string, folderId: string | null): Promise<FileItem[]>
  findShared(userId: string): Promise<FileItem[]>
  findImages(userId: string): Promise<FileItem[]>
  findVideos(userId: string): Promise<FileItem[]>
  findDocuments(userId: string): Promise<FileItem[]>
  findTrashed(userId: string): Promise<FileItem[]>
  findById(fileId: string): Promise<FileItem>
  updateParentId(fileIds: string[], userId: string, targetFolderId: string): Promise<void>
  findByIds(fileIds: string[]): Promise<FileItem[]>

  create(input: {
    name: string
    size: number
    mimeType: string
    storagePath: string
    userId: string
    folderId: string | null
  }): Promise<FileItem>

  delete(userId: string, fileId: string): Promise<void>

  deleteMany(ids: string[], userId: string): Promise<void>
  rename(id: string, name: string): Promise<void>
  setShareable(id: string, value: boolean): Promise<void>

}
