-- The database. Infrastructure only: this file owns the schema; the query logic
-- that uses these tables lives in the feature packages (e.g. @app/counter).
--
-- One example table: a list of named counters the API can create, delete, and
-- bump up or down. Replace it with your own tables. Dev creates + applies this
-- automatically; for prod run `bun run db:setup` (applies this file to your
-- remote D1). Safe to re-run: it's idempotent.

CREATE TABLE IF NOT EXISTS counters (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0
);
