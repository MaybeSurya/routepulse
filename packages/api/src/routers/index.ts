import { authRouter } from "./auth";
import { adminRouter } from "./admin";
import { busRouter } from "./bus";
import { driverRouter } from "./driver";
import { routesRouter } from "./routes";
import { seatsRouter } from "./seats";
import { studentRouter } from "./student";
import { uploadsRouter } from "./uploads";
import { userRouter } from "./user";
import { router, publicProcedure } from "../index";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  auth: authRouter,
  admin: adminRouter,
  bus: busRouter,
  driver: driverRouter,
  routes: routesRouter,
  seats: seatsRouter,
  student: studentRouter,
  uploads: uploadsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
