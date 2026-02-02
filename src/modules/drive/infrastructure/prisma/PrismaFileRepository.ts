// modules/drive/infrastructure/prisma/PrismaFileRepository.ts
import { db } from "@/lib/db"
import { FileRepository } from "@/modules/drive/repositories/FileRepository"
import { FileItem } from "@/modules/drive/domain/entities/FileItem"
import { ItemStatus } from "@prisma/client"

export class PrismaFileRepository implements FileRepository {
  async setShareable(id: string, value: boolean): Promise<void> {
    await db.file.update({
      where: { id },
      data: { shareable: value },
    })
  }
  async rename(id: string, name: string): Promise<void> {
    await db.file.update({
      where: { id },
      data: { name },
    })
  }

  async deleteMany(ids: string[], userId: string): Promise<void> {
    if (ids.length === 0) return

    await db.file.deleteMany({
      where: {
        id: { in: ids },
        userId,
      }})
  }
   

  async findByIds(
    fileIds: string[]
  ): Promise<FileItem[]> {
    const files = await db.file.findMany({
      where: {
        id: { in: fileIds }
      },
    })

    return files.map(this.mapToFileItem)
  }

  async updateParentId(fileIds: string[], userId: string, targetFolderId: string): Promise<void> {
    await db.file.updateMany({
      where: { id: { in: fileIds }, userId: userId },
      data: { folderId: targetFolderId || null },
    });
  }
  async findById(fileId: string): Promise<FileItem> {
    const file = await db.file.findUnique({
      where: { id: fileId },
    })
    if (!file) {
      throw new Error(`File with id ${fileId} not found`)
    }
    return this.mapToFileItem(file)
  }

  private mapToFileItem(f: any): FileItem {
    return new FileItem(
      f.id,
      f.name,
      f.createdAt,
      f.updatedAt,
      f.folderId,
      f.userId,
      f.size,
      f.mimeType ?? "",
      f.shareable,
      f.storagePath
    )
  }

  async create(input: {
    name: string
    size: number
    mimeType: string
    storagePath: string
    userId: string
    folderId: string | null
  }) {
    const file = await db.file.create({ data: input })
    return this.mapToFileItem(file)
  }

  async delete(userId: string, fileId: string) {
    await db.file.delete({
      where: { id: fileId, userId },
    })
  }

  async findByFolder(userId: string, folderId: string | null) {
    const files = await db.file.findMany({
      where: { userId, folderId },
    })

    return files.map(f => this.mapToFileItem(f))
  }

  async findShared(userId: string) {
    const files = await db.file.findMany({
      where: { userId, shareable: true },
    })
    return files.map(f => this.mapToFileItem(f))
  }

  async findImages(userId: string) {
    const files = await db.file.findMany({
      where: { userId, mimeType: { startsWith: "image/" } },
    })
    return files.map(f => this.mapToFileItem(f))
  }

  async findVideos(userId: string) {
    const files = await db.file.findMany({
      where: { userId, mimeType: { startsWith: "video/" } },
    })
    return files.map(f => this.mapToFileItem(f))
  }

  async findDocuments(userId: string) {
    const files = await db.file.findMany({
      where: {
        userId,
        OR: [
          { mimeType: { startsWith: "application/pdf" } },
          { mimeType: { startsWith: "application/msword" } },
          { mimeType: { startsWith: "application/vnd.openxmlformats-officedocument" } },
          { mimeType: { startsWith: "text/" } },
        ],
      },
    })
    return files.map(f => this.mapToFileItem(f))
  }

  async findTrashed(userId: string) {
    const files = await db.file.findMany({
      where: { userId, status: ItemStatus.TRASH },
    })
    return files.map(f => this.mapToFileItem(f))
  }
}
