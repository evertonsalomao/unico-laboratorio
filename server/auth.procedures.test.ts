import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "./auth";
import type { TrpcContext } from "./_core/context";

const getUserByUsername = vi.fn();
const updateUserPassword = vi.fn();
vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, getUserByUsername, updateUserPassword };
});

const { appRouter } = await import("./routers");

const response = () => ({ cookies: [] as Array<{ name: string; value: string }>, cookie(name: string, value: string) { this.cookies.push({ name, value }); }, clearCookie() {} } as unknown as TrpcContext["res"]);
const request = { protocol: "https", headers: {} } as TrpcContext["req"];

describe("auth procedures", () => {
  beforeEach(() => { getUserByUsername.mockReset(); updateUserPassword.mockReset(); });

  it("accepts valid credentials and creates a protected session cookie", async () => {
    const passwordHash = await hashPassword("123456");
    getUserByUsername.mockResolvedValue({ id: 1, username: "Roni", name: "Roni", role: "user", passwordHash });
    const res = response();
    const caller = appRouter.createCaller({ req: request, res, user: null });
    await expect(caller.auth.login({ username: "Roni", password: "123456" })).resolves.toMatchObject({ success: true });
    expect(res.cookies[0]?.name).toBe("oticas_unico_session");
  });

  it("rejects invalid credentials", async () => {
    getUserByUsername.mockResolvedValue(undefined);
    const caller = appRouter.createCaller({ req: request, res: response(), user: null });
    await expect(caller.auth.login({ username: "Roni", password: "errada" })).rejects.toThrow("Usuário ou senha inválidos");
  });

  it("changes password only with the current password", async () => {
    const passwordHash = await hashPassword("123456");
    const user = { id: 1, username: "Roni", name: "Roni", role: "user", passwordHash } as NonNullable<TrpcContext["user"]>;
    const caller = appRouter.createCaller({ req: request, res: response(), user });
    await expect(caller.auth.changePassword({ currentPassword: "errada", newPassword: "nova789" })).rejects.toThrow("A senha atual está incorreta");
    await expect(caller.auth.changePassword({ currentPassword: "123456", newPassword: "nova789" })).resolves.toEqual({ success: true });
    expect(updateUserPassword).toHaveBeenCalledWith(1, expect.stringMatching(/^scrypt\$/));
  });
});
