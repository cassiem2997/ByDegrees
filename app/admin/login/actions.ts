"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { assertServerEnv } from "@/lib/config";

export async function loginAdmin(formData: FormData) {
  const { ADMIN_PASSCODE } = assertServerEnv();
  const passcode = String(formData.get("passcode") ?? "");

  if (passcode !== ADMIN_PASSCODE) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("temptracks_admin", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect("/admin");
}
