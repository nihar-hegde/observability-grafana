import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(3306),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  CHAOS_ENABLED: z.coerce.boolean().default(true),
  CHAOS_ERROR_RATE: z.coerce.number().min(0).max(1).default(0.1),
  CHAOS_LATENCY_RATE: z.coerce.number().min(0).max(1).default(0.2),
  CHAOS_MAX_LATENCY_MS: z.coerce.number().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
