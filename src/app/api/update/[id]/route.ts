import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type } = await req.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    let updatedItem;

    if (type === "file") {
      updatedItem = await db.file.update({
        where: {
          id: params.id,
          userId: session.user.id,
        },
        data: { name },
      });
    } else if (type === "folder") {
      updatedItem = await db.folder.update({
        where: {
          id: params.id,
          userId: session.user.id,
        },
        data: { name },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error("❌ Error updating item:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
