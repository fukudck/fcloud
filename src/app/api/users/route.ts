import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

function toGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2)
}

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check role
  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

    // Lấy query param
  const { searchParams } = new URL(req.url)
  // console.log("SR: ", searchParams)
  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 10)
  const roleParam = searchParams.get("role") || ""
  const search = (searchParams.get("search") || "").trim();
  const sort = (searchParams.get("sort") || "newest").toLowerCase();
  const skip = (page - 1) * limit

   const where: any = {};
  if (roleParam && roleParam.toLowerCase() !== "all") {
    where.role = roleParam;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  if (sort === "usedspace" || sort === "used" || sort === "storage" || sort === "storageusage") {
    orderBy = { usedSpace: "desc" };
  }

const [totalUser, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        totalQuota: true, 
        usedSpace: true,  
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            folders: true,
            files: true,
          },
        },
      },
    }),
  ]);


  // console.log(users)

  return NextResponse.json({
    totalUser,
    page,
    limit,
    users,
  })
}
