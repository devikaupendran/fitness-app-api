import express from "express";

import helmet from "helmet";

import cors from "cors";

import compression from "compression";

import authRoutes
  from "./routes/auth.routes.js";

import {
  errorHandler
} from "./middleware/error.middleware.js";

const app =
  express();

app.set(
  "trust proxy",
  1
);

app.use(
  helmet()
);

app.use(
  cors({
    origin: false
  })
);

app.use(
  express.json({
    limit: "10kb"
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "10kb"
  })
);

app.use(
  compression()
);

app.get(
  "/health",
  (_req, res) => {

    res.json({
      success: true,
      status: "ok"
    });

  }
);

app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  errorHandler
);

export default app;