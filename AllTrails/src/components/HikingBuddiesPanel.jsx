import { useHikingBuddies } from "../api/api";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function HikingBuddiesPanel({ limit = 20 }) {
  const { data = [], isLoading, isError, error } = useHikingBuddies();
  const rows = data.slice(0, limit);

  if (isLoading)
    return (
      <p className="py-8 text-center text-sm text-slate-500 animate-pulse">
        Loading hiking buddies…
      </p>
    );

  if (isError)
    return (
      <p className="py-8 text-center text-sm text-red-600">
        Error: {error.message}
      </p>
    );

  if (!rows.length)
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No shared hikes found.
      </p>
    );

  return (
    <section className="mx-auto my-10 max-w-12xl px-4 sm:px-0">
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-slate-200">
        {/* header */}
        <header className="flex items-left justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            🥾 Hiking Buddies
          </h2>
          <span className="text-xs text-green-700/80">Top {limit}</span>
        </header>

        {/* list */}
        <ul className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <li
              key={`${r.hikerA}-${r.hikerB}-${i}`}
              className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center px-8 py-4
                ${i % 2 ? "bg-green-50/25" : "bg-transparent"}
                hover:bg-green-100/40 transition`}
            >
              {/* Rank */}
              <span className="font-mono font-bold text-slate-500 w-5">
                #{i + 1}
              </span>

              {/* Hiker pair */}
              <div>
                <p className="font-medium text-slate-800">
                  {r.hikerA} <span className="text-slate-400">+</span> {r.hikerB}
                </p>
                <p className="text-xs text-slate-500">
                  {r.sharedHikes} {r.sharedHikes === 1 ? "hike" : "hikes"} together
                </p>
              </div>

              {/* Hike count summary */}
              <div className="text-right">
                <p className="font-semibold text-slate-700">{r.sharedHikes}</p>
                <p className="text-[10px] text-slate-400 tracking-wide">shared</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
