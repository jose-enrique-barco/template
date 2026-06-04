// The counter feature, as a self-contained module. It exports a Hono router that
// the api app mounts under a path (see apps/api) — the api doesn't know what's
// inside, it just aggregates modules like this one. To add a feature to the
// project, add a package that exports a module and mount it.

import type { DbEnv } from "@app/db";
import { Hono } from "hono";
import { adjustCounter, createCounter, deleteCounter, listCounters } from "./queries";

export const counterModule = new Hono<{ Bindings: DbEnv }>();

// GET / — list every counter.
counterModule.get("/", async (c) => {
  const counters = await listCounters(c.env);
  return c.json(counters);
});

// POST / — create a counter from a JSON body { name }.
counterModule.post("/", async (c) => {
  const body: { name?: unknown } = await c.req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return c.json({ error: "name is required" }, 400);

  const counter = await createCounter(name, c.env);
  return c.json(counter, 201);
});

// DELETE /:id — remove a counter.
counterModule.delete("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) return c.json({ error: "invalid id" }, 400);

  const deleted = await deleteCounter(id, c.env);
  if (!deleted) return c.json({ error: "counter not found" }, 404);
  return c.body(null, 204);
});

// POST /:id/increment — add one.
counterModule.post("/:id/increment", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) return c.json({ error: "invalid id" }, 400);

  const counter = await adjustCounter(id, 1, c.env);
  if (!counter) return c.json({ error: "counter not found" }, 404);
  return c.json(counter);
});

// POST /:id/decrement — subtract one.
counterModule.post("/:id/decrement", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) return c.json({ error: "invalid id" }, 400);

  const counter = await adjustCounter(id, -1, c.env);
  if (!counter) return c.json({ error: "counter not found" }, 404);
  return c.json(counter);
});

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
