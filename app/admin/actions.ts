"use server";

import { redirect } from "next/navigation";
import { createAdminSession, isCorrectAdminPassword } from "@/lib/admin-auth";

export type AdminLoginState = { error: string };

export async function loginAdmin(_state: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const candidate = formData.get("password");
  if (typeof candidate !== "string" || !isCorrectAdminPassword(candidate)) {
    return { error: "That password is not correct." };
  }
  await createAdminSession();
  redirect("/admin");
}
