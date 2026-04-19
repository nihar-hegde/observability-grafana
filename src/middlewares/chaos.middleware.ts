import { type Request, type Response, type NextFunction } from "express";
import { env } from "../config/env.js";

export const chaosMiddleware = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!env.CHAOS_ENABLED) return next();

  const roll = Math.random();

  if (roll < env.CHAOS_LATENCY_RATE) {
    const delayMs = Math.floor(Math.random() * env.CHAOS_MAX_LATENCY_MS);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  if (roll < env.CHAOS_ERROR_RATE) {
    res.status(500).json({
      error: "Injected random failure",
      chaos: true,
    });
    return;
  }

  next();
};
