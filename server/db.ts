import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { Break, breaks, InsertUser, osLaunches, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return rows[0];
  } catch (error) {
    console.error("[Database Error] Failed to fetch user by username:", error);
    throw error;
  }
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0];
}

export async function createOsLaunch(input: { store: string; osNumber: string; observation?: string | null; createdBy: number; createdAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(osLaunches).values(input);
  const rows = await db.select().from(osLaunches).where(and(eq(osLaunches.store, input.store), eq(osLaunches.osNumber, input.osNumber))).orderBy(sql`${osLaunches.id} DESC`).limit(1);
  return rows[0];
}

export async function updateOsLaunch(id: number, createdBy: number, input: { store: string; osNumber: string; observation?: string | null }, isAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const ownerFilter = isAdmin ? eq(osLaunches.id, id) : and(eq(osLaunches.id, id), eq(osLaunches.createdBy, createdBy));
  await db.update(osLaunches).set(input).where(ownerFilter);
  const rows = await db.select().from(osLaunches).where(ownerFilter).limit(1);
  return rows[0];
}

export async function deleteOsLaunch(id: number, createdBy: number, isAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const ownerFilter = isAdmin ? eq(osLaunches.id, id) : and(eq(osLaunches.id, id), eq(osLaunches.createdBy, createdBy));
  const owned = await db.select({ id: osLaunches.id }).from(osLaunches).where(ownerFilter).limit(1);
  if (!owned[0]) return { success: false } as const;
  await db.delete(osLaunches).where(ownerFilter);
  return { success: true } as const;
}

export async function listOsLaunches(start: Date, end: Date, store?: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(osLaunches).where(and(gte(osLaunches.createdAt, start), lte(osLaunches.createdAt, end), store ? eq(osLaunches.store, store) : undefined)).orderBy(asc(osLaunches.createdAt));
}

export async function createBreak(input: { unit: string; osNumber: string; report: string; createdBy: number; createdAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(breaks).values(input);
  const rows = await db.select().from(breaks).where(and(eq(breaks.unit, input.unit), eq(breaks.osNumber, input.osNumber))).orderBy(sql`${breaks.id} DESC`).limit(1);
  return rows[0];
}

export async function listBreaks(start: Date, end: Date, unit?: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(breaks).where(and(gte(breaks.createdAt, start), lte(breaks.createdAt, end), unit ? eq(breaks.unit, unit) : undefined)).orderBy(asc(breaks.createdAt));
}

export async function updateBreak(id: number, createdBy: number, input: { unit: string; osNumber: string; report: string }, isAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const ownerFilter = isAdmin ? eq(breaks.id, id) : and(eq(breaks.id, id), eq(breaks.createdBy, createdBy));
  await db.update(breaks).set(input).where(ownerFilter);
  const rows = await db.select().from(breaks).where(ownerFilter).limit(1);
  return rows[0];
}

export async function deleteBreak(id: number, createdBy: number, isAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const ownerFilter = isAdmin ? eq(breaks.id, id) : and(eq(breaks.id, id), eq(breaks.createdBy, createdBy));
  const owned = await db.select({ id: breaks.id }).from(breaks).where(ownerFilter).limit(1);
  if (!owned[0]) return { success: false } as const;
  await db.delete(breaks).where(ownerFilter);
  return { success: true } as const;
}
