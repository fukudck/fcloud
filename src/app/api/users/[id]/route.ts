import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
  const session = await auth();

    if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

    // Check role
  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User deleted successfully",
      user: { id: deleted.id, email: deleted.email },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user", details: error },
      { status: 500 }
    );
  }
}
