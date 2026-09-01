import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const createBreak = vi.fn();
const listBreaks = vi.fn();
const updateBreak = vi.fn();
const deleteBreak = vi.fn();
vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, createBreak, listBreaks, updateBreak, deleteBreak };
});

const { appRouter } = await import("./routers");
const user = { id: 12, openId: "test", name: "Roni", email: "roni@example.com", username: "Roni", loginMethod: "credentials", role: "user", passwordHash: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const ctx = { user, req: { protocol: "https", headers: {} }, res: {} } as unknown as TrpcContext;

describe("break procedures", () => {
  beforeEach(() => { createBreak.mockReset(); listBreaks.mockReset(); updateBreak.mockReset(); deleteBreak.mockReset(); });

  it("validates and creates a break with the authenticated user", async () => {
    createBreak.mockResolvedValue({ id: 1, unit: "Cianê", osNumber: "10718", report: "Lente danificada" });
    const caller = appRouter.createCaller(ctx);
    await caller.breaks.create({ unit: "Cianê", osNumber: "10718", report: "Lente danificada", launchDate: "2026-08-01" });
    expect(createBreak).toHaveBeenCalledWith(expect.objectContaining({ unit: "Cianê", osNumber: "10718", report: "Lente danificada", createdBy: 12, createdAt: expect.any(Date) }));
    expect(createBreak.mock.calls[0][0].createdAt.toISOString().slice(0, 10)).toBe("2026-08-01");
  });

  it("passes the selected unit to the break report", async () => {
    listBreaks.mockResolvedValue([]);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.breaks.report({ startDate: "2026-08-01", endDate: "2026-08-18", unit: "Coop" })).resolves.toMatchObject({ total: 0, rows: [], totals: {} });
    expect(listBreaks).toHaveBeenCalledWith(expect.any(Date), expect.any(Date), "Coop");
  });

  it("rejects unauthenticated break creation", async () => {
    const caller = appRouter.createCaller({ ...ctx, user: null });
    await expect(caller.breaks.create({ unit: "Cianê", osNumber: "10718", report: "Ocorrido" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an empty occurrence report", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.breaks.create({ unit: "Cianê", osNumber: "10718", report: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("allows an administrator to update and delete any break", async () => {
    updateBreak.mockResolvedValue({ id: 2, unit: "Boa", osNumber: "22", report: "Atualizado" });
    deleteBreak.mockResolvedValue({ success: true });
    const adminCtx = { ...ctx, user: { ...user, role: "admin" as const } };
    const caller = appRouter.createCaller(adminCtx);
    await caller.breaks.update({ id: 2, unit: "Boa", osNumber: "22", report: "Atualizado" });
    await caller.breaks.delete({ id: 2 });
    expect(updateBreak).toHaveBeenCalledWith(2, 12, { unit: "Boa", osNumber: "22", report: "Atualizado" }, true);
    expect(deleteBreak).toHaveBeenCalledWith(2, 12, true);
  });
});
