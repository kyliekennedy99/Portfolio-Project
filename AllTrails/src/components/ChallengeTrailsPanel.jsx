import { useChallengeTrails } from "../api/api";
import { Link } from "react-router-dom";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function ChallengeTrailsPanel({ minMiles = 10, minRating = 3.5, limit = 12 }) {

  const {
    data: apiData = [],
    isLoading,
    isError,
    error,
  } = useChallengeTrails({ minMiles, minRating });

  // Deduplicate by trail name (if backend didn’t already do this)
  const seenNames = new Set();
  const trails = (apiData ?? []).filter((t) => {
    const name = t.name?.trim();
    if (!name || seenNames.has(name)) return false;
    seenNames.add(name);
    return true;
  });

  if (isLoading)
    return (
      <p className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading challenge trails…
      </p>
    );
  if (isError)
    return (
      <p className="py-4 text-red-600">
        Error: {error?.message ?? "unknown error"}
      </p>
    );
  if (!trails.length)
    return (
      <p className="py-4 text-slate-500">
        No trails meet the criteria ({minMiles}+ mi, {minRating}★+).
      </p>
    );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        🏔️ Challenge Trails
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trails.map((t) => {
          const miles = t?.lengthMiles != null ? Number(t.lengthMiles).toFixed(1) : "—";
          const rating = t?.avgRating != null ? Number(t.avgRating).toFixed(1) : "—";

          return (
            <Link
              key={t.trailId ?? `${t.name}-${miles}`}
              to={`/trails/${t.trailId ?? ""}`}
              className="block rounded-xl border bg-white p-4 transition-shadow hover:shadow-lg shadow-sm"
            >
              <h3 className="mb-1 line-clamp-2 font-semibold leading-tight text-gray-800">
                {t.name ?? "Untitled trail"}
              </h3>
              <p className="text-sm text-gray-500">
                <span className="inline-block text-green-600 font-medium">
                  {miles} mi
                </span>{" "}
                ·{" "}
                <span className="text-yellow-600 font-medium">
                  {rating} ★
                </span>
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

