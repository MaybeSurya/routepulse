import { z } from "zod";
import { adminProcedure, driverOnlyProcedure, protectedProcedure, router } from "../index";
import { BusService } from "../services/bus.service";

export const busRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        routeId: z.string().optional(),
        status: z.enum(["inactive", "en_route", "arrived", "maintenance"]).optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      const data = await BusService.listBuses(input?.status, input?.routeId);
      return { success: true, data };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const data = await BusService.getBus(input.id);
      return { success: true, data };
    }),

  create: adminProcedure
    .input(
      z.object({
        plateNumber: z.string().min(1),
        capacity: z.number().int().min(1).max(100).default(40),
        model: z.string().nullish().transform(v => v ?? undefined),
        routeId: z.string().nullish().transform(v => v ?? undefined),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await BusService.createBus(input);
      return { success: true, data };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        plateNumber: z.string().nullish().transform(v => v ?? undefined),
        capacity: z.number().int().nullish().transform(v => v ?? undefined),
        model: z.string().nullish().transform(v => v ?? undefined),
        status: z.enum(["inactive", "en_route", "arrived", "maintenance"]).nullish().transform(v => v ?? undefined),
        routeId: z.string().nullish().transform(v => v ?? undefined),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = await BusService.updateBus(id, rest);
      return { success: true, data };
    }),

  assignDriver: adminProcedure
    .input(z.object({ busId: z.string(), driverId: z.string() }))
    .mutation(async ({ input }) => {
      const data = await BusService.assignDriver(input.busId, input.driverId);
      return { success: true, data };
    }),

  updateStatus: driverOnlyProcedure
    .input(z.object({
      busId: z.string(),
      status: z.enum(["inactive", "en_route", "arrived", "maintenance"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = await BusService.updateStatus(input.busId, input.status, ctx.user.sub, ctx.user.role);
      return { success: true, data };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const data = await BusService.deleteBus(input.id);
      return { success: true, data };
    }),
});
