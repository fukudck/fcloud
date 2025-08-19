"use server"

import { db } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { redirect } from "next/navigation"

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  // check email đã tồn tại chưa
  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("Email already registered")
  }

  // hash password
  const hashed = await hashPassword(password)

  // tạo user
  await db.user.create({
    data: {
      email,
      password: hashed,
    },
  })

  // Sau khi đăng ký có thể redirect
  redirect("/login") // hoặc tự động signIn nếu muốn
}
