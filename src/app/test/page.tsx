// app/logout/page.tsx
import { signOut } from "@/auth"

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}
      >
        <button
          type="submit"
          className="rounded-xl bg-red-500 px-6 py-3 text-white font-semibold hover:bg-red-600"
        >
          Logout
        </button>
      </form>
    </div>
  )
}
