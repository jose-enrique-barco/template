// Every function takes its dependencies (the D1 database) as the last argument.
// No classes, no hidden state — easy to read, easy to test.

interface DbEnv {
  DB: D1Database;
}

interface VisitRow {
  count: number;
}

// Bump the visit counter and return the new total. A tiny read+write example —
// replace it with your own tables and query functions.
export async function recordVisit(env: DbEnv): Promise<number> {
  const row = await env.DB.prepare(
    "UPDATE visits SET count = count + 1 WHERE id = 1 RETURNING count",
  ).first<VisitRow>();
  if (!row) throw new Error("visits row missing — did you apply schema.sql?");
  return row.count;
}
