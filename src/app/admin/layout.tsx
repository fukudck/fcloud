import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = cookies();

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user`, {
    headers: {
      Cookie: (await cookieStore).toString(),
    },
    cache: "no-store",
  });
  const user = await res.json();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
