"use client"
 
 import * as React from "react"
  import Link from "next/link"
  import { Clock, Share2, Tag, Users } from "lucide-react"

  import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
  } from "@/components/ui/sidebar"
  import { NavUser } from "@/components/nav-user"
import { useUser } from "@/contexts/user-context"

  // Sample data with href
  const data = {
    quickAccess: [
      {
        name: "Home",
        icon: Clock,
        href: "/dashboard/0",
      },
      {
        name: "Shared Files",
        icon: Share2,
        href: "/dashboard/shared",
      },
    ],
    fileTypes: [
      {
        name: "Images",
        icon: Tag,
        color: "bg-blue-500",
        href: "/dashboard/images",
      },
      {
        name: "Documents",
        icon: Tag,
        color: "bg-green-500",
        href: "/dashboard/documents",
      },
      {
        name: "Videos",
        icon: Tag,
        color: "bg-purple-500",
        href: "/dashboard/videos",
      },
    ],
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
  }

  export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, isLoading} = useUser()
    return (
      <Sidebar {...props}>
        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.quickAccess.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* File Types */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>File Types</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.fileTypes.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`} />
                        {item.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User Management */}
        {user?.role === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      User Management
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarRail />
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    )
  }
