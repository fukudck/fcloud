// domain/entities/FileItem.ts
import { DriveItem } from "./DriveItem"
import { ItemType } from "../enums/ItemType"

export class FileItem extends DriveItem {
  constructor(
    id: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    parentId: string | null,
    userId: string,
    public readonly size: number,
    public readonly mimeType: string,
    public readonly shareable: boolean,
    public readonly storagePath: string
  ) {
    super(id, name, createdAt, updatedAt, parentId, userId)
  }

  getType(): ItemType {
    return ItemType.FILE
  }
  isOwnedBy(userId: string) {
    return this.userId === userId
  }
}
