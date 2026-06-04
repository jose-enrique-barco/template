// The counter domain's data access. These are the only functions that touch the
// `counters` table. Every function takes its dependencies (the D1 database env) as
// the last argument — no classes, no hidden state — so they're easy to test.
// Queries go through Drizzle (typed query builder) against the schema in @app/db.

import { counters, type DbEnv, getDb } from "@app/db";
import type { Counter } from "@app/shared";
import { eq, sql } from "drizzle-orm";

export async function listCounters(env: DbEnv): Promise<Counter[]> {
  return getDb(env).select().from(counters).orderBy(counters.id);
}

export async function createCounter(name: string, env: DbEnv): Promise<Counter> {
  const [row] = await getDb(env).insert(counters).values({ name }).returning();
  if (!row) throw new Error("failed to create counter");
  return row;
}

export async function deleteCounter(id: number, env: DbEnv): Promise<boolean> {
  const res = await getDb(env).delete(counters).where(eq(counters.id, id)).run();
  return res.meta.changes > 0;
}

// Bump a counter by `delta` (+1 or -1) and return the new row, or null if no
// counter has that id. A single UPDATE … RETURNING keeps it to one round trip.
export async function adjustCounter(
  id: number,
  delta: number,
  env: DbEnv,
): Promise<Counter | null> {
  const [row] = await getDb(env)
    .update(counters)
    .set({ count: sql`${counters.count} + ${delta}` })
    .where(eq(counters.id, id))
    .returning();
  return row ?? null;
}
