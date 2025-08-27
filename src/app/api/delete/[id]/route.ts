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
    let freedSpace = 0; // dung lượng giải phóng

    if (type === "file") {
      // lấy thông tin file trước khi xóa
      const file = await db.file.findFirst({
        where: { id: params.id, userId },
        select: { size: true },
      });
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      freedSpace = file.size;

      deletedItem = await db.file.delete({
        where: { id: params.id },
      });

    } else if (type === "folder") {
      deletedItem = await db.$transaction(async (tx) => {
        // Tính tổng dung lượng các file trong folder
        const files = await tx.file.findMany({
          where: { folderId: params.id, userId },
          select: { size: true },
        });

        freedSpace = files.reduce((acc, f) => acc + f.size, 0);

        // Xóa tất cả file trong folder
        await tx.file.deleteMany({
          where: { folderId: params.id, userId },
        });

        // Xóa folder
        return await tx.folder.delete({
          where: { id: params.id, userId },
        });
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Cập nhật lại usedSpace cho user
    if (freedSpace > 0) {
      await db.user.update({
        where: { id: userId },
        data: {
          usedSpace: {
            decrement: freedSpace,
          },
        },
      });
    }

    return NextResponse.json(deletedItem);
  } catch (err) {
    console.error("Error deleting item:", err);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
