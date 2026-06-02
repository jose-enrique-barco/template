import type { Greeting } from "@app/shared";

// Where the API lives. In dev this is empty, so requests stay relative ("/api/…")
// and Vite proxies them to the Worker. In production there's no proxy, so the
// build sets VITE_API_URL (see .env.production) to the Worker's own origin.
const API_BASE = import.meta.env.VITE_API_URL ?? "";

// During `bun run dev` the Worker takes a few seconds to boot while Vite is
// instant — so the very first requests can fail. Retry briefly so the page
// self-heals the moment the backend is ready, instead of showing an error.
async function request(path: string, init?: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, init);
      if (res.ok || res.status < 500 || attempt >= 6) return res;
    } catch (err) {
      if (attempt >= 6) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
}

export async function fetchGreeting(): Promise<Greeting> {
  const res = await request("/api/hello");
  if (!res.ok) throw new Error("failed to reach the api");
  return res.json();
}
