"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Download, Eye, FileText, ImageIcon, Video, Music, Archive, File, Loader2, FileX } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

interface FileItem {
  id: string
  name: string
  type: string
  size: string
  modifiedDate: string
  shared: boolean
  isFolder: boolean
  url?: string
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return <ImageIcon className="h-6 w-6" />
    case "pdf":
      return <FileText className="h-6 w-6" />
    case "mp4":
    case "avi":
    case "mov":
      return <Video className="h-6 w-6" />
    case "mp3":
    case "wav":
    case "flac":
      return <Music className="h-6 w-6" />
    case "zip":
    case "rar":
    case "7z":
      return <Archive className="h-6 w-6" />
    default:
      return <File className="h-6 w-6" />
  }
}

const getFileTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "pdf":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "mp4":
    case "avi":
    case "mov":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "mp3":
    case "wav":
    case "flac":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

const canPreview = (type: string) => {
  const previewableTypes = ["jpg", "jpeg", "png", "gif", "webp", "pdf", "txt", "md"]
  return previewableTypes.includes(type.toLowerCase())
}

export default function SharePage() {
  const params = useParams()
  const fileId = params.fileId as string
  const [file, setFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await fetch(`/api/share/${fileId}`)
        if (!res.ok) throw new Error("File not found")
        const data = await res.json()
        setFile(data)
      } catch (err) {
        setFile(null)
      } finally {
        setLoading(false)
      }
    }
    fetchFile()
  }, [fileId])

  const handlePreview = () => {
    if (!file || !canPreview(file.type)) return
    setPreviewLoading(true)
    setPreviewOpen(true)
    setTimeout(() => setPreviewLoading(false), 1500)
  }

  const handleDownload = () => {
    if (!file) return
    window.location.href = `/api/items/download/${file.id}`
  }
  const renderPreviewContent = () => {
    if (!file) return null

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

    const fileType = file.type.toLowerCase()

    if (canPreview(file.type)) {
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)) {
        return (
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg">
            <img
              src={file.url || `/placeholder.svg?height=400&width=600&query=${file.name}`}
              alt={file.name}
              className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
            />
          </div>
        )
      }

      if (fileType === "pdf") {
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

      if (["txt", "md"].includes(fileType)) {
        return (
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="bg-background border rounded-md p-4 font-mono text-sm max-h-96 overflow-auto">
              <div className="text-muted-foreground">
                {fileType === "txt" && "Text file content would appear here..."}
                {fileType === "md" && "# Markdown content would appear here\n\nThis is a sample markdown file."}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading file...</p>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">📁</div>
          <h1 className="text-2xl font-semibold">File not found</h1>
          <p className="text-muted-foreground">The file you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground">Someone shared this file with you</p>
        </div>

        {/* File Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* File Icon */}
              <div className="p-6 rounded-full bg-muted">
                <div className="text-primary">{getFileIcon(file.type)}</div>
              </div>

              {/* File Info */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-balance">{file.name}</h2>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="secondary" className={getFileTypeColor(file.type)}>
                    {file.type.toUpperCase()}
                  </Badge>
                  <span>{file.size}</span>
                  <span>Modified {file.modifiedDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {canPreview(file.type) && (
                  <Button onClick={handlePreview} variant="outline" size="lg">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                )}
                <Button onClick={handleDownload} size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This file was shared securely. Only people with this link can access it.</p>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {file.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {file && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {file.type.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{file.size}</span>
                </div>
                {renderPreviewContent()}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
