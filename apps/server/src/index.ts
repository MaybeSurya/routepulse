import "dotenv/config";
import { createContext } from "@route-pulse/api/context";
import { appRouter } from "@route-pulse/api/routers/index";
import { env } from "@route-pulse/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import prisma from "@route-pulse/db";
import { redis } from "@route-pulse/api/services/seats.service";

const app = express();

// ── Infrastructure Check ─────────────────────────────────────────────────────
async function checkInfrastructure() {
  console.log("🔍 Checking infrastructure...");
  try {
    await Promise.all([
      prisma.$connect().then(() => console.log("✅ Database connected")),
      redis.ping().then(() => console.log("✅ Redis connected")),
    ]);
  } catch (error) {
    console.error("❌ Infrastructure check failed:", error);
    process.exit(1);
  }
}

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── Global rate limiting ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Try again later." },
});
app.use(globalLimiter);

// Auth endpoints stricter rate limit (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: "Too many auth attempts. Please wait." },
});
app.use("/trpc/auth.login", authLimiter);
app.use("/trpc/auth.register", authLimiter);

// ── tRPC ──────────────────────────────────────────────────────────────────────
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC] Internal error on ${path}:`, error);
      }
    },
  }),
);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "OK", ts: new Date().toISOString() } });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "OK" } });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// ── Centralized error handler ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Server Error]", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = env.PORT;

async function start() {
  await checkInfrastructure();
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 RoutePulse server running at http://localhost:${PORT}`);
  });

  // Graceful shutdown
  async function shutdown() {
    console.log("Shutting down gracefully…");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch(err => {
  console.error("❌ Fatal error starting server:", err);
  process.exit(1);
});
