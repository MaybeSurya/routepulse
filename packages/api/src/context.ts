import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { verifyAccessToken, type JwtPayload } from "./lib/jwt";

export interface Context {
  user: JwtPayload | null;
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<Context> {
  const authHeader = req.headers.authorization;
  let user: JwtPayload | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      user = verifyAccessToken(token);
    } catch {
      // Let procedures decide—public ones pass, protected ones will throw
    }
  }

  return { user, req, res };
}
