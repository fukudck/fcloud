"use client"
import { useState } from "react"
import type React from "react"

import { Folder, File, Download, Share2, Users, Clock, Upload, FolderPlus, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
  },
  {
    id: "8",
    name: "Archives",
    type: "folder",
    itemCount: 8,
    dateUploaded: "2024-01-05",
    isShared: false,
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

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
    console.log("[v0] Files dropped:", e.dataTransfer.files)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      console.log("[v0] Files selected:", files)
    }
  }

  const createFolder = () => {
    if (newFolderName.trim()) {
      console.log("[v0] Creating folder:", newFolderName)
      setNewFolderName("")
      setFolderDialogOpen(false)
    }
  }

  const handleSelectFile = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles((prev) => [...prev, fileId])
    } else {
      setSelectedFiles((prev) => prev.filter((id) => id !== fileId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(mockFiles.map((file) => file.id))
    } else {
      setSelectedFiles([])
    }
  }

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    console.log("[v0] Deleting files:", selectedFiles)
    // Handle delete logic here
    setSelectedFiles([])
    setDeleteDialogOpen(false)
  }

  const getSelectedFileNames = () => {
    return mockFiles.filter((file) => selectedFiles.includes(file.id)).map((file) => file.name)
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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
                  dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-600"
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

        {selectedFiles.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete ({selectedFiles.length})
          </Button>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the following {selectedFiles.length} item
              {selectedFiles.length > 1 ? "s" : ""}? This action cannot be undone.
            </p>
            <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-muted/50">
              <ul className="space-y-1">
                {getSelectedFileNames().map((fileName, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full flex-shrink-0" />
                    {fileName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={selectedFiles.length === mockFiles.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all files"
                  />
                </div>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Shared</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFiles.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={selectedFiles.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectFile(item.id, checked as boolean)}
                      aria-label={`Select ${item.name}`}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.type === "folder" ? (
                      <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.mimeType && (
                    <Badge variant="secondary" className="text-xs">
                      {getMimeTypeDisplay(item.mimeType)}
                    </Badge>
                  )}
                  {item.type === "folder" && (
                    <Badge variant="outline" className="text-xs">
                      Folder
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.type === "folder" ? `${item.itemCount} items` : item.size}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.dateUploaded && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.dateUploaded).toLocaleDateString()}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {item.isShared && (
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {item.sharedWith}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
