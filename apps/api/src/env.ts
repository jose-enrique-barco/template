// Everything the Worker has at runtime: its bindings. The database binding shape
// lives in @app/db (infra); extend it here with any Worker-specific vars/secrets
// your project needs.

import type { DbEnv } from "@app/db";

export interface AppEnv extends DbEnv {}
