"use client"
import { useState } from "react"
import type React from "react"

import { Folder, File, Download, Share2, Users, Clock, Upload, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: string
  itemCount?: number
  mimeType?: string
  dateUploaded?: string
  isShared?: boolean
  sharedWith?: number
  lastModified?: string
}

const mockFiles: FileItem[] = [
  {
    id: "1",
    name: "Project Files",
    type: "folder",
    itemCount: 12,
    dateUploaded: "2024-01-15",
    isShared: true,
    sharedWith: 3,
  },
  {
    id: "2",
    name: "report.pdf",
    type: "file",
    size: "2.3 MB",
    mimeType: "application/pdf",
    dateUploaded: "2024-01-20",
    isShared: false,
    lastModified: "2024-01-20 14:30",
  },
  {
    id: "3",
    name: "presentation.pptx",
    type: "file",
    size: "4.5 MB",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    dateUploaded: "2024-01-18",
    isShared: true,
    sharedWith: 5,
    lastModified: "2024-01-19 09:15",
  },
  {
    id: "4",
    name: "spreadsheet.xlsx",
    type: "file",
    size: "1.7 MB",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dateUploaded: "2024-01-17",
    isShared: false,
    lastModified: "2024-01-17 16:45",
  },
  {
    id: "5",
    name: "Design Assets",
    type: "folder",
    itemCount: 24,
    dateUploaded: "2024-01-10",
    isShared: true,
    sharedWith: 8,
  },
  {
    id: "6",
    name: "image.jpg",
    type: "file",
    size: "1.2 MB",
    mimeType: "image/jpeg",
    dateUploaded: "2024-01-22",
    isShared: false,
    lastModified: "2024-01-22 11:20",
  },
  {
    id: "7",
    name: "document.docx",
    type: "file",
    size: "3.4 MB",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    dateUploaded: "2024-01-16",
    isShared: true,
    sharedWith: 2,
    lastModified: "2024-01-21 13:10",
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
]

export default function FileManager() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const getMimeTypeDisplay = (mimeType?: string) => {
    if (!mimeType) return ""
    if (mimeType.includes("pdf")) return "PDF"
    if (mimeType.includes("presentation")) return "PowerPoint"
    if (mimeType.includes("spreadsheet")) return "Excel"
    if (mimeType.includes("wordprocessing")) return "Word"
    if (mimeType.includes("image")) return "Image"
    return "File"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    // Handle file drop logic here
    console.log("[v0] Files dropped:", e.dataTransfer.files)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      console.log("[v0] Files selected:", files)
      // Handle file upload logic here
    }
  }

  const createFolder = () => {
    if (newFolderName.trim()) {
      console.log("[v0] Creating folder:", newFolderName)
      // Handle folder creation logic here
      setNewFolderName("")
      setFolderDialogOpen(false)
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mb-4">Support for multiple files</p>
              <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose Files
                </label>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createFolder}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-1">
          {mockFiles.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-4 rounded-lg hover:bg-gray-100 group transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-4 flex-1">
                {item.type === "folder" ? (
                  <Folder className="h-8 w-8 text-blue-500 flex-shrink-0" />
                ) : (
                  <File className="h-8 w-8 text-gray-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-gray-900 truncate">{item.name}</div>
                    {item.isShared && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {item.sharedWith}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{item.type === "folder" ? `${item.itemCount} items` : item.size}</span>
                    {item.mimeType && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{getMimeTypeDisplay(item.mimeType)}</span>
                    )}
                    {item.dateUploaded && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.dateUploaded).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
