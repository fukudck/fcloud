import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { db } from "@/lib/db"

function toGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2)
}
export async function GET() {
  const session = await auth();
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      totalQuota: true,
      usedSpace: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...user,
    totalQuota: toGB(user.totalQuota),
    usedSpace: toGB(user.usedSpace),
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, email, currentPassword, newPassword } = await req.json()
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

//   if (newPassword) {
//     if (!currentPassword) {
//       return NextResponse.json({ error: "Current password required" }, { status: 400 })
//     }
//     const isValid = await bcrypt.compare(currentPassword, user.password)
//     if (!isValid) {
//       return NextResponse.json({ error: "Invalid current password" }, { status: 400 })
//     }
//   }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name: name || user.name,
      email: email || user.email,
      ...(newPassword ? { password: await bcrypt.hash(newPassword, 10) } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      usedSpace: true,
      totalQuota: true,
    },
  })

  return NextResponse.json({
    ...updated,
    totalQuota: toGB(updated.totalQuota),
    usedSpace: toGB(updated.usedSpace),
  })
}
