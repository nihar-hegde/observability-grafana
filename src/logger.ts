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
        propsToLabels: ["levelName"],
        batching: true,
        interval: 5,
      },
    });
  }

  return targets.length === 0 ? undefined : { targets };
}

const LEVEL_NAMES: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  mixin(_mergeObject, level) {
    const span = trace.getActiveSpan();
    const extra: Record<string, string> = {
      levelName: LEVEL_NAMES[level] ?? "unknown",
    };
    if (span?.isRecording()) {
      const ctx = span.spanContext();
      extra.traceId = ctx.traceId;
      extra.spanId = ctx.spanId;
    }
    return extra;
  },
  transport: buildTransport(),
});
