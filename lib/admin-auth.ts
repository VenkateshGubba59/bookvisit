import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "atelier_admin_session";
const password = () => process.env.ADMIN_PASSWORD ?? "";
const token = (value: string) => createHmac("sha256", value).update("atelier-visits-admin-session").digest("hex");

function matches(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdminPasswordConfigured() {
  return password().length > 0;
}

export function isCorrectAdminPassword(candidate: string) {
  return password().length > 0 && matches(candidate, password());
}

export async function isAdminAuthenticated() {
  if (!password()) return false;
  const cookieStore = await cookies();
  return matches(cookieStore.get(ADMIN_COOKIE)?.value ?? "", token(password()));
}

export async function createAdminSession() {
  if (!password()) throw new Error("Admin password is not configured");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token(password()), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });
}
