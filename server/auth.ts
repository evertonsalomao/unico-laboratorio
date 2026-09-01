import { createHash, createHmac, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";

const scrypt = promisify(nodeScrypt);
export const CREDENTIAL_SESSION_COOKIE = "oticas_unico_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type PasswordParts = { salt: string; hash: string };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, expectedHex] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function sign(payload: string) {
  return createHmac("sha256", ENV.cookieSecret).update(payload).digest("base64url");
}

export function createSessionToken(userId: number) {
  const payload = `${userId}.${Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [userIdText, expiresText, signature] = token.split(".");
  const payload = `${userIdText}.${expiresText}`;
  if (!userIdText || !expiresText || !signature || sign(payload) !== signature) return null;
  const userId = Number(userIdText);
  const expires = Number(expiresText);
  if (!Number.isInteger(userId) || !Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return null;
  return userId;
}

export function setCredentialSession(req: Request, res: Response, userId: number) {
  res.cookie(CREDENTIAL_SESSION_COOKIE, createSessionToken(userId), {
    ...getSessionCookieOptions(req),
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

export function clearCredentialSession(req: Request, res: Response) {
  res.clearCookie(CREDENTIAL_SESSION_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });
}

export function getCredentialUserId(req: Request) {
  const raw = req.headers.cookie ?? "";
  const cookie = raw.split(";").map(item => item.trim()).find(item => item.startsWith(`${CREDENTIAL_SESSION_COOKIE}=`));
  return verifySessionToken(cookie?.slice(CREDENTIAL_SESSION_COOKIE.length + 1));
}

export const passwordDigestForTests = (value: string) => createHash("sha256").update(value).digest("hex");
