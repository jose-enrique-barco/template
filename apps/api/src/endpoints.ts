import { counterModule } from "@app/counter";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./env";

// The api app is an aggregator: it owns no endpoint logic of its own. Each
// feature lives in its own package that exports a Hono module (e.g.
// @app/counter); the api just mounts each one under a path. Add a feature by
// adding a package and one `app.route(...)` line here.
export const app = new Hono<{ Bindings: AppEnv }>();

app.use("/api/*", cors());

app.route("/api/counters", counterModule);

app.get("/", (c) => c.text("api is running — try /api/counters"));
