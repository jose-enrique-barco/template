// The db package is pure infrastructure: it owns the schema (schema.ts) and the
// shape of the database binding, plus a small factory that wraps the raw D1
// binding in a typed Drizzle client. It holds no query logic — each feature
// package owns the queries for its own domain (see @app/counter) and receives
// this env as its last argument, so functions stay easy to read and easy to test.

import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export interface DbEnv {
  DB: D1Database;
}

// Wrap the raw D1 binding in a Drizzle client bound to our schema. Feature
// packages call this to get a typed query builder: getDb(env).select()...
export function getDb(env: DbEnv) {
  return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;

export { schema };
export { counters } from "./schema";
