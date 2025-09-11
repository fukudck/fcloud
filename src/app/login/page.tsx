import { LoginForm } from "@/components/login-form"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { cookies } from "next/headers";


export default async function Page(
  props: {
    searchParams: Promise<{ error?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const cookieStore = cookies()
  const session = await auth()
  
  if (session?.user) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user`, {
      headers: {
        Cookie: (await cookieStore).toString(),
      },
      cache: "no-store",
    })
    const user = await res.json()
    if(user?.role === "ADMIN") {
      redirect("/admin")
    } else {
    redirect("/")
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
      <LoginForm error={searchParams?.error} />
      </div>
    </div>
  )
}
