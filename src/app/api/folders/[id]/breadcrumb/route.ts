import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

const SPECIAL_FOLDERS: Record<string, string> = {
  shared: "Shared",
  images: "Images",
  documents: "Documents",
  videos: "Videos",
};

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let folderId = params.id;

    // Nếu là folder đặc biệt => chỉ trả về breadcrumb ảo
    if (folderId && SPECIAL_FOLDERS[folderId]) {
      return NextResponse.json([
        { id: folderId, name: SPECIAL_FOLDERS[folderId] },
      ]);
    }

    // Nếu là "0" => breadcrumb root
    if (folderId === "0") {
      return NextResponse.json([{ id: "0", name: "Home" }]);
    }

    // Folder thường trong DB
    const breadcrumb: { id: string; name: string }[] = [];

    while (folderId) {
      const folder = await db.folder.findUnique({
        where: {
          id: folderId,
          userId: session.user.id,
        },
        select: { id: true, name: true, parentId: true },
      });

      if (!folder) break;

      breadcrumb.unshift({ id: folder.id, name: folder.name });
      folderId = folder.parentId ?? "";
    }

    breadcrumb.unshift({ id: "0", name: "Home" });

    return NextResponse.json(breadcrumb);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load breadcrumb" },
      { status: 500 }
    );
  }
}
