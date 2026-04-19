import { type Request, type Response, type NextFunction } from "express";
import {
  httpRequestsTotal,
  httpRequestDuration,
  httpRequestErrors,
} from "../metrics/index.js";

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationNs = process.hrtime.bigint() - startTime;
    const durationSec = Number(durationNs) / 1e9;

    const route = (req.route?.path as string | undefined) ?? req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSec);

    if (res.statusCode >= 400) {
      httpRequestErrors.inc(labels);
    }
  });

  next();
}
