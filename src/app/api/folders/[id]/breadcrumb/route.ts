import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let folderId = params.id;
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
      folderId = folder.parentId ?? '';
    }

    return NextResponse.json(breadcrumb);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load breadcrumb" }, { status: 500 });
  }
}
