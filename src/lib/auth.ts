import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "swr_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function makeToken(): string {
  const id = randomBytes(16).toString("hex");
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${id}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, expires, sig] = parts;
  const payload = `${id}.${expires}`;
  try {
    const expected = Buffer.from(sign(payload), "hex");
    const actual = Buffer.from(sig, "hex");
    if (expected.length !== actual.length) return false;
    if (!timingSafeEqual(expected, actual)) return false;
    return Date.now() < Number(expires);
  } catch {
    return false;
  }
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && password === adminPassword;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export function getSessionTokenFromHeader(cookieHeader: string): boolean {
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;
  return verifyToken(decodeURIComponent(match[1]));
}
