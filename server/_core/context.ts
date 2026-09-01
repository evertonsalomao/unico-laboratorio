import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserById } from "../db";
import { getCredentialUserId } from "../auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const credentialUserId = getCredentialUserId(opts.req);
  const user: User | null = credentialUserId ? ((await getUserById(credentialUserId)) ?? null) : null;
  return { req: opts.req, res: opts.res, user };
}
