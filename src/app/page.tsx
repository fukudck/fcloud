import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    // chưa đăng nhập
    redirect("/login")
  }

  // đã đăng nhập
  redirect("/dashboard/0")
}
