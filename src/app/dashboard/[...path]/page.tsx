import { AppSidebar } from "@/components/app-sidebar"
import BreadcrumbNav from "@/components/breadcrumb-nav"
import FileManager from "@/components/file-manager"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"



interface PageProps {
  params: Promise<{ path?: string[] }>
}

export default async function Page({ params }: PageProps) {
  const { path } = await params
  const folderId = path?.[0] ?? "0"
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <BreadcrumbNav folderId={folderId} />
        </header>
        <FileManager currentFolderId={folderId} />
        
      </SidebarInset>
    </SidebarProvider>
  )
}
