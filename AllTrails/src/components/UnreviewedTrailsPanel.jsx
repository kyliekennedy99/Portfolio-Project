// MostReviewedTrailsPanel.jsx
import { useMostReviewedTrails } from "../api/api";
import { Link } from "react-router-dom";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function MostReviewedTrailsPanel({ limit = 12 }) {
  const { data, isLoading, isError, error } = useMostReviewedTrails();
  const trails = Array.isArray(data) ? data.slice(0, limit) : [];

  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading trails…
      </div>
    );

  if (isError)
    return (
      <p className="text-red-600 py-4">
        Error: {error?.message || "Failed to load"}
      </p>
    );

  if (!trails.length)
    return <p className="text-slate-500 py-4">No review data yet.</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        ⭐ Most-Reviewed Trails
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trails.map((t, i) => {
          const trailId = t.trailId ?? t.TrailID ?? null;
          const name = t.name ?? t.Name ?? "Untitled trail";
          const numReviews = t.numReviews ?? t.NumReviews ?? 0;
          const avgRating = t.avgRating ?? t.AvgRating;

          const card = (
            <div className="h-full flex flex-col justify-between border rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition-shadow min-h-[110px]">
              <h3 className="font-semibold leading-snug text-gray-800 line-clamp-2 mb-1">
                {name}
              </h3>
              <p className="text-xs text-gray-500 mt-auto">
                <span className="font-mono font-semibold text-emerald-700">
                  {numReviews}
                </span>{" "}
                review{numReviews === 1 ? "" : "s"}
                {typeof avgRating === "number" && (
                  <>
                    {" · "}avg{" "}
                    <span className="font-mono">
                      {Number(avgRating).toFixed(2)}
                    </span>
                  </>
                )}
              </p>
            </div>
          );

          return trailId ? (
            <Link key={trailId} to={`/trails/${trailId}`} className="h-full">
              {card}
            </Link>
          ) : (
            <div key={`${name}-${i}`} className="h-full">
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
}
