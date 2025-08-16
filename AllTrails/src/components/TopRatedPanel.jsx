import { useTopRated } from "../api/api";
import { Link } from "react-router-dom";

function Spinner() {
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent"
    />
  );
}

export default function TopRatedCarousel({ minReviews = 5, limit = 12 }) {
  const { data = [], isLoading, isError, error } = useTopRated(minReviews);

  // normalize + slice
  const trails = (Array.isArray(data) ? data : [])
    .map((t) => ({
      trailId: t.trailId ?? t.TrailID ?? t.id ?? null,
      name: t.name ?? t.Name ?? "Untitled trail",
      avgRating:
        t.avgRating != null
          ? Number(t.avgRating)
          : t.AvgRating != null
          ? Number(t.AvgRating)
          : null,
      numReviews: t.numReviews ?? t.NumReviews ?? t.reviewCount ?? 0,
    }))
    .slice(0, limit);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-slate-500">
        <Spinner /> Loading top‑rated trails…
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

  if (!trails.length) {
    return (
      <p className="px-4 py-4 text-slate-500">
        No trails meet the ≥ {minReviews} reviews requirement yet.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        ⭐ Top‑Rated Trails
      </h2>

      <div
        className="overflow-x-auto -mx-2 px-2"
        aria-label="Top‑rated trails carousel"
      >
        <div className="flex gap-4 pb-2 snap-x snap-mandatory">
          {trails.map((t, idx) => {
            const key =
              t.trailId != null
                ? `top-${t.trailId}`
                : `top-${t.name.toLowerCase().replace(/\s+/g, "-")}-${idx}`;

            const ratingText =
              t.avgRating != null && Number.isFinite(t.avgRating)
                ? t.avgRating.toFixed(1)
                : null;

            const CardInner = (
              <div className="h-full flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg w-64">
                <h3 className="font-semibold text-gray-800 leading-tight line-clamp-2 mb-2">
                  {t.name}
                </h3>

                <div className="mt-auto flex items-center justify-between">
                  {ratingText ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <span aria-hidden>★</span> {ratingText}
                      <span className="sr-only">average rating</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      No ratings
                    </span>
                  )}

                  <span className="text-xs text-slate-600">
                    {t.numReviews ?? 0} reviews
                  </span>
                </div>
              </div>
            );

            return t.trailId ? (
              <Link
                key={key}
                to={`/trails/${t.trailId}`}
                className="snap-start shrink-0"
              >
                {CardInner}
              </Link>
            ) : (
              <div key={key} className="snap-start shrink-0">
                {CardInner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
