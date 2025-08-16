import { useState, useEffect, useMemo } from "react";
import L from "leaflet";
import TrailCard from "./TrailCard";
import MapView from "./MapView";
import RecommendationsPanel from "./RecommendationsPanel";
import TopRatedCarousel from "./TopRatedPanel";
import ChallengeTrailsPanel from "./ChallengeTrailsPanel";
import ClubSizesPanel from "./ClubSizesPanel"; // (kept import in case you use it)
import SteepTrailsPanel from "./SteepTrailsPanel";
import UnreviewedTrailsPanel from "./UnreviewedTrailsPanel";
import ClubLeaderboardPanel from "./ClubLeaderboardPanel"; // (kept import)
import MonthlyTrailStatsPanel from "./MonthlyTrailStatsPanel";
import MonthlyHikesPanel from "./MonthlyHikesPanel";
import UsersNoReviewsPanel from "./UsersNoReviewsPanel"; // (kept import)

export default function TrailsPage({ currentUser }) {
  const [trails, setTrails] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [showAllMarkers, setShowAllMarkers] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);

  const trailsPerPage = 12;

  // derive a robust userId for recommendations
  const derivedUserId =
    currentUser?.id ??
    currentUser?.userId ??
    currentUser?.UserID ??
    currentUser?.ID ??
    null;

  useEffect(() => {
    fetch("http://localhost:3001/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);
console.log("currentUser:", currentUser);

  const filteredTrails = useMemo(() => {
    return trails
      .filter((t) =>
        t.Name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((t) =>
        difficultyFilter ? t.Rating?.toString() === difficultyFilter : true
      )
      .sort((a, b) => {
        switch (sortOption) {
          case "length":
            return b.Length2D - a.Length2D;
          case "elevation":
            return (b.Uphill || 0) - (a.Uphill || 0);
          case "name":
          default:
            return a.Name.localeCompare(b.Name);
        }
      });
  }, [trails, searchTerm, difficultyFilter, sortOption]);

  const boundsFilteredTrails = useMemo(() => {
    if (!mapBounds) return filteredTrails;
    return filteredTrails.filter((trail) => {
      if (!trail.GeoBoundary) return false;
      const coords = trail.GeoBoundary.match(/-?\d+(?:\.\d+)?/g);
      const lat = coords?.[1] ? parseFloat(coords[1]) : null;
      const lng = coords?.[0] ? parseFloat(coords[0]) : null;
      if (lat == null || lng == null) return false;
      return mapBounds.contains(L.latLng(lat, lng));
    });
  }, [filteredTrails, mapBounds]);

  const totalPages = Math.ceil(boundsFilteredTrails.length / trailsPerPage);

  const currentTrails = useMemo(() => {
    const indexOfLast = page * trailsPerPage;
    const indexOfFirst = indexOfLast - trailsPerPage;
    return boundsFilteredTrails.slice(indexOfFirst, indexOfLast);
  }, [boundsFilteredTrails, page]);
  

  return (
    <div className="space-y-12 px-4 py-10 max-w-screen-xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Explore Trails</h1>

        <section className="flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center">
          <input
            type="text"
            placeholder="Search by name…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border px-4 py-2 rounded-lg w-full sm:w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setPage(1);
            }}
            className="border px-4 py-2 rounded-lg shadow-sm"
          >
            <option value="">All Difficulties</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                ★ {n}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border px-4 py-2 rounded-lg shadow-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="length">Sort by Length</option>
            <option value="elevation">Sort by Uphill</option>
          </select>

          <button
            onClick={() => setShowAllMarkers((prev) => !prev)}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
          >
            {showAllMarkers ? "Show Only Visible Markers" : "Show All Markers"}
          </button>
        </section>
      </div>

      <MapView
        trails={boundsFilteredTrails}
        onBoundsChange={setMapBounds}
        showAll={showAllMarkers}
      />

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentTrails.map((trail) => (
          <TrailCard key={trail.TrailID} trail={trail} />
        ))}
      </section>

      <div className="flex justify-center gap-3 items-center pt-8 border-t border-gray-300 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <section className="bg-emerald-50 p-6 rounded-lg shadow-sm">
  <RecommendationsPanel userId={derivedUserId ?? 1} topN={6} />
  {!derivedUserId && (
    <p className="mt-2 text-sm text-slate-600">
      Showing demo recommendations (no logged-in user detected).
    </p>
  )}
</section>


      <div className="space-y-8 mt-12">
        <section className="bg-green-50 p-6 rounded-lg shadow-sm">
          <MonthlyTrailStatsPanel />
        </section>

        <section className="bg-blue-50 p-6 rounded-lg shadow-sm">
          <TopRatedCarousel minReviews={5} limit={8} />
        </section>

        <section className="bg-purple-50 p-6 rounded-lg shadow-sm">
          <ChallengeTrailsPanel minMiles={10} minRating={3.5} limit={8} />
        </section>

        <section className="bg-pink-50 p-6 rounded-lg shadow-sm">
          <UnreviewedTrailsPanel limit={12} />
        </section>

        <section className="bg-orange-50 p-6 rounded-lg shadow-sm">
          <SteepTrailsPanel limit={8} />
        </section>

        <section className="bg-green-100 p-6 rounded-lg shadow-sm">
          <MonthlyHikesPanel limit={5} />
        </section>
      </div>
    </div>
  );
}
