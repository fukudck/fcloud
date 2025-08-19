import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function LoginForm({
  className,
  error, // nhận error từ page
  ...props
}: React.ComponentProps<"div"> & { error?: string }) {

  async function handleLogin(formData: FormData) {
    "use server"
    try {
      // Có thể truyền trực tiếp FormData:
      await signIn("credentials", formData)
      // hoặc tách ra:
      // await signIn("credentials", {
      //   email: formData.get("email") as string,
      //   password: formData.get("password") as string,
      //   redirectTo: "/",
      // })
    } catch (e) {
      if (e instanceof AuthError) {
        switch (e.type) {
          case "CredentialsSignin":
            return redirect("/login?error=InvalidCredentials")
          default:
            return redirect("/login?error=ServerError")
        }
      }
      throw e
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error === "InvalidCredentials" && (
              <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Incorrect login information.</AlertTitle>
              <AlertDescription>
                <p>Please verify your information and try again.</p>
              </AlertDescription>
            </Alert>
          )}
          {error === "ServerError" && (
            <p className="mb-4 text-sm text-red-600">Có lỗi xảy ra. Vui lòng thử lại.</p>
          )}

          <form action={handleLogin} className="flex flex-col gap-6 py-3">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                  Forgot your password?
                </a>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full">Login</Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
