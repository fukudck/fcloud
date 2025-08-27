"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"

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
  Loader2,
  MoreHorizontal,
  Edit3,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import useSWR, { mutate } from "swr"

import { genUploader } from "uploadthing/client";

import type { ourFileRouter } from "@/app/api/uploadthing/core"

export const { uploadFiles } = genUploader<typeof ourFileRouter>();

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const restrictedFolders = ["shared", "videos", "images", "documents"]

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
  parentId?: string | null
  url?: string | null
}



type SortField = "name" | "type" | "size" | "modified" | "shared"
type SortDirection = "asc" | "desc"

interface FileManagerProps {
  currentFolderId: string | null
}

export default function FileManager({ currentFolderId }: FileManagerProps) {
  const { data, error, isLoading } = useSWR<FileItem[]>(
    `/api/files${currentFolderId ? `?folderId=${currentFolderId}` : ""}`,
    fetcher
  )
  
  const mockFiles: FileItem[] = data ?? []
  const router = useRouter()
  // const [isLoading, setIsLoading] = useState(true)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameFile, setRenameFile] = useState<FileItem | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)
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
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false)
  //   }, 1500)
  //   return () => clearTimeout(timer)
  // }, [])

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
      router.push(`/dashboard/${file.id}`)
      return
    }

    setPreviewFile(file)
    setPreviewDialogOpen(true)
    setPreviewLoading(true)

    setTimeout(() => {
      setPreviewLoading(false)
    }, 800)
  }

  const renderPreviewContent = () => {
    if (!previewFile || !previewFile.mimeType) return null
  
    if (previewLoading) {
      return (
        <div className="flex items-center justify-center p-12 bg-muted/20 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      )
    }
  
    if (canPreviewInBrowser(previewFile.mimeType)) {
      // 🖼️ Preview ảnh
      if (previewFile.mimeType.startsWith("image/")) {
        return (
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg">
            <img
              src={previewFile.url ?? ""}
              alt={previewFile.name}
              className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
            />
          </div>
        )
      }
  
      // 📄 Preview PDF (nhúng trực tiếp)
      if (previewFile.mimeType === "application/pdf") {
        return (
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg">
            <iframe
              src={previewFile.url ?? ""}
              title={previewFile.name}
              className="w-full h-[600px] rounded-lg shadow-lg"
            />
          </div>
        )
      }
  
      // 📜 Preview text / code
      if (
        previewFile.mimeType.startsWith("text/") ||
        previewFile.mimeType === "application/json" ||
        previewFile.mimeType.includes("javascript") ||
        previewFile.mimeType.includes("css") ||
        previewFile.mimeType.includes("html")
      ) {
        return (
          <div className="bg-muted/20 rounded-lg p-4">
            <iframe
              src={previewFile.url ?? ""}
              title={previewFile.name}
              className="w-full h-96 bg-background border rounded-md p-4 font-mono text-sm"
            />
          </div>
        )
      }
    }
  
    // ❌ Không preview được
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
    setFilesToUpload((prev) => [...prev, ...files])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setFilesToUpload((prev) => [...prev, ...fileArray])
    }
  }

  const removeUploadFile = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index))
  }


  const handleUploadConfirm = async () => {
    if (filesToUpload.length === 0) return;
  
    try {
      setIsUploading(true);
      const uploaded = await uploadFiles("fileUploader", {
        files: filesToUpload,
        input: { folderId: currentFolderId ?? undefined },
        onUploadProgress: (p) => console.log("progress", p),
      });
  
      console.log("Uploaded result:", uploaded);
  
      setFilesToUpload([]);
      setUploadDialogOpen(false);
      mutate(`/api/files?folderId=${currentFolderId}`);
    } catch (err: any) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false); 
    }
  };
  

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
  
    console.log("Creating folder:", newFolderName);
  
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolderId || null, // 👈 nếu bạn đang trong 1 folder
        }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to create folder");
      }
  
      const folder = await res.json();
      console.log("✅ Folder created:", folder);
  
      mutate(`/api/files?folderId=${currentFolderId}`);
  
    } catch (err) {
      console.error("Error creating folder:", err);
    } finally {
      setNewFolderName("");
      setFolderDialogOpen(false);
    }
  };
  

  const handleSelectFile = (file: FileItem, checked: boolean) => {
    if (checked) {
      setSelectedFiles((prev) => [...prev, file])
    } else {
      setSelectedFiles((prev) => prev.filter((selectedFile) => selectedFile.id !== file.id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(getCurrentFolderFiles())
    } else {
      setSelectedFiles([])
    }
  }

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      for (const item of selectedFiles) {
        await fetch(`/api/delete/${item.id}?type=${item.type}`, {
          method: "DELETE",
        });
      }
  
      console.log("Deleted items:", selectedFiles);
  

      setSelectedFiles([]);
      setDeleteDialogOpen(false);
  
      mutate(`/api/files?folderId=${currentFolderId}`);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };
  

  const getSelectedFileNames = () => {
    return selectedFiles.map((file) => file.name)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getCurrentFolderFiles = () => {
    return mockFiles.filter((file) => {
      if (currentFolderId === null) {
        return !file.parentId || file.parentId === null
      }
      return file.parentId === currentFolderId
    })
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

  const handleShareSave = async () => {
    if (!shareFile) return
  
    let isShared;
    
    if (shareType === "public") {
      isShared = true;
    } else {
      isShared = false;
    }
  
    try {
      const res = await fetch(`/api/files/${shareFile.id}/share`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shareable: isShared }),
      })
  
      if (!res.ok) throw new Error("Failed to update sharing")
  
      const updatedFile = await res.json()
      console.log("Updated file:", updatedFile)
  

      mutate(`/api/files?folderId=${currentFolderId}`)
  
      setShareDialogOpen(false)
    } catch (err) {
      console.error(err)
    }
  }
  

  const handleRenameClick = (file: FileItem) => {
    setRenameFile(file)
    setNewFileName(file.name)
    setRenameDialogOpen(true)
  }

  const handleRenameConfirm = async () => {
    if (!renameFile || !newFileName.trim()) return;
  
    try {
      const res = await fetch(`/api/update/${renameFile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFileName.trim(),
          type: renameFile.type, 
        }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to update item");
      }
  
      const updated = await res.json();
      console.log("Item renamed:", updated);
  
      mutate(`/api/files?folderId=${currentFolderId}`)
    } catch (err) {
      console.error("Error renaming item:", err);
    } finally {
      setRenameDialogOpen(false);
      setRenameFile(null);
      setNewFileName("");
    }
  };
  

  const handleDownloadClick = async (file: FileItem) => {
    console.log("Downloading file:", file.name);
  
    const res = await fetch(`/api/download/${file.id}`);
    const blob = await res.blob();
  
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
  


  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Loading your files...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
      {currentFolderId && !restrictedFolders.includes(currentFolderId) && (
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

                {filesToUpload.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Selected Files ({filesToUpload.length})</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilesToUpload([])}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/20">
                      {filesToUpload.map((file, index) => (
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
                    setFilesToUpload([])
                  }}
                  disabled={isUploading} // không cho cancel khi đang upload
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadConfirm}
                  disabled={filesToUpload.length === 0 || isUploading}
                  className="min-w-24"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" /> 
                      Upload {filesToUpload.length > 0 && `(${filesToUpload.length})`}
                    </>
                  )}
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
        )}

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

      <Dialog
        open={previewDialogOpen}
        onOpenChange={(open) => {
          setPreviewDialogOpen(open)
          if (!open) {
            setPreviewLoading(false)
          }
        }}
      >
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
              <Button onClick={() => handleDownloadClick(previewFile)}>
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
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Rename {renameFile?.type === "folder" ? "Folder" : "File"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              {renameFile?.type === "folder" ? (
                <Folder className="h-5 w-5 text-blue-500" />
              ) : (
                <File className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-medium">{renameFile?.name}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-name">New name</Label>
              <Input
                id="new-name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!newFileName.trim()}>
              Rename
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
                    checked={
                      selectedFiles.length === getCurrentFolderFiles().length && getCurrentFolderFiles().length > 0
                    }
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
            {getSortedFiles().length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-96">
                  <div className="flex flex-col items-center justify-center h-full space-y-6">
                    <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center">
                      <Folder className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-muted-foreground">This folder is empty</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Get started by uploading files or creating a new folder
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              getSortedFiles().map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={selectedFiles.some((selectedFile) => selectedFile.id === item.id)}
                        onCheckedChange={(checked) => handleSelectFile(item, checked as boolean)}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleRenameClick(item)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        {item.type === "file" && (
                          <><DropdownMenuItem onClick={() => handleShareClick(item)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem><DropdownMenuItem onClick={() => handleDownloadClick(item)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem></>
                        )}
                        
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
