// ---------------------------------------------------------------------------
// SteepTrailsPanel.jsx – Q8: uphill-per-metre ranking
// ---------------------------------------------------------------------------
import { useSteepTrails } from "../api/api";
import { Link } from "react-router-dom";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function SteepTrailsPanel({ limit = 12 }) {
  const { data = [], isLoading, isError, error } = useSteepTrails();
  const trails = data.slice(0, limit);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading steep trails…
      </div>
    );
  if (isError)
    return <p className="text-red-600 py-4">Error: {error.message}</p>;
  if (!trails.length)
    return <p className="text-slate-500 py-4">No trail data.</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">🔺 Steepest Trails (gain / m)
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trails.map((t) => (
          <Link
            key={t.trailId}
            to={`/trails/${t.trailId}`}
            className="block border rounded-xl bg-white p-4 shadow-sm hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold leading-snug text-gray-800 line-clamp-2 mb-1">
              {t.name || "Untitled trail"}
            </h3>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-rose-600">
                {(t.gainPerMeter * 100).toFixed(1)}%
              </span>{" "}
              average grade
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
