// The database schema. Infrastructure only: this file owns the table shapes;
// the query logic that uses them lives in the feature packages (e.g. @app/counter).
// Drizzle generates SQL migrations from this file (see drizzle.config.ts) — run
// `bun run generate` after editing, then apply with the api app's db scripts.
//
// One example table: a list of named counters the API can create, delete, and
// bump up or down. Replace it with your own tables.

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const counters = sqliteTable("counters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  count: integer("count").notNull().default(0),
});
