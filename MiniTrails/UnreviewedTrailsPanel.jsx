// ---------------------------------------------------------------------------
// UnreviewedTrailsPanel.jsx – Q10: trails with >3 hikes but 0 reviews
// ---------------------------------------------------------------------------
import { useUnreviewedTrails } from "../api/api";
import { Link } from "react-router-dom";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function UnreviewedTrailsPanel({ limit = 12 }) {
  const { data = [], isLoading, isError, error } = useUnreviewedTrails();
  const trails = data.slice(0, limit);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading trails…
      </div>
    );
  if (isError) return <p className="text-red-600 py-4">Error: {error.message}</p>;
  if (!trails.length) return <p className="text-slate-500 py-4">Every popular trail has at least one review!</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold px-2">Trails with 3+ Hikes and 0 Reviews</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trails.map((t) => (
          <Link
            key={t.trailId}
            to={`/trails/${t.trailId}`}
            className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium leading-tight line-clamp-2 mb-1">
              {t.name}
            </h3>
            <p className="text-sm text-slate-500">{t.numHikes} hikes</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
