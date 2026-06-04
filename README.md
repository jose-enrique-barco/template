# Side project template

A TypeScript-everywhere starter you can clone and build a side project on top of.
It already wires up the pieces most projects need — a frontend, a backend, and a
database — so you start from a working app, not a blank page.

Runs on Cloudflare's free tier.

## The structure

This is the part worth understanding. `apps/*` are the things you deploy;
`packages/*` are the supporting logic they share.

```
.
├── apps/
│   ├── web/          ← the frontend people see (React + Vite + Tailwind)
│   └── api/          ← the backend, the rules (Hono on Cloudflare Workers)
└── packages/
    ├── shared/       ← types both sides agree on
    ├── db/           ← the database: schema + binding (Cloudflare D1, infra only)
    └── counter/      ← an example feature: its endpoints + queries, as a module
```

The project grows by **adding a package**, not by piling everything into one
folder. Each feature package exports a Hono **module** (a router); the `api` app
is just an aggregator that mounts each one (see `apps/api/src/endpoints.ts`). The
`db` package is pure infrastructure — it owns the schema and the binding shape,
while the query logic for each feature lives in that feature's package. Need
login? Add `packages/oauth`. Need payments? `packages/payments`.

## Run it

You need [Bun](https://bun.sh) and Node.js v22+ (the backend runs through
wrangler, which runs on Node).

```bash
bun install
bun run dev          # start the frontend + backend together
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:8787

Open the frontend. It lists counters from the backend (web → api → back), and you
can create them, delete them, and bump each one up or down — every change is
stored in the database. So the page shows the full round trip working: frontend →
api → database → and back.

> **How dev works:** `bun run dev` runs the backend through `wrangler dev` — the
> **same Cloudflare runtime (workerd) as production**, so there's no separate dev
> code path. It uses a local D1 database in `.wrangler/` (not your remote one);
> the schema is applied on each start, so the `counters` table is always there.
> The backend is pinned to port 8787 — run **one** `bun run dev` per machine.

## Commands

| Command              | What it does                                   |
| -------------------- | ---------------------------------------------- |
| `bun run dev`        | Run frontend + backend together                |
| `bun run build`      | Build everything                               |
| `bun run type-check` | Check types across the whole repo              |
| `bun run lint`       | Check formatting + lint (Biome)                |
| `bun run lint:fix`   | Fix what can be fixed automatically            |
| `bun run setup`      | One-time: create D1 + Pages project + tables   |
| `bun run db:setup`   | Re-apply the schema to your remote D1          |
| `bun run deploy`     | Build + deploy the Worker and the Page         |

> Note: both dev and deploy run wrangler, which runs on Node — so you need
> Node.js v22+ (Bun's runtime has an HTTP bug that hangs wrangler). Bun is still
> the package manager and runs the frontend build.

## Deploy to Cloudflare

Three pieces ship to Cloudflare: the **database** (D1), the **backend** (a
Worker), and the **frontend** (Pages). You run `setup` once to create the
resources; after that `bun run deploy` ships everything.

### First time: create the resources

```bash
wrangler login       # authorize wrangler (once per machine)
bun run setup        # create the D1 database, the Pages project, and the tables
```

`setup` creates the D1 database (and writes its id into `apps/api/wrangler.jsonc`),
creates the Pages project, and applies the schema. It's idempotent — safe to re-run.

One more thing before deploying: tell the frontend where the API lives. In dev,
Vite proxies `/api` to the Worker (see `apps/web/vite.config.ts`); in production
the frontend (Pages) and the API (Worker) sit on **different origins with no
proxy**, so the build needs the Worker's URL. Set it in `apps/web/.env.production`:

```
VITE_API_URL=https://template-api.<your-subdomain>.workers.dev
```

Don't know your subdomain yet? Run `bun run deploy` once — it prints the Worker's
URL — then paste it in and deploy again. CORS is already enabled on the API
(`apps/api/src/endpoints.ts`), so the cross-origin call from Pages just works.

### Every deploy

```bash
bun run deploy        # builds the frontend, then deploys the Worker, then the Page
```

It's done when wrangler prints both URLs — the Worker (`…workers.dev`) and the
Pages site (`…pages.dev`). Open the **bare** `…pages.dev` URL.

> **Gotchas worth knowing**
> - Use `<project>.pages.dev`, not the per-deploy `<hash>.<project>.pages.dev` link —
>   the hashed subdomain's TLS cert takes a few minutes to provision on a new project
>   (until then you'll get `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`).
> - `.pages.dev` subdomains are globally unique. If `template-web` is taken, your
>   project is still *named* `template-web` but gets a suffixed domain like
>   `template-web-ab1.pages.dev`. That's normal — the project name and the domain differ.
> - Prefer `bun run deploy` over a bare `wrangler pages deploy`: the deploy-only path
>   skips the build, so you'd ship a stale frontend (and an unset `VITE_API_URL`).
> - For auto-deploys on push, connect the repo in the Cloudflare **Pages** dashboard
>   (root dir `apps/web`, build `bun run build`, output `dist`).

## Where to go next

- Add a table in `packages/db/schema.sql` (then `bun run db:setup` to apply it to
  your remote database).
- Add a feature package under `packages/` that exports a Hono module (queries +
  endpoints, like `packages/counter`), add a matching type in `packages/shared`,
  and mount it with one `app.route(...)` line in `apps/api/src/endpoints.ts`.
- Add a page or component in `apps/web/src`.

Ship it ugly. Improve it later.
