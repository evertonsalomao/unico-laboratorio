import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 80 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const osLaunches = mysqlTable("os_launches", {
  id: int("id").autoincrement().primaryKey(),
  store: varchar("store", { length: 80 }).notNull(),
  osNumber: varchar("osNumber", { length: 40 }).notNull(),
  observation: varchar("observation", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const breaks = mysqlTable("breaks", {
  id: int("id").autoincrement().primaryKey(),
  unit: varchar("unit", { length: 80 }).notNull(),
  osNumber: varchar("osNumber", { length: 40 }).notNull(),
  report: varchar("report", { length: 1000 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type OsLaunch = typeof osLaunches.$inferSelect;
export type InsertOsLaunch = typeof osLaunches.$inferInsert;
export type Break = typeof breaks.$inferSelect;
export type InsertBreak = typeof breaks.$inferInsert;

export const STORES = [
  "Cianê", "Votorantim", "Coop", "Campolim", "Wanel Ville", "Itavuvu",
  "Braguinha", "Araçoiaba da Serra", "Esplanada", "Boa", "Precisão",
] as const;
