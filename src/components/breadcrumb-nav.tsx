// components/breadcrumb-nav.tsx
"use client"

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface BreadcrumbItemType {
  id: string
  name: string
}

export default function BreadcrumbNav({ folderId }: { folderId: string }) {
  const { data, error } = useSWR<BreadcrumbItemType[]>(
    folderId ? `/api/folders/${folderId}/breadcrumb` : null,
    fetcher
  )

  if (error) return null
  if (!data) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {data.map((item, index) => {
          const isLast = index === data.length - 1
          return (
            <div key={item.id} className="flex items-center">
              <BreadcrumbItem className={isLast ? "" : "hidden md:block"}>
                {isLast ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={`/dashboard/${item.id}`}>{item.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
