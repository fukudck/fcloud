// modules/drive/infrastructure/prisma/PrismaFolderRepository.ts
import { db } from "@/lib/db"
import { FolderRepository } from "@/modules/drive/repositories/FolderRepository"
import { FolderItem } from "@/modules/drive/domain/entities/FolderItem"
import { FileItem } from "../../domain/entities/FileItem"

export class PrismaFolderRepository implements FolderRepository {
  async rename(id: string, name: string): Promise<void> {
    await db.folder.update({
        where: { id },
        data: { name },
      })
    }

  async findByIds(ids: string[]): Promise<FolderItem[]> {
    if (ids.length === 0) return []

    const folders = await db.folder.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        _count: {
          select: {
            children: true,
            files: true,
          },
        },
      },
    })

    return folders.map(
      f =>
        new FolderItem(
          f.id,
          f.name,
          f.createdAt,
          f.updatedAt,
          f.parentId,
          f.userId,
          f._count.children + f._count.files
        )
    )
  }
    async deleteRecursive(folderId: string, userId: string): Promise<number> {
    return await db.$transaction(async (tx) => {
      let freedSpace = 0

      /* ===== 1. Lấy toàn bộ file trong folder hiện tại ===== */
      const files = await tx.file.findMany({
        where: {
          folderId,
          userId,
        },
        select: { size: true },
      })

      freedSpace += files.reduce((sum, f) => sum + f.size, 0)

      /* ===== 2. Xóa file ===== */
      await tx.file.deleteMany({
        where: {
          folderId,
          userId,
        },
      })

      /* ===== 3. Lấy subfolder ===== */
      const children = await tx.folder.findMany({
        where: {
          parentId: folderId,
          userId,
        },
        select: { id: true },
      })

      /* ===== 4. Đệ quy xóa subfolder ===== */
      for (const child of children) {
        freedSpace += await this.deleteRecursive(child.id, userId)
      }

      /* ===== 5. Xóa folder hiện tại ===== */
      await tx.folder.delete({
        where: {
          id: folderId,
          userId,
        },
      })

      return freedSpace
    })
  }
  async findChildren(id: string): Promise<FolderItem[]> {
    const folders = await db.folder.findMany({ 
      where: { parentId: id }, })
    return folders.map(
      f =>
        new FolderItem(
          f.id,
          f.name,
          f.createdAt,
          f.updatedAt,
          f.parentId,
          f.userId
        )
    )
  }
  async findFiles(id: string): Promise<FileItem[]> {
    const files = await db.file.findMany({ where: { folderId: id } })
    return files.map(this.mapToFileItem)
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
  private mapToFolderItem(f: any): FolderItem {
      return new FolderItem(
          f.id,
          f.name,
          f.createdAt,
          f.updatedAt,
          f.parentId,
          f.userId,
          f._count.children + f._count.files
        )
    }
  async findById(Id: string): Promise<FolderItem> {
    const folder = await db.folder.findUnique({
      where: { id: Id},
      include: {
        _count: { select: { children: true, files: true } },
      },
    })
    if (!folder) {
      throw new Error(`folder with id ${folder} not found`)
    }
    return this.mapToFolderItem(folder)
    
  }
  async create(userId: string, name: string, parentId: string): Promise<FolderItem> {
    const folder = await db.folder.create({
      data: {
        name,
        parentId: !parentId || parentId === "0" ? null : parentId,
        userId: userId,
      },
    })
    return new FolderItem(
          folder.id,
          folder.name,
          folder.createdAt,
          folder.updatedAt,
          folder.parentId,
          folder.userId
        )
  }
  async findByParent(userId: string, parentId: string | null) {
    const folders = await db.folder.findMany({
      where: { userId, parentId },
      include: {
        _count: { select: { children: true, files: true } },
      },
    })

    return folders.map(
      f =>
        new FolderItem(
          f.id,
          f.name,
          f.createdAt,
          f.updatedAt,
          f.parentId,
          f.userId,
          f._count.children + f._count.files
        )
    )
  }
  async updateParentId(folderIds: string[], userId: string, targetFolderId: string): Promise<void> {
    await db.folder.updateMany({
      where: { id: { in: folderIds }, userId: userId },
      data: { parentId: targetFolderId || null },
    });
  }
}
