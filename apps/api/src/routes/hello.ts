import { recordVisit } from "@app/db";
import type { Greeting } from "@app/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";

export const helloRoutes = new Hono<{ Bindings: AppEnv }>();

helloRoutes.get("/", async (c) => {
  const visits = await recordVisit(c.env);
  const body: Greeting = { message: "Hello from the API 👋", visits };
  return c.json(body);
});
