"use client"
import { useState } from "react"
import type React from "react"

import {
  Folder,
  File,
  Download,
  Share2,
  Clock,
  Upload,
  FolderPlus,
  Trash2,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  CloudUpload,
  X,
  Eye,
  FileText,
  FileX,
  Copy,
  Check,
  Globe,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: string
  itemCount?: number
  mimeType?: string
  dateUploaded?: string
  isShared?: boolean
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

type SortField = "name" | "type" | "size" | "modified" | "shared"
type SortDirection = "asc" | "desc"

export default function FileManager() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareFile, setShareFile] = useState<FileItem | null>(null)
  const [shareType, setShareType] = useState<"private" | "public">("private")
  const [copied, setCopied] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [uploadFiles, setUploadFiles] = useState<File[]>([])

  const getMimeTypeDisplay = (mimeType?: string) => {
    if (!mimeType) return ""
    if (mimeType.includes("pdf")) return "PDF"
    if (mimeType.includes("presentation")) return "PowerPoint"
    if (mimeType.includes("spreadsheet")) return "Excel"
    if (mimeType.includes("wordprocessing")) return "Word"
    if (mimeType.includes("image")) return "Image"
    return "File"
  }

  const canPreviewInBrowser = (mimeType?: string) => {
    if (!mimeType) return false
    return (
      mimeType.startsWith("image/") ||
      mimeType === "application/pdf" ||
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType.includes("javascript") ||
      mimeType.includes("css") ||
      mimeType.includes("html")
    )
  }

  const handleFileClick = (file: FileItem) => {
    if (file.type === "folder") {
      console.log("[v0] Opening folder:", file.name)
      return
    }

    setPreviewFile(file)
    setPreviewDialogOpen(true)
  }

  const renderPreviewContent = () => {
    if (!previewFile || !previewFile.mimeType) return null

    if (canPreviewInBrowser(previewFile.mimeType)) {
      if (previewFile.mimeType.startsWith("image/")) {
        return (
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg">
            <img
              src={`/abstract-geometric-shapes.png?key=uq9sj&height=400&width=600&query=${previewFile.name}`}
              alt={previewFile.name}
              className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
            />
          </div>
        )
      }

      if (previewFile.mimeType === "application/pdf") {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">PDF Document</p>
              <p className="text-sm text-muted-foreground">
                This PDF can be viewed in your browser. Click download to open it.
              </p>
            </div>
          </div>
        )
      }

      if (
        previewFile.mimeType.startsWith("text/") ||
        previewFile.mimeType === "application/json" ||
        previewFile.mimeType.includes("javascript") ||
        previewFile.mimeType.includes("css") ||
        previewFile.mimeType.includes("html")
      ) {
        return (
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="bg-background border rounded-md p-4 font-mono text-sm max-h-96 overflow-auto">
              <div className="text-muted-foreground">
                {previewFile.mimeType.includes("javascript") && "// JavaScript file content would appear here"}
                {previewFile.mimeType.includes("css") && "/* CSS file content would appear here */"}
                {previewFile.mimeType.includes("html") && "<!-- HTML file content would appear here -->"}
                {previewFile.mimeType.startsWith("text/") && "Text file content would appear here..."}
                {previewFile.mimeType === "application/json" && '{\n  "example": "JSON content would appear here"\n}'}
              </div>
            </div>
          </div>
        )
      }
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg space-y-4">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-medium">Cannot preview this file</p>
          <p className="text-sm text-muted-foreground">
            This file type cannot be viewed in the browser. Download it to view with an appropriate application.
          </p>
        </div>
      </div>
    )
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
    const files = Array.from(e.dataTransfer.files)
    setUploadFiles((prev) => [...prev, ...files])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setUploadFiles((prev) => [...prev, ...fileArray])
    }
  }

  const removeUploadFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadConfirm = () => {
    console.log("[v0] Uploading files:", uploadFiles)
    setUploadFiles([])
    setUploadDialogOpen(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
    setSelectedFiles([])
    setDeleteDialogOpen(false)
  }

  const getSelectedFileNames = () => {
    return mockFiles.filter((file) => selectedFiles.includes(file.id)).map((file) => file.name)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortedFiles = () => {
    return [...mockFiles].sort((a, b) => {
      let aValue: string | number = ""
      let bValue: string | number = ""

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "type":
          aValue = a.type === "folder" ? "0" : "1" + (a.mimeType || "")
          bValue = b.type === "folder" ? "0" : "1" + (b.mimeType || "")
          break
        case "size":
          aValue = a.type === "folder" ? a.itemCount || 0 : Number.parseFloat(a.size?.replace(/[^\d.]/g, "") || "0")
          bValue = b.type === "folder" ? b.itemCount || 0 : Number.parseFloat(b.size?.replace(/[^\d.]/g, "") || "0")
          break
        case "modified":
          aValue = new Date(a.dateUploaded || "").getTime()
          bValue = new Date(b.dateUploaded || "").getTime()
          break
        case "shared":
          aValue = a.isShared ? 1 : 0
          bValue = b.isShared ? 1 : 0
          break
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
  }

  const handleShareClick = (file: FileItem) => {
    setShareFile(file)
    setShareType(file.isShared ? "public" : "private")
    setShareDialogOpen(true)
    setCopied(false)
  }

  const generatePublicLink = (fileId: string) => {
    return `${window.location.origin}/shared/${fileId}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleShareSave = () => {
    if (shareFile) {
      console.log("[v0] Updating share settings for:", shareFile.name, "to:", shareType)
      // Update the file's share status in your data
      setShareDialogOpen(false)
    }
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
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CloudUpload className="h-5 w-5" />
                  Upload Files
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                    dragOver
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-muted-foreground/25 hover:border-muted-foreground/40"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div
                      className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                        dragOver ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <CloudUpload className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        {dragOver ? "Drop files here" : "Drag & drop files here"}
                      </h3>
                      <p className="text-sm text-muted-foreground">or click the button below to browse</p>
                    </div>
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <Button asChild variant="outline" size="lg">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Browse Files
                      </label>
                    </Button>
                  </div>
                </div>

                {uploadFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Selected Files ({uploadFiles.length})</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadFiles([])}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/20">
                      {uploadFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-background rounded-lg border"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadFile(index)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false)
                    setUploadFiles([])
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUploadConfirm} disabled={uploadFiles.length === 0} className="min-w-24">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {uploadFiles.length > 0 && `(${uploadFiles.length})`}
                </Button>
              </DialogFooter>
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

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {previewFile && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    {previewFile.type === "file" ? (
                      <File className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Folder className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="font-medium">{previewFile.name}</span>
                  </div>
                  {previewFile.mimeType && (
                    <Badge variant="secondary" className="text-xs">
                      {getMimeTypeDisplay(previewFile.mimeType)}
                    </Badge>
                  )}
                  {previewFile.size && <span className="text-sm text-muted-foreground">{previewFile.size}</span>}
                </div>
                {renderPreviewContent()}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            {previewFile && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share File
            </DialogTitle>
          </DialogHeader>
          {shareFile && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{shareFile.name}</p>
                  <p className="text-sm text-muted-foreground">{shareFile.size}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Sharing Options</Label>
                <RadioGroup value={shareType} onValueChange={(value) => setShareType(value as "private" | "public")}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="private" id="private" />
                    <div className="flex items-center gap-2 flex-1">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="private" className="font-medium cursor-pointer">
                          Private
                        </Label>
                        <p className="text-sm text-muted-foreground">Only you can access this file</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="public" id="public" />
                    <div className="flex items-center gap-2 flex-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="public" className="font-medium cursor-pointer">
                          Public
                        </Label>
                        <p className="text-sm text-muted-foreground">Anyone with the link can access this file</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {shareType === "public" && (
                  <div className="space-y-3 p-4 bg-muted/20 rounded-lg border">
                    <Label className="text-sm font-medium">Public Link</Label>
                    <div className="flex items-center gap-2">
                      <Input value={generatePublicLink(shareFile.id)} readOnly className="flex-1 font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatePublicLink(shareFile.id))}
                        className="flex-shrink-0"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This link will allow anyone to view and download your file.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareSave}>Save Changes</Button>
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
              <TableHead>
                <button
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                  onClick={() => handleSort("name")}
                >
                  Name
                  {renderSortIcon("name")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                  onClick={() => handleSort("type")}
                >
                  Type
                  {renderSortIcon("type")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                  onClick={() => handleSort("size")}
                >
                  Size
                  {renderSortIcon("size")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                  onClick={() => handleSort("modified")}
                >
                  Modified
                  {renderSortIcon("modified")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                  onClick={() => handleSort("shared")}
                >
                  Shared
                  {renderSortIcon("shared")}
                </button>
              </TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedFiles().map((item) => (
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
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleFileClick(item)}
                  >
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
                <TableCell className="w-16">
                  <div className="flex justify-start">
                    {item.isShared && (
                      <Badge variant="secondary" className="text-xs">
                        <Share2 className="h-3 w-3 mr-1" />
                        Shared
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    {item.type === "file" && (
                      <Button variant="ghost" size="sm" onClick={() => handleShareClick(item)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
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
