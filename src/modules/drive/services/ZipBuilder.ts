import JSZip from "jszip"
import { FolderRepository } from "../repositories/FolderRepository"
import { PermissionService } from "./PermissionService"

export class ZipBuilder {
  private zip = new JSZip()

  constructor(
    private readonly folderRepo: FolderRepository,
    private readonly permission: PermissionService
  ) {}

  private async fetchBuffer(storagePath: string): Promise<ArrayBuffer | null> {
    const res = await fetch(storagePath)
    if (!res.ok) return null
    return res.arrayBuffer()
  }

  async addFile(
    name: string,
    storagePath: string,
    path: string = "" // 👈 QUAN TRỌNG
  ) {
    const buffer = await this.fetchBuffer(storagePath)
    if (!buffer) return

    this.zip.file(`${path}${name}`, buffer)
  }

  async addFolder(
    folderId: string,
    userId: string,
    basePath: string = ""
  ) {
    const folder = await this.folderRepo.findById(folderId)
    if (!folder || !folder.isOwnedBy(userId)) return

    const currentPath = `${basePath}${folder.name}/`
    const node = this.zip.folder(currentPath)!
    
    const files = await this.folderRepo.findFiles(folderId)
    const children = await this.folderRepo.findChildren(folderId)

    // Folder rỗng
    if (files.length === 0 && children.length === 0) {
      node.file(".keep", "")
    }

    // ✅ add file ĐÚNG PATH
    for (const f of files) {
      if (this.permission.canDownloadFile(f as any, userId)) {
        await this.addFile(f.name, f.storagePath, currentPath)
      }
    }

    // Đệ quy
    for (const c of children) {
      await this.addFolder(c.id, userId, currentPath)
    }
  }

  async build() {
    return this.zip.generateAsync({ type: "nodebuffer" })
  }
}
