// ---------------------------------------------------------------------------
// RecommendationsPanel.jsx – location-aware recommendations (robust)
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecommendations } from "../api/api";

const Spinner = () => (
  <span
    role="status"
    aria-live="polite"
    className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent"
  />
);

export default function RecommendationsPanel({
  userId,
  topN = 5,
  radiusKm = 50,
  minReviews = 3,
}) {
  const [coords, setCoords] = useState(null);      // { lat, lng } | null
  const [locTried, setLocTried] = useState(false); // attempted geolocation?

  // Get the user's location on mount
  useEffect(() => {
    let cancelled = false;
    if (!navigator.geolocation) {
      setLocTried(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocTried(true);
      },
      () => {
        if (cancelled) return;
        setCoords(null); // proceed without coords
        setLocTried(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );

    return () => { cancelled = true; };
  }, []);

  // While verifying: widen radius & allow zero reviews
  const effectiveRadiusKm = Math.max(radiusKm ?? 0, 30000);
  const effectiveMinReviews = 0;

  const hasCoords = coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng);

  // Only enable the query when we actually have coords
  const {
    data: rawRecs = [],
    isLoading,
    isError,
    error,
  } = useRecommendations(userId, topN, hasCoords ? {
    lat: coords.lat,
    lng: coords.lng,
    radiusKm: effectiveRadiusKm,
    minReviews: effectiveMinReviews,
  } : undefined);

  // Normalize
  const recs = Array.isArray(rawRecs)
    ? rawRecs.map((r) => {
        const trailId = r.trailId ?? r.TrailID ?? null;
        const name = r.name ?? r.Name ?? null;

        const avgNum = Number(r.avgRating ?? r.AvgRating);
        const avgRating = Number.isFinite(avgNum) ? avgNum : null;

        const kmNum = Number(r.kmAway ?? r.KmAway ?? r.km);
        const kmAway = Number.isFinite(kmNum) ? kmNum : null;

        return { trailId, name, avgRating, kmAway };
      })
    : [];

  // UI states

  // 1) We haven't even tried or are waiting for geolocation: show waiting
  if (!locTried && !hasCoords) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500">
        <Spinner /> Waiting for location…
      </div>
    );
  }

  // 2) We tried but user denied / unavailable: prompt instead of showing "No recommendations"
  if (locTried && !hasCoords) {
    return (
      <div className="px-4 py-4 text-slate-600">
        We couldn't access your location. Please allow location in your browser and refresh.
      </div>
    );
  }

  // 3) We have coords and the query is running
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500">
        <Spinner /> Loading recommendations…
      </div>
    );
  }

  // 4) Error from API
  if (isError) {
    return (
      <p className="px-4 py-4 text-red-600">
        Error: {error?.message || "Failed to load"}
      </p>
    );
  }

  // 5) We had coords, query ran, but nothing came back
  if (hasCoords && !recs.length) {
    return (
      <p className="px-4 py-4 text-slate-500">
        No nearby trails matched the filters. Try enlarging the radius or lowering the reviews threshold.
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
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          🌟 Recommended Trails
        </h2>
        <span className="text-xs text-slate-500">
          Based on your location (within ~{effectiveRadiusKm} km)
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {unique.map((trail, idx) => {
          const stableKey =
            trail.trailId != null
              ? `trail-${trail.trailId}`
              : `trail-name-${(trail.name || "untitled")
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-${idx}`;

          const ratingText =
            trail.avgRating != null ? trail.avgRating.toFixed(1) : null;

          const distanceText =
            trail.kmAway != null ? `${trail.kmAway.toFixed(1)} km` : null;

          const CardInner = (
            <div className="h-full flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg">
              <h3 className="mb-2 line-clamp-2 font-semibold leading-snug text-gray-800">
                {trail.name ?? "Untitled trail"}
              </h3>

              <div className="mt-auto flex items-center gap-2 flex-wrap">
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

                {distanceText && (
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                    {distanceText}
                  </span>
                )}
              </div>
            </div>
          );

          return trail.trailId ? (
            <Link key={stableKey} to={`/trails/${trail.trailId}`} className="h-full block">
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
