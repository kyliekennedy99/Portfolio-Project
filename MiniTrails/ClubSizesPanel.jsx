// ---------------------------------------------------------------------------
// ClubSizesPanel.jsx – wider layout + larger margins
// ---------------------------------------------------------------------------
import { useClubSizes } from "../api/api";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function ClubSizesPanel({ limit = 10 }) {
  const { data = [], isLoading, isError, error } = useClubSizes();
  const top = data.slice(0, limit);

  /* ------------------------------ states */
  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Spinner />
        Loading clubs…
      </div>
    );

  if (isError)
    return (
      <p className="py-8 text-center text-red-600">Error: {error.message}</p>
    );

  if (!top.length)
    return (
      <p className="py-8 text-center text-slate-500">No club data yet.</p>
    );

  /* ------------------------------ component */
  return (
    <section className="mx-auto my-10 max-w-3xl px-4 sm:px-8">
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-slate-200">
        {/* header */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            🌲 Largest Hiking Clubs
          </h2>
          <span className="text-xs text-green-700/80">Top&nbsp;{limit}</span>
        </header>

        {/* ordered list */}
        <ol className="divide-y divide-slate-100">
          {top.map((c, idx) => (
            <li
              key={c.clubId}
              className={`flex items-center justify-between px-8 py-4
                          ${
                            idx % 2
                              ? "bg-green-50/25"
                              : "bg-transparent"
                          }
                          hover:bg-green-100/40 transition`}
            >
              <span className="flex items-center gap-3">
                <span className="font-medium text-slate-800">{idx + 1}.</span>
                <span className="font-medium text-slate-800">{c.name}</span>
              </span>

              <span className="rounded-full bg-slate-800/90 px-4 py-1 text-sm font-mono font-semibold text-white">
                {c.numMembers}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
