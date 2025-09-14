import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, parentId } = await req.json();

    const newFolder = await db.folder.create({
      data: {
        name,
        parentId: !parentId || parentId === "0" ? null : parentId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newFolder);
  } catch (err) {
    console.error("Error creating folder:", err);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    const folders = await db.folder.findMany({
      where: {
        userId: session.user.id,
        parentId: parentId && parentId !== "0" ? parentId : null,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(folders);
  } catch (err) {
    console.error("Error fetching folders:", err);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}