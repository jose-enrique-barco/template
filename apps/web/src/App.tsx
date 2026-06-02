import { useEffect, useState } from "react";
import { fetchGreeting } from "./api";

// A discriminated union makes impossible states impossible: we can't be both
// loading and showing an error at the same time.
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; message: string; visits: number };

export function App() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    fetchGreeting()
      .then((greeting) =>
        setState({ status: "ready", message: greeting.message, visits: greeting.visits }),
      )
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "unknown error";
        setState({ status: "error", message });
      });
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <h1 className="text-4xl font-bold tracking-tight">Hello world 👋</h1>
      <p className="mt-3 text-gray-500">
        The frontend (React) talking to the backend (Hono), which reads and writes a database (D1) —
        all through a shared type.
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 p-4">
        <p className="text-sm text-gray-400">message from the api:</p>
        {state.status === "loading" && <p className="text-gray-400">Loading…</p>}
        {state.status === "error" && <p className="text-red-600">{state.message}</p>}
        {state.status === "ready" && (
          <>
            <p className="text-lg font-medium">{state.message}</p>
            <p className="mt-1 text-sm text-gray-400">visit #{state.visits} — counted in D1</p>
          </>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-400">
        This is your starting point. Build your side project on top of it.
      </p>
    </main>
  );
}
