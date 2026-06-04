// Drizzle Kit config: how `drizzle-kit generate` turns schema.ts into versioned
// SQL migration files. D1 is SQLite, so the dialect is "sqlite". The generated
// files land in ./migrations, which wrangler applies to D1 (see apps/api).

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema.ts",
  out: "./migrations",
});
