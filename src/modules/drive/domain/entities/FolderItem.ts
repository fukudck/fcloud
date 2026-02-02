// domain/entities/FolderItem.ts
import { DriveItem } from "./DriveItem"
import { ItemType } from "../enums/ItemType"

export class FolderItem extends DriveItem {
  constructor(
    id: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    parentId: string | null,
    userId: string,
    public readonly itemCount?: number
  ) {
    super(id, name, createdAt, updatedAt, parentId, userId)
  }

  getType(): ItemType {
    return ItemType.FOLDER
  }
  isOwnedBy(userId: string) {
    return this.userId === userId
  }
}
