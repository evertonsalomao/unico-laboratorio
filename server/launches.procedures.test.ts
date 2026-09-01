import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const listOsLaunches = vi.fn();
const createOsLaunch = vi.fn();
const updateOsLaunch = vi.fn();
const deleteOsLaunch = vi.fn();
vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, listOsLaunches, createOsLaunch, updateOsLaunch, deleteOsLaunch };
});

const { appRouter } = await import("./routers");
const user = { id: 12, openId: "test", name: "Roni", email: "roni@example.com", username: "Roni", loginMethod: "credentials", role: "user", passwordHash: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const ctx = { user, req: { protocol: "https", headers: {} }, res: {} } as unknown as TrpcContext;

describe("launch management procedures", () => {
  beforeEach(() => { listOsLaunches.mockReset(); createOsLaunch.mockReset(); updateOsLaunch.mockReset(); deleteOsLaunch.mockReset(); });

  it("passes a retroactive date with an automatic time to a new launch", async () => {
    createOsLaunch.mockResolvedValue({ id: 9, store: "Cianê", osNumber: "10718" });
    const caller = appRouter.createCaller(ctx);
    await caller.launches.create({ store: "Cianê", osNumber: "10718", launchDate: "2026-08-01" });
    expect(createOsLaunch).toHaveBeenCalledWith(expect.objectContaining({ store: "Cianê", osNumber: "10718", createdBy: 12, createdAt: expect.any(Date) }));
    expect(createOsLaunch.mock.calls[0][0].createdAt.toISOString().slice(0, 10)).toBe("2026-08-01");
  });

  it("passes the selected store to the report query", async () => {
    listOsLaunches.mockResolvedValue([]);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.launches.report({ startDate: "2026-08-01", endDate: "2026-08-18", store: "Cianê" })).resolves.toMatchObject({ total: 0, rows: [], totals: {} });
    expect(listOsLaunches).toHaveBeenCalledWith(expect.any(Date), expect.any(Date), "Cianê");
  });

  it("returns the filtered total for the selected store", async () => {
    listOsLaunches.mockResolvedValue([{ id: 1, store: "Cianê" }, { id: 2, store: "Cianê" }]);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.launches.report({ startDate: "2026-08-01", endDate: "2026-08-18", store: "Cianê" });
    expect(result.total).toBe(2);
    expect(result.totals).toEqual({ "Cianê": 2 });
  });

  it("updates a launch using the authenticated user as owner", async () => {
    updateOsLaunch.mockResolvedValue({ id: 5, store: "Coop", osNumber: "789", observation: "Ajuste" });
    const caller = appRouter.createCaller(ctx);
    await caller.launches.update({ id: 5, store: "Coop", osNumber: "789", observation: "Ajuste" });
    expect(updateOsLaunch).toHaveBeenCalledWith(5, 12, { store: "Coop", osNumber: "789", observation: "Ajuste" }, false);
  });

  it("allows an administrator to update any launch", async () => {
    updateOsLaunch.mockResolvedValue({ id: 8, store: "Boa", osNumber: "321", observation: null });
    const adminCtx = { ...ctx, user: { ...user, role: "admin" as const } };
    const caller = appRouter.createCaller(adminCtx);
    await caller.launches.update({ id: 8, store: "Boa", osNumber: "321" });
    expect(updateOsLaunch).toHaveBeenCalledWith(8, 12, { store: "Boa", osNumber: "321", observation: null }, true);
  });

  it("allows an administrator to delete any launch", async () => {
    deleteOsLaunch.mockResolvedValue({ success: true });
    const adminCtx = { ...ctx, user: { ...user, role: "admin" as const } };
    const caller = appRouter.createCaller(adminCtx);
    await expect(caller.launches.delete({ id: 8 })).resolves.toEqual({ success: true });
    expect(deleteOsLaunch).toHaveBeenCalledWith(8, 12, true);
  });

  it("deletes a launch using the authenticated user as owner", async () => {
    deleteOsLaunch.mockResolvedValue({ success: true });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.launches.delete({ id: 5 })).resolves.toEqual({ success: true });
    expect(deleteOsLaunch).toHaveBeenCalledWith(5, 12, false);
  });
});
