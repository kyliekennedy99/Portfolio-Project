import { useState, useEffect, useMemo } from 'react';
import TrailCard from './TrailCard';
import MapView from './MapView';
import L from 'leaflet';

export default function TrailList() {
  const [trails, setTrails] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [showAllMarkers, setShowAllMarkers] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);

  const trailsPerPage = 12;

  useEffect(() => {
    fetch('http://localhost:3001/api/trails')
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error('Error fetching trails:', err));
  }, []);

  const filteredTrails = useMemo(() => {
    return trails
      .filter((trail) => trail.Name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((trail) =>
        difficultyFilter ? trail.Rating?.toString() === difficultyFilter : true
      )
      .sort((a, b) => {
        switch (sortOption) {
          case 'length':
            return b.Length2D - a.Length2D;
          case 'elevation':
            return (b.Uphill || 0) - (a.Uphill || 0);
          case 'name':
          default:
            return a.Name.localeCompare(b.Name);
        }
      });
  }, [trails, searchTerm, difficultyFilter, sortOption]);

  const boundsFilteredTrails = useMemo(() => {
    if (!mapBounds) return filteredTrails;
    return filteredTrails.filter((trail) => {
      if (!trail.GeoBoundary) return false;
      const coords = trail.GeoBoundary.match(/-?\d+(\.\d+)?/g);
      const lat = coords?.[1] ? parseFloat(coords[1]) : null;
      const lng = coords?.[0] ? parseFloat(coords[0]) : null;
      if (!lat || !lng) return false;
      return mapBounds.contains(L.latLng(lat, lng));
    });
  }, [filteredTrails, mapBounds]);

  const totalPages = Math.ceil(boundsFilteredTrails.length / trailsPerPage);

  const currentTrails = useMemo(() => {
    const indexOfLastTrail = page * trailsPerPage;
    const indexOfFirstTrail = indexOfLastTrail - trailsPerPage;
    return boundsFilteredTrails.slice(indexOfFirstTrail, indexOfLastTrail);
  }, [boundsFilteredTrails, page]);

  return (
    <div className="space-y-8 px-4 py-6 max-w-screen-xl mx-auto">
      <section className="flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        />

        <select
          value={difficultyFilter}
          onChange={(e) => {
            setDifficultyFilter(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Difficulties</option>
          <option value="1">★ 1</option>
          <option value="2">★ 2</option>
          <option value="3">★ 3</option>
          <option value="4">★ 4</option>
          <option value="5">★ 5</option>
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="name">Sort by Name</option>
          <option value="length">Sort by Length</option>
          <option value="elevation">Sort by Uphill</option>
        </select>

        <button
          onClick={() => setShowAllMarkers(prev => !prev)}
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          {showAllMarkers ? 'Show Only Visible Markers' : 'Show All Markers'}
        </button>
      </section>

      <section>
        <MapView trails={showAllMarkers ? filteredTrails : currentTrails} setMapBounds={setMapBounds} />
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentTrails.map((trail) => (
          <TrailCard key={trail.TrailID} trail={trail} />
        ))}
      </section>

      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-2 text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}