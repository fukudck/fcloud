import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "file" | "folder"

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    let deletedItem;

    

    if (type === "file") {
      deletedItem = await db.file.delete({
        where: {
          id: params.id,
          userId: userId,
        },
      });
    } else if (type === "folder") {

      deletedItem = await db.$transaction(async (tx) => {
        // Xóa tất cả file thuộc folder
        await tx.file.deleteMany({
          where: {
            folderId: params.id,
            userId: userId,
          },
        });

        // Xóa folder
        return await tx.folder.delete({
          where: {
            id: params.id,
            userId: userId,
          },
        });
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(deletedItem);
  } catch (err) {
    console.error("Error deleting item:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
