import { describe, expect, it } from "vitest";
import { createSessionToken, hashPassword, verifyPassword, verifySessionToken } from "./auth";

describe("credential authentication", () => {
  it("hashes passwords without storing the original value and verifies them", async () => {
    const hash = await hashPassword("123456");
    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain("123456");
    await expect(verifyPassword("123456", hash)).resolves.toBe(true);
    await expect(verifyPassword("654321", hash)).resolves.toBe(false);
  });

  it("creates and validates an expiring signed session token", () => {
    const token = createSessionToken(42);
    expect(verifySessionToken(token)).toBe(42);
    expect(verifySessionToken(`${token}x`)).toBeNull();
  });
});
