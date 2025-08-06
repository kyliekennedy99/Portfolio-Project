// ---------------------------------------------------------------------------
// TopHikersPanel.jsx – leaderboard for Q3 (most‑active hikers)
// ---------------------------------------------------------------------------
// Shows top N hikers by cumulative 3‑D distance.
// ---------------------------------------------------------------------------

import { useTopHikers } from "../api/api";

function Spinner() {
  return <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />;
}

export default function TopHikersPanel({ limit = 10 }) {
  const { data = [], isLoading, isError, error } = useTopHikers();
  const top = data.slice(0, limit);

  if (isLoading)
    return <p className="flex items-center gap-2 py-4 text-slate-500"><Spinner /> Loading hikers…</p>;
  if (isError)
    return <p className="text-red-600 py-4">Error: {error.message}</p>;
  if (!top.length)
    return <p className="text-slate-500 py-4">No hike data yet.</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">🥇 Most‑Active Hikers</h2>
      <ol className="divide-y border rounded-xl bg-white overflow-hidden">
        {top.map((hiker, idx) => (
          <li key={hiker.userId} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50">
            <span className="font-medium text-gray-700">
              #{idx + 1} {hiker.name}
            </span>
            <span className="font-mono text-blue-700">{(hiker.totalDistance / 1000).toFixed(1)} km</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
