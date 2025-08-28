import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Tìm file trước để xem có shareable không
  const file = await db.file.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      mimeType: true,
      storagePath: true,
      userId: true,
      shareable: true,
    },
  });

  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Nếu file shareable -> bỏ qua check login
  if (!file.shareable) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (file.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Fetch file từ storage
  const response = await fetch(file.storagePath);
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }

  const blob = await response.blob();
  return new NextResponse(blob.stream(), {
    status: 200,
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
    },
  });
}
