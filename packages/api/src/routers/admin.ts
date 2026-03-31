import { z } from "zod";
import { adminProcedure, router } from "../index";
import { AdminService } from "../services/admin.service";

export const adminRouter = router({
  getSystemAnalytics: adminProcedure.query(async () => {
    const data = await AdminService.getSystemAnalytics();
    return { success: true, data };
  }),

  listBuses: adminProcedure
    .input(z.object({ status: z.string().optional(), routeId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const data = await AdminService.listBuses(input?.status, input?.routeId);
      return { success: true, data };
    }),

  getRoutes: adminProcedure
    .input(z.object({ includeBuses: z.boolean().optional() }).optional())
    .query(async () => {
      const data = await AdminService.listRoutes();
      return { success: true, data };
    }),

  createRoute: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullish().transform(v => v ?? undefined),
        color: z.string().nullish().transform(v => v ?? undefined),
        busIds: z.array(z.string()).optional(),
        stops: z
          .array(
            z.object({
              name: z.string(),
              landmark: z.string().nullish().transform(v => v ?? undefined),
              lat: z.number(),
              lng: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await AdminService.createRoute(input);
      return { success: true, data };
    }),

  updateRoute: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullish().transform(v => v ?? undefined),
        description: z.string().nullish().transform(v => v ?? undefined),
        color: z.string().nullish().transform(v => v ?? undefined),
        isActive: z.boolean().optional(),
        busIds: z.array(z.string()).optional(),
        stops: z
          .array(
            z.object({
              name: z.string(),
              landmark: z.string().nullish(),
              lat: z.number(),
              lng: z.number(),
              radiusMeters: z.number().nullish(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = await AdminService.updateRoute(id, rest);
      return { success: true, data };
    }),

  deleteRoute: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const data = await AdminService.deleteRoute(input.id);
      return { success: true, data };
    }),

  listStudents: adminProcedure
    .input(z.object({ search: z.string().optional(), limit: z.number().int().default(50), offset: z.number().int().default(0) }))
    .query(async ({ input }) => {
      const data = await AdminService.listStudents(input.search, input.limit, input.offset);
      return { success: true, data };
    }),

  listDrivers: adminProcedure.query(async () => {
    const data = await AdminService.listDrivers();
    return { success: true, data };
  }),

  createDriver: adminProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        pin: z.string().min(4),
        driverId: z.string().min(3),
        licenseNumber: z.string().min(3),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await AdminService.createDriver(input);
      return { success: true, data };
    }),

  createBus: adminProcedure
    .input(
      z.object({
        plateNumber: z.string().min(3),
        capacity: z.number().int().min(1),
        model: z.string().nullish().transform(v => v ?? undefined),
        routeId: z.string().nullish().transform(v => v ?? undefined),
        driverId: z.string().nullish().transform(v => v ?? undefined),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await AdminService.createBus(input);
      return { success: true, data };
    }),

  deleteBus: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const data = await AdminService.deleteBus(input.id);
      return { success: true, data };
    }),

  listComplaints: adminProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const data = await AdminService.listComplaints(input?.status);
      return { success: true, data };
    }),

  updateComplaint: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["open", "in_review", "resolved", "closed"]),
        adminNotes: z.string().nullish(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = await AdminService.updateComplaint(id, rest);
      return { success: true, data };
    }),

  createAnnouncement: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        audienceRole: z.enum(["student", "driver", "transport_admin", "super_admin"]).optional(),
        fileKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = await AdminService.createAnnouncement(input, ctx.user.sub);
      return { success: true, data };
    }),

  routeUsage: adminProcedure.query(async () => {
    const data = await AdminService.routeUsage();
    return { success: true, data };
  }),

  listAllUsers: adminProcedure.query(async () => {
    const data = await AdminService.listAllUsers();
    return { success: true, data };
  }),

  updateUserRole: adminProcedure
    .input(z.object({ id: z.string(), role: z.enum(["student", "driver", "transport_admin", "super_admin"]) }))
    .mutation(async ({ input }) => {
      const data = await AdminService.updateUserRole(input.id, input.role);
      return { success: true, data };
    }),

  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const data = await AdminService.deleteUser(input.id);
      return { success: true, data };
    }),

  dispatchBus: adminProcedure
    .input(
      z.object({
        busId: z.string(),
        routeId: z.string(),
        driverId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await AdminService.dispatchBus(input.busId, input.routeId, input.driverId);
      return { success: true, data };
    }),

  listLogs: adminProcedure
    .input(z.object({ limit: z.number().int().default(50), offset: z.number().int().default(0) }))
    .query(async ({ input }) => {
      const { LogService } = await import("../services/log.service");
      const data = await LogService.list(input.limit, input.offset);
      return { success: true, data };
    }),
});
