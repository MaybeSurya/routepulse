import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../index";
import { RouteService } from "../services/route.service";

export const routesRouter = router({
  list: protectedProcedure
    .input(z.object({ activeOnly: z.boolean().default(true) }).optional())
    .query(async ({ input }) => {
      const data = await RouteService.listRoutes(input?.activeOnly);
      return { success: true, data };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const data = await RouteService.getRoute(input.id);
      return { success: true, data };
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullish().transform(v => v ?? undefined),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullish().transform(v => v ?? undefined),
        stops: z.array(
          z.object({
            name: z.string().min(1),
            lat: z.number(),
            lng: z.number(),
            order: z.number().int().min(1),
            radiusMeters: z.number().default(50),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const data = await RouteService.createRoute(input);
      return { success: true, data };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().nullish().transform(v => v ?? undefined),
        isActive: z.boolean().nullish().transform(v => v ?? undefined),
        color: z.string().nullish().transform(v => v ?? undefined),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = await RouteService.updateRoute(id, rest);
      return { success: true, data };
    }),

  addStop: adminProcedure
    .input(
      z.object({
        routeId: z.string(),
        name: z.string().min(1),
        lat: z.number(),
        lng: z.number(),
        order: z.number().int().min(1),
        radiusMeters: z.number().default(50),
      }),
    )
    .mutation(async ({ input }) => {
      const { routeId, ...stopData } = input;
      const data = await RouteService.addStop(routeId, stopData);
      return { success: true, data };
    }),

  removeStop: adminProcedure
    .input(z.object({ stopId: z.string() }))
    .mutation(async ({ input }) => {
      const data = await RouteService.removeStop(input.stopId);
      return { success: true, data };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const data = await RouteService.deleteRoute(input.id);
      return { success: true, data };
    }),
});
