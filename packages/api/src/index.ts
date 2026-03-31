import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";

import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      message: (error.cause instanceof z.ZodError && error.cause.issues?.[0])
        ? error.cause.issues[0].message 
        : shape.message,
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

const enforceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !["transport_admin", "super_admin"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = t.procedure.use(enforceAdmin);

const enforceSuperAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const superAdminProcedure = t.procedure.use(enforceSuperAdmin);

const enforceStudent = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "student") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Student access required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const studentProcedure = t.procedure.use(enforceStudent);

const enforceDriver = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "driver") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Driver access required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const driverProcedure = t.procedure.use(enforceDriver);

const enforceDriverOrAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !["driver", "transport_admin", "super_admin"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Driver or Admin access required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const driverOnlyProcedure = t.procedure.use(enforceDriverOrAdmin);

export const requireRole = (...roles: string[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Required roles: ${roles.join(", ")}`,
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });

export const createRoleProcedure = (...roles: string[]) => t.procedure.use(requireRole(...roles));
