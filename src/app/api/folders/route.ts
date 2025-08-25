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
