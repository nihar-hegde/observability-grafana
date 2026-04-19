import pino from "pino";
import { trace } from "@opentelemetry/api";

const isDev = (process.env.NODE_ENV ?? "development") !== "production";

function buildTransport():
  | pino.TransportMultiOptions
  | pino.TransportSingleOptions
  | undefined {
  const targets: pino.TransportTargetOptions[] = [];

  if (isDev) {
    targets.push({
      target: "pino-pretty",
      level: "debug",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    });
  } else {
    targets.push({
      target: "pino/file",
      level: "info",
      options: { destination: 1 },
    });
  }

  if (process.env.LOKI_URL) {
    targets.push({
      target: "pino-loki",
      level: "info",
      options: {
        host: process.env.LOKI_URL,
        labels: {
          app: process.env.SERVICE_NAME ?? "observability-test",
          env: process.env.NODE_ENV ?? "development",
        },
        batching: true,
        interval: 5,
      },
    });
  }

  return targets.length === 0 ? undefined : { targets };
}

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  mixin() {
    const span = trace.getActiveSpan();
    if (!span?.isRecording()) return {};
    const ctx = span.spanContext();
    return { traceId: ctx.traceId, spanId: ctx.spanId };
  },
  transport: buildTransport(),
});
