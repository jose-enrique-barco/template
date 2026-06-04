// The counter domain's data access. These are the only functions that touch the
// `counters` table. Every function takes its dependencies (the D1 database) as
// the last argument — no classes, no hidden state — so they're easy to test.

import type { DbEnv } from "@app/db";
import type { Counter } from "@app/shared";

export async function listCounters(env: DbEnv): Promise<Counter[]> {
  const { results } = await env.DB.prepare(
    "SELECT id, name, count FROM counters ORDER BY id",
  ).all<Counter>();
  return results;
}

export async function createCounter(name: string, env: DbEnv): Promise<Counter> {
  const row = await env.DB.prepare(
    "INSERT INTO counters (name, count) VALUES (?, 0) RETURNING id, name, count",
  )
    .bind(name)
    .first<Counter>();
  if (!row) throw new Error("failed to create counter");
  return row;
}

export async function deleteCounter(id: number, env: DbEnv): Promise<boolean> {
  const res = await env.DB.prepare("DELETE FROM counters WHERE id = ?").bind(id).run();
  return res.meta.changes > 0;
}

// Bump a counter by `delta` (+1 or -1) and return the new row, or null if no
// counter has that id. A single UPDATE … RETURNING keeps it to one round trip.
export async function adjustCounter(
  id: number,
  delta: number,
  env: DbEnv,
): Promise<Counter | null> {
  const row = await env.DB.prepare(
    "UPDATE counters SET count = count + ? WHERE id = ? RETURNING id, name, count",
  )
    .bind(delta, id)
    .first<Counter>();
  return row ?? null;
}
