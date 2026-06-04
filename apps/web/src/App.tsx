import type { Counter } from "@app/shared";
import { useEffect, useState } from "react";
import { adjustCounter, createCounter, deleteCounter, listCounters } from "./api";

// A discriminated union makes impossible states impossible: we can't be both
// loading and showing an error at the same time.
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; counters: Counter[] };

export function App() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [name, setName] = useState("");

  useEffect(() => {
    listCounters()
      .then((counters) => setState({ status: "ready", counters }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "unknown error";
        setState({ status: "error", message });
      });
  }, []);

  // Replace a single counter in place (after +1/-1), or drop it (after delete).
  function replaceCounter(id: number, next: Counter | null) {
    setState((prev) => {
      if (prev.status !== "ready") return prev;
      const counters = next
        ? prev.counters.map((counter) => (counter.id === id ? next : counter))
        : prev.counters.filter((counter) => counter.id !== id);
      return { status: "ready", counters };
    });
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const created = await createCounter(trimmed);
    setName("");
    setState((prev) =>
      prev.status === "ready" ? { status: "ready", counters: [...prev.counters, created] } : prev,
    );
  }

  async function onAdjust(id: number, direction: "increment" | "decrement") {
    const updated = await adjustCounter(id, direction);
    replaceCounter(id, updated);
  }

  async function onDelete(id: number) {
    await deleteCounter(id);
    replaceCounter(id, null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <h1 className="text-4xl font-bold tracking-tight">Counters 🔢</h1>
      <p className="mt-3 text-gray-500">
        The frontend (React) talking to the backend (Hono), which reads and writes a database (D1) —
        all through a shared type. Each counter lives in D1.
      </p>

      <form onSubmit={onCreate} className="mt-6 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New counter name…"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Add
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-gray-200 p-4">
        {state.status === "loading" && <p className="text-gray-400">Loading…</p>}
        {state.status === "error" && <p className="text-red-600">{state.message}</p>}
        {state.status === "ready" && state.counters.length === 0 && (
          <p className="text-gray-400">No counters yet — add one above.</p>
        )}
        {state.status === "ready" && state.counters.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {state.counters.map((counter) => (
              <li key={counter.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{counter.name}</p>
                  <p className="text-sm text-gray-400">count: {counter.count}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAdjust(counter.id, "decrement")}
                    className="h-8 w-8 rounded-lg border border-gray-200 text-lg leading-none hover:bg-gray-50"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjust(counter.id, "increment")}
                    className="h-8 w-8 rounded-lg border border-gray-200 text-lg leading-none hover:bg-gray-50"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(counter.id)}
                    className="ml-2 text-sm text-gray-400 hover:text-red-600"
                  >
                    delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-400">
        This is your starting point. Build your side project on top of it.
      </p>
    </main>
  );
}
