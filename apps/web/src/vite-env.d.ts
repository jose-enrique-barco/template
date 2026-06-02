/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Set in .env.production to the deployed Worker's origin. Empty in dev (the
  // Vite proxy handles /api), so it's optional.
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
