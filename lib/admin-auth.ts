"use server";

import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 12;

function getPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD belum dikonfigurasi");
  return password;
}

function sessionValue() {
  return createHmac("sha256", getPassword()).update("admin-session-v1").digest("hex");
}

function matches(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function isAdminAuthenticated() {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(session && matches(session, sessionValue()));
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!matches(password, getPassword())) redirect("/admin/login?error=1");

  (await cookies()).set(SESSION_COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
