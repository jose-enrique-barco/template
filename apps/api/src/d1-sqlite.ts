import type { Database } from "bun:sqlite";

// A tiny adapter that makes a local Bun SQLite database look like Cloudflare D1,
// so the exact same query code in packages/db runs locally and in production.
// Dev-only — production uses the real D1 binding.

type Param = string | number | null;

interface PreparedLike {
  bind(...values: Param[]): PreparedLike;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean }>;
}

export function createD1(db: Database): { prepare(sql: string): PreparedLike } {
  return {
    prepare: (sql: string) => prepared(db, sql, []),
  };
}

function prepared(db: Database, sql: string, values: Param[]): PreparedLike {
  return {
    bind: (...next: Param[]) => prepared(db, sql, next),
    first: async <T>() => (db.query(sql).get(...values) as T | null) ?? null,
    all: async <T>() => ({ results: db.query(sql).all(...values) as T[] }),
    run: async () => {
      db.query(sql).run(...values);
      return { success: true };
    },
  };
}
