import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { driverOnlyProcedure, router } from "../index";
import { DriverService } from "../services/driver.service";

export const driverRouter = router({
  getAssignedBus: driverOnlyProcedure.query(async ({ ctx }) => {
    const data = await DriverService.getAssignedBus(ctx.user.sub);
    return { success: true, data };
  }),

  updateLocation: driverOnlyProcedure
    .input(
      z.object({
        busId: z.string().nullish().transform(v => v ?? undefined),
        lat: z.number(),
        lng: z.number(),
        speed: z.number(),
        heading: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let targetBusId = input.busId;
      if (!targetBusId) {
        const assignment = await DriverService.getAssignedBus(ctx.user.sub);
        if (!assignment.bus) {
           throw new TRPCError({ code: "BAD_REQUEST", message: "No active bus assignment found." });
        }
        targetBusId = assignment.bus.id;
      }

      const result = await DriverService.processLocationUpdate(ctx.user.sub, {
        busId: targetBusId,
        lat: input.lat,
        lng: input.lng,
        speed: input.speed,
        heading: input.heading,
      });

      return { success: true, data: result };
    }),

  markStopReached: driverOnlyProcedure
    .input(z.object({ busId: z.string(), stopId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return DriverService.markStopReached(ctx.user.sub, input.busId, input.stopId);
    }),

  triggerSOS: driverOnlyProcedure
    .input(
      z.object({
        busId: z.string(),
        lat: z.number(),
        lng: z.number(),
        speed: z.number(),
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return DriverService.triggerSOS(
        ctx.user.sub,
        input.busId,
        input.lat,
        input.lng,
        input.speed,
        input.message,
      );
    }),
});
