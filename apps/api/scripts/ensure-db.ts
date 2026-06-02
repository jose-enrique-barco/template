import { readFileSync, writeFileSync } from "node:fs";
import { $ } from "bun";

// Make sure the D1 database in wrangler.jsonc exists, creating it if needed, and
// write its id back into the config. Idempotent: safe to run every `bun run setup`.
// `wrangler d1 create` has no --json output and errors if the DB already exists,
// so we read the id from `wrangler d1 list --json` instead.

const configPath = `${import.meta.dir}/../wrangler.jsonc`;
const config = readFileSync(configPath, "utf8");

const name = config.match(/"database_name":\s*"([^"]+)"/)?.[1];
if (!name) {
  console.error("No database_name found in wrangler.jsonc");
  process.exit(1);
}

async function findId(): Promise<string | undefined> {
  const res = await $`wrangler d1 list --json`.quiet().nothrow();
  if (res.exitCode !== 0) return undefined;
  const dbs = JSON.parse(res.stdout.toString()) as Array<{ uuid: string; name: string }>;
  return dbs.find((db) => db.name === name)?.uuid;
}

let id = await findId();
if (id) {
  console.log(`↳ D1 database "${name}" already exists — reusing`);
} else {
  console.log(`Creating D1 database "${name}"…`);
  await $`wrangler d1 create ${name}`;
  id = await findId();
}

if (!id) {
  console.error(`Could not determine the id for "${name}".`);
  process.exit(1);
}

const updated = config.replace(/("database_id":\s*)"[^"]*"/, `$1"${id}"`);
if (updated === config) {
  console.log(`database_id already set to ${id}`);
} else {
  writeFileSync(configPath, updated);
  console.log(`Wrote database_id ${id} into wrangler.jsonc`);
}
