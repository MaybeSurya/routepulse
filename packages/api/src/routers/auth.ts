import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../index";
import { AuthService } from "../services/auth.service";

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        phone: z.string().min(10).optional(),
        erpId: z.string().min(3).optional(),
        password: z.string().min(8),
        universityId: z.string().min(1),
        enrollmentYear: z.number().int().min(2000).max(2100),
        departmentName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return AuthService.registerStudent(input);
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      return AuthService.requestPasswordReset(input.email);
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string().min(1), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      return AuthService.resetPassword(input);
    }),

  loginStudent: publicProcedure
    .input(
      z.object({
        identifier: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return AuthService.loginStudent(input);
    }),

  loginDriver: publicProcedure
    .input(
      z.object({
        driverId: z.string().min(1),
        pin: z.string().min(4),
      }),
    )
    .mutation(async ({ input }) => {
      return AuthService.loginDriver(input);
    }),

  loginAdmin: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return AuthService.loginAdmin(input);
    }),

  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      return AuthService.refreshToken(input);
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    return AuthService.logout(ctx.user.sub);
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return AuthService.getProfile(ctx.user.sub);
  }),
});

