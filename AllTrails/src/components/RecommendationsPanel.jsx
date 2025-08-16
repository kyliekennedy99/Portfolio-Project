// ---------------------------------------------------------------------------
// RecommendationsPanel.jsx – polished cards + consistent layout
// ---------------------------------------------------------------------------
import { Link } from "react-router-dom";
import { useRecommendations } from "../api/api";

const Spinner = () => (
  <span
    role="status"
    aria-live="polite"
    className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent"
  />
);

export default function RecommendationsPanel({ userId, topN = 5 }) {
  const {
    data: rawRecs,
    isLoading,
    isError,
    error,
  } = useRecommendations(userId, topN);

  // normalize + null-guard
  const recs = Array.isArray(rawRecs)
    ? rawRecs.map((r) => {
        const trailId =
          r.trailId ?? r.TrailID ?? null; // number or string
        const name = r.name ?? r.Name ?? null;
        const avg =
          r.avgRating ?? r.AvgRating ?? null;

        // safe number formatting (avoid NaN)
        let avgRating = null;
        if (avg !== null && avg !== undefined) {
          const n = Number(avg);
          avgRating = Number.isFinite(n) ? n : null;
        }

        return { trailId, name, avgRating };
      })
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500">
        <Spinner /> Loading recommendations…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-4 py-4 text-red-600">
        Error: {error?.message || "Failed to load"}
      </p>
    );
  }

  if (!recs.length) {
    return (
      <p className="px-4 py-4 text-slate-500">
        No recommendations yet. Log a hike to get personalized suggestions!
      </p>
    );
  }

  // dedupe by stable key (prefer trailId, else lowercase name)
  const seen = new Set();
  const unique = [];
  for (const r of recs) {
    const key =
      r.trailId != null
        ? `id:${String(r.trailId)}`
        : r.name
        ? `name:${r.name.toLowerCase().trim()}`
        : null;
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        🌟 Recommended Trails
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {unique.map((trail, idx) => {
          const stableKey =
            trail.trailId != null
              ? `trail-${trail.trailId}`
              : `trail-name-${(trail.name || "untitled")
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-${idx}`;

          const ratingText =
            trail.avgRating != null
              ? trail.avgRating.toFixed(1)
              : null;

          const CardInner = (
            <div className="h-full flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg">
              <h3 className="mb-2 line-clamp-2 font-semibold leading-snug text-gray-800">
                {trail.name ?? "Untitled trail"}
              </h3>

              <div className="mt-auto">
                {ratingText !== null ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <span aria-hidden>★</span> {ratingText}
                    <span className="sr-only">average rating</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    No ratings
                  </span>
                )}
              </div>
            </div>
          );

          return trail.trailId ? (
            <Link
              key={stableKey}
              to={`/trails/${trail.trailId}`}
              className="h-full block"
            >
              {CardInner}
            </Link>
          ) : (
            <div key={stableKey} className="h-full">
              {CardInner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
