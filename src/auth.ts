import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("Credentials nhận được:", credentials)
        const parsed = await signInSchema.safeParseAsync(credentials)
        if (!parsed.success) {
          return null
        }
        const { email, password } = parsed.data

        const user = await db.user.findUnique({ where: { email } })
        if (!user) return null

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return null


        return {
          id: user.id,
          email: user.email,
          quota: user.totalQuota,
          used: user.usedSpace,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
})
