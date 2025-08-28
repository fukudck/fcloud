import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { shareable } = body

    const updatedFile = await db.file.updateMany({
      where: { 
        id: params.id, 
        userId: session.user.id, // kiểm tra file có thuộc user không
      },
      data: { shareable },
    })

    if (updatedFile.count === 0) {
      return NextResponse.json({ error: "File not found or not owned by user" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 })
  }
}
