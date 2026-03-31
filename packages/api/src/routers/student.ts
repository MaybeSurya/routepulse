import { z } from "zod";

import { studentProcedure, router } from "../index";
import { StudentService } from "../services/student.service";

export const studentRouter = router({
  getProfile: studentProcedure.query(async ({ ctx }) => {
    const data = await StudentService.getProfile(ctx.user.sub);
    return { success: true, data };
  }),

  getAssignedBus: studentProcedure.query(async ({ ctx }) => {
    const data = await StudentService.getAssignedBus(ctx.user.sub);
    return { success: true, data };
  }),

  listBookings: studentProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().int().default(20) }))
    .query(async ({ ctx, input }) => {
      const data = await StudentService.listBookings(ctx.user.sub, input.status, input.limit);
      return { success: true, data };
    }),

  submitComplaint: studentProcedure
    .input(
      z.object({
        subject: z.string().min(3).max(200),
        description: z.string().min(10).max(2000),
        fileKey: z.string().nullish().transform(v => v ?? undefined),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = await StudentService.submitComplaint(ctx.user.sub, input);
      return { success: true, data };
    }),

  listComplaints: studentProcedure.query(async ({ ctx }) => {
    const data = await StudentService.listComplaints(ctx.user.sub);
    return { success: true, data };
  }),

  bookRoute: studentProcedure
    .input(z.object({ routeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data = await StudentService.bookRoute(ctx.user.sub, input.routeId);
      return { success: true, data };
    }),

  triggerSOS: studentProcedure
    .input(
      z.object({
        busId: z.string(),
        lat: z.number(),
        lng: z.number(),
        speed: z.number(),
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Students can also trigger SOS for their current bus
      // Reuse DriverService.triggerSOS as it's the same system-wide SOS
      const { DriverService } = await import("../services/driver.service");
      return DriverService.triggerSOS(ctx.user.sub, input.busId, input.lat, input.lng, input.speed, input.message);
    }),
});
