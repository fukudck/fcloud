import { FileItem } from "../domain/entities/FileItem"

export class PermissionService {
  canDownloadFile(file: FileItem, userId?: string) {
    if (file.shareable) return true
    if (!userId) return false
    return file.isOwnedBy(userId)
  }
}
