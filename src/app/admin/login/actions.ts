"use server";

import { redirect } from "next/navigation";
import { createSession, verifyCredentials } from "@/lib/auth";

export async function loginAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const valid = await verifyCredentials(email, password);
  if (!valid) {
    return "帳號或密碼錯誤，請重新輸入。";
  }

  await createSession();
  redirect("/admin");
}
