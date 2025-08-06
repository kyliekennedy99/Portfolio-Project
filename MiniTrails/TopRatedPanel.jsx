import { useTopRated } from "../api/api";
import { Link } from "react-router-dom";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function TopRatedCarousel({ minReviews = 5, limit = 12 }) {
  const { data = [], isLoading, isError, error } = useTopRated(minReviews);
  const trails = data.slice(0, limit);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-slate-500">
        <Spinner /> Loading top‑rated trails…
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-600 py-4">Error: {error.message}</p>;
  }

  if (!trails.length) {
    return (
      <p className="text-slate-500 py-4">
        No trails meet the ≥ {minReviews} reviews requirement yet.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold px-2">Top‑Rated Trails</h2>
      <div className="overflow-x-auto">
        <div
          className="flex gap-4 px-2 pb-4 snap-x snap-mandatory"
          style={{ scrollPaddingInline: "1rem" }}
        >
          {trails.map((t) => (
            <Link
              key={t.trailId}
              to={`/trails/${t.trailId}`}
              className="snap-start shrink-0 w-64 bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-4"
            >
              <h3 className="font-semibold text-gray-800 leading-tight line-clamp-2 mb-2">
                {t.name}
              </h3>
              <p className="text-sm text-gray-500">
                <strong>{Number(t.avgRating).toFixed(1)} ★</strong> · {t.numReviews} reviews
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
