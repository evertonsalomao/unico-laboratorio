import { z } from "zod";
import { STORES } from "../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { createBreak, createOsLaunch, deleteBreak, deleteOsLaunch, getUserByUsername, listBreaks, listOsLaunches, updateBreak, updateOsLaunch, updateUserPassword } from "./db";
import { clearCredentialSession, hashPassword, setCredentialSession, verifyPassword } from "./auth";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const storeSchema = z.enum(STORES);
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");
const usernameSchema = z.string().trim().min(3).max(80);
const passwordSchema = z.string().min(6).max(128);

export function localDateBoundary(value: string, endOfDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
}

export function selectedDateTime(value: string) {
  const now = new Date();
  const date = localDateBoundary(value);
  date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return date;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user ? { id: opts.ctx.user.id, name: opts.ctx.user.name, email: opts.ctx.user.email, username: opts.ctx.user.username, role: opts.ctx.user.role } : null),
    login: publicProcedure.input(z.object({ username: usernameSchema, password: passwordSchema })).mutation(async ({ ctx, input }) => {
      const user = await getUserByUsername(input.username);
      if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) throw new Error("Usuário ou senha inválidos");
      setCredentialSession(ctx.req, ctx.res, user.id);
      return { success: true, user: { id: user.id, name: user.name, username: user.username, role: user.role } };
    }),
    changePassword: protectedProcedure.input(z.object({ currentPassword: passwordSchema, newPassword: passwordSchema })).mutation(async ({ ctx, input }) => {
      if (!ctx.user.passwordHash || !(await verifyPassword(input.currentPassword, ctx.user.passwordHash))) throw new Error("A senha atual está incorreta");
      if (input.currentPassword === input.newPassword) throw new Error("A nova senha deve ser diferente da atual");
      await updateUserPassword(ctx.user.id, await hashPassword(input.newPassword));
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearCredentialSession(ctx.req, ctx.res);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  launches: router({
    stores: publicProcedure.query(() => STORES),
    create: protectedProcedure.input(z.object({ store: storeSchema, osNumber: z.string().trim().min(1).max(40), observation: z.string().trim().max(500).optional(), launchDate: dateOnly.optional() })).mutation(async ({ ctx, input }) => createOsLaunch({ store: input.store, osNumber: input.osNumber, observation: input.observation || null, createdBy: ctx.user.id, createdAt: selectedDateTime(input.launchDate ?? new Date().toISOString().slice(0, 10)) })),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), store: storeSchema, osNumber: z.string().trim().min(1).max(40), observation: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => { const updated = await updateOsLaunch(input.id, ctx.user.id, { store: input.store, osNumber: input.osNumber, observation: input.observation || null }, ctx.user.role === "admin"); if (!updated) throw new Error("Lançamento não encontrado ou sem permissão"); return updated; }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const result = await deleteOsLaunch(input.id, ctx.user.id, ctx.user.role === "admin"); if (!result.success) throw new Error("Lançamento não encontrado ou sem permissão"); return result; }),
    today: protectedProcedure.input(z.object({ date: dateOnly }).optional()).query(async ({ input }) => { const value = input?.date ?? new Date().toISOString().slice(0, 10); return listOsLaunches(localDateBoundary(value), localDateBoundary(value, true)); }),
    report: protectedProcedure.input(z.object({ startDate: dateOnly, endDate: dateOnly, store: storeSchema.optional() })).query(async ({ input }) => {
      const start = localDateBoundary(input.startDate); const end = localDateBoundary(input.endDate, true);
      if (start > end) throw new Error("A data inicial deve ser anterior à data final");
      const rows = await listOsLaunches(start, end, input.store);
      const totals = rows.reduce<Record<string, number>>((acc, row) => { acc[row.store] = (acc[row.store] ?? 0) + 1; return acc; }, {});
      return { rows, totals, total: rows.length };
    }),
  }),
  breaks: router({
    create: protectedProcedure.input(z.object({ unit: storeSchema, osNumber: z.string().trim().min(1).max(40), report: z.string().trim().min(1, "Relate o ocorrido").max(1000), launchDate: dateOnly.optional() })).mutation(async ({ ctx, input }) => createBreak({ unit: input.unit, osNumber: input.osNumber, report: input.report, createdBy: ctx.user.id, createdAt: selectedDateTime(input.launchDate ?? new Date().toISOString().slice(0, 10)) })),
    today: protectedProcedure.input(z.object({ date: dateOnly }).optional()).query(async ({ input }) => { const value = input?.date ?? new Date().toISOString().slice(0, 10); return listBreaks(localDateBoundary(value), localDateBoundary(value, true)); }),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), unit: storeSchema, osNumber: z.string().trim().min(1).max(40), report: z.string().trim().min(1, "Relate o ocorrido").max(1000) })).mutation(async ({ ctx, input }) => { const updated = await updateBreak(input.id, ctx.user.id, { unit: input.unit, osNumber: input.osNumber, report: input.report }, ctx.user.role === "admin"); if (!updated) throw new Error("Quebra não encontrada ou sem permissão"); return updated; }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const result = await deleteBreak(input.id, ctx.user.id, ctx.user.role === "admin"); if (!result.success) throw new Error("Quebra não encontrada ou sem permissão"); return result; }),
    report: protectedProcedure.input(z.object({ startDate: dateOnly, endDate: dateOnly, unit: storeSchema.optional() })).query(async ({ input }) => { const start = localDateBoundary(input.startDate); const end = localDateBoundary(input.endDate, true); if (start > end) throw new Error("A data inicial deve ser anterior à data final"); const rows = await listBreaks(start, end, input.unit); const totals = rows.reduce<Record<string, number>>((acc, row) => { acc[row.unit] = (acc[row.unit] ?? 0) + 1; return acc; }, {}); return { rows, totals, total: rows.length }; }),
  }),
});

export type AppRouter = typeof appRouter;
