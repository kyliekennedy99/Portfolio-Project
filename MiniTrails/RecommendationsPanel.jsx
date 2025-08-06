// ---------------------------------------------------------------------------
// RecommendationsPanel.jsx  –  robust key & defensive formatting
// ---------------------------------------------------------------------------
import { Link } from "react-router-dom";
import { useRecommendations } from "../api/api";

const Spinner = () => (
  <div className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
);

export default function RecommendationsPanel({ userId, topN = 5 }) {
  // ───────────────────────────────────────────────────────────────────────────
  // 1. Fetch raw data
  // ───────────────────────────────────────────────────────────────────────────
  const {
    data: rawRecs = [],
    isLoading,
    isError,
    error,
  } = useRecommendations(userId, topN);

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Normalise field names → { trailId, name, avgRating }
  //    (API currently returns TrailID / Name / AvgRating)
  // ───────────────────────────────────────────────────────────────────────────
  const recs = rawRecs.map((r) => ({
    trailId:   r.trailId   ?? r.TrailID,
    name:      r.name      ?? r.Name,
    avgRating: r.avgRating ?? r.AvgRating,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Loading / error / empty states
  // ───────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500">
        <Spinner /> Loading recommendations…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-4 py-4 text-red-600">Error: {error.message}</p>
    );
  }

  if (!recs.length) {
    return (
      <p className="px-4 py-4 text-slate-500">
        No recommendations yet. Log a hike to get personalized suggestions!
      </p>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Deduplicate so keys are unique even if API repeats a trail
  // ───────────────────────────────────────────────────────────────────────────
  const uniqueRecs = [];
  const seen = new Set();
  for (const r of recs) {
    const id = r.trailId ?? r.name; // fallback if id missing
    if (!seen.has(id)) {
      seen.add(id);
      uniqueRecs.push(r);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Render
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <section className="space-y-4">
      <h2 className="px-2 text-xl font-semibold">Recommended Trails</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {uniqueRecs.map((trail, idx) => {
          const key = trail.trailId ?? `${trail.name}-${idx}`;
          const rating =
            trail.avgRating != null
              ? Number(trail.avgRating).toFixed(1)
              : "N/A";

          return (
            <Link
              key={key}
              to={`/trails/${trail.trailId ?? ""}`}
              className="block h-full rounded-lg border p-4 transition-shadow hover:shadow-lg"
            >
              <h3 className="line-clamp-2 font-medium leading-tight">
                {trail.name ?? "Untitled trail"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Avg rating: {rating} ★
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
