import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import healthRoute from "./routes/health.route.js";
import todoRoute from "./routes/todo.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { chaosMiddleware } from "./middlewares/chaos.middleware.js";
import { metricsMiddleware } from "./middlewares/metrics.middleware.js";
import { register } from "./metrics/index.js";
import { logger } from "./logger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(chaosMiddleware);

app.use("/", healthRoute);
app.use("/todos", todoRoute);

app.use(errorHandler);

export default app;
