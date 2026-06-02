import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./env";
import { helloRoutes } from "./routes/hello";

// The Hono app and all its endpoint wiring lives here. index.ts just exports it.
export const app = new Hono<{ Bindings: AppEnv }>();

app.use("/api/*", cors());

app.route("/api/hello", helloRoutes);

app.get("/", (c) => c.text("api is running — try /api/hello"));
