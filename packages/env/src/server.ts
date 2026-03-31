import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Core
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3000),

    // Supabase
    SUPABASE_URL: z.string().min(1),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_KEY: z.string().min(1),

    // Auth
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    // Mailgun
    MAILGUN_API_KEY: z.string().min(1),
    MAILGUN_DOMAIN: z.string().min(1),
    MAILGUN_FROM_EMAIL: z.string().email(),

    // Cloudflare R2
    R2_ACCOUNT_ID: z.string().default(""),
    R2_ACCESS_KEY_ID: z.string().default(""),
    R2_SECRET_ACCESS_KEY: z.string().default(""),
    R2_BUCKET_NAME: z.string().default(""),
    R2_PUBLIC_URL: z.string().default(""),

    // Upstash Redis
    UPSTASH_REDIS_REST_URL: z.string().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    // BullMQ Redis
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().default(""),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

    // GPS
    STOP_DETECTION_THRESHOLD_METERS: z.coerce.number().default(50),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: false,
});
