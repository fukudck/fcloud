// modules/drive/usecases/UploadFiles/UploadFilesInput.ts
export interface UploadFilesInput {
  userId: string
  folderId: string | null
  files: {
    name: string
    size: number
    mimeType: string
    storagePath: string
  }[]
}
