import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { SeatsService } from "../services/seats.service";

export const seatsRouter = router({
  getSeats: protectedProcedure
    .input(z.object({ busId: z.string() }))
    .query(async ({ input }) => {
      const data = await SeatsService.getSeatsWithHolds(input.busId);
      return { success: true, data };
    }),

  holdSeat: protectedProcedure
    .input(z.object({ busId: z.string(), seatId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const data = await SeatsService.holdSeat(input.busId, input.seatId, ctx.user.sub);
      return { success: true, data };
    }),

  confirmSeat: protectedProcedure
    .input(z.object({ busId: z.string(), seatId: z.string(), routeId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const data = await SeatsService.confirmSeat(input.busId, input.seatId, ctx.user.sub, input.routeId);
      return { success: true, data };
    }),

  releaseSeat: protectedProcedure
    .input(z.object({ busId: z.string(), seatId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const data = await SeatsService.releaseSeat(input.busId, input.seatId, ctx.user.sub);
      return { success: true, data };
    }),

  cancelBooking: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data = await SeatsService.cancelBooking(input.bookingId, ctx.user.sub, ctx.user.role);
      return { success: true, data };
    }),
});
