import { describe, expect, it } from "vitest";
import { appRouter, localDateBoundary } from "./routers";
import type { TrpcContext } from "./_core/context";

const baseContext = (user: TrpcContext["user"]) => ({
  user,
  req: { protocol: "https", headers: {} },
  res: {} as TrpcContext["res"],
} as TrpcContext);

const authenticatedUser = { id: 7, openId: "test-user", name: "Roni", email: "roni@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

describe("launches", () => {
  it("returns the fixed stores with the exact requested names", async () => {
    const caller = appRouter.createCaller(baseContext(null));
    await expect(caller.launches.stores()).resolves.toEqual(["Cianê", "Votorantim", "Coop", "Campolim", "Wanel Ville", "Itavuvu", "Braguinha", "Araçoiaba da Serra", "Esplanada", "Boa", "Precisão"]);
  });

  it("blocks reports without a protected session", async () => {
    const caller = appRouter.createCaller(baseContext(null));
    await expect(caller.launches.report({ startDate: "2026-08-01", endDate: "2026-08-18" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("validates an OS number before attempting persistence", async () => {
    const caller = appRouter.createCaller(baseContext(authenticatedUser));
    await expect(caller.launches.create({ store: "Cianê", osNumber: "   " })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts an optional observation only within the supported limit", async () => {
    const caller = appRouter.createCaller(baseContext(authenticatedUser));
    await expect(caller.launches.create({ store: "Cianê", osNumber: "10718", observation: "a".repeat(501) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("creates correct local date boundaries for report filters", () => {
    expect(localDateBoundary("2026-08-18").getHours()).toBe(0);
    expect(localDateBoundary("2026-08-18", true).getHours()).toBe(23);
    expect(localDateBoundary("2026-08-18", true).getMilliseconds()).toBe(999);
  });
});
