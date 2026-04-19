import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import healthRoute from "./routes/health.route.js";
import todoRoute from "./routes/todo.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { chaosMiddleware } from "./middlewares/chaos.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp());

app.use(chaosMiddleware);

app.use("/", healthRoute);
app.use("/todos", todoRoute);

app.use(errorHandler);

export default app;

// run test
