import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { createD1 } from "./d1-sqlite";
import type { AppEnv } from "./env";
import app from "./index";

// Local dev server: runs the Worker on Bun directly (no workerd), with a SQLite
// file standing in for D1. Production still runs on Cloudflare via `wrangler deploy`.

const schema = readFileSync(`${import.meta.dir}/../../../packages/db/schema.sql`, "utf8");
const db = new Database(`${import.meta.dir}/../dev.db`);
db.exec(schema);

const env: AppEnv = {
  DB: createD1(db) as unknown as D1Database,
};

const port = Number(process.env.PORT ?? 8787);
Bun.serve({ port, hostname: "127.0.0.1", fetch: (req) => app.fetch(req, env) });

console.log(`api (bun dev) ready on http://127.0.0.1:${port}`);
