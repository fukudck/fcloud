// domain/entities/DriveItem.ts
import { ItemType } from "../enums/ItemType"

export abstract class DriveItem {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly parentId: string | null,
    public userId: string
  ) {}

  abstract getType(): ItemType
}
