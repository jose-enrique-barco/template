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
│   └── api/          ← the backend, the rules (Hono — Bun in dev, Workers in prod)
└── packages/
    ├── shared/       ← types both sides agree on
    └── db/           ← the database: schema + queries (Cloudflare D1)
```

The project grows by **adding a package**, not by piling everything into one
folder. Need login? Add `packages/oauth`. Need payments? `packages/payments`.

## Run it

You only need [Bun](https://bun.sh).

```bash
bun install
bun run dev          # start the frontend + backend together
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:8787

Open the frontend. It fetches a message from the backend (web → api → back), and
the backend bumps a visit counter stored in the database and returns it — so the
page shows the full round trip working: frontend → api → database → and back.

> **How dev works:** the API runs on Bun directly (`bun --hot`), with a local
> SQLite file (`apps/api/dev.db`) standing in for D1 — created and migrated
> automatically on startup, no setup step. Run **one** `bun run dev` per machine
> (the backend is pinned to port 8787). Production runs the same Hono code on
> Cloudflare Workers with real D1.

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

> Note: wrangler runs on Node, so deploying needs Node.js v22+ (Bun's runtime has
> an HTTP bug that hangs wrangler's API calls). Dev itself only needs Bun.

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

- Add a table in `packages/db/schema.sql` and a query function in `packages/db/src`
  (then `bun run db:setup` to apply it to your remote database).
- Add a route in `apps/api/src/routes/` and a matching type in `packages/shared`.
- Add a page or component in `apps/web/src`.

Ship it ugly. Improve it later.
