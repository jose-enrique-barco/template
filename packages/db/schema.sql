-- The database. One tiny table to start: a single counter the API bumps on each
-- visit, just to show the DB layer working end to end. Replace it with your own
-- tables. Dev creates + applies this automatically; for prod run `bun run db:setup`
-- (applies this file to your remote D1). Safe to re-run: it's idempotent.

CREATE TABLE IF NOT EXISTS visits (
  id    INTEGER PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO visits (id, count) VALUES (1, 0);
