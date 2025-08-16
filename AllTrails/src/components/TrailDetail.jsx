// ---------------------------------------------------------------------------
// TrailDetail.jsx – rich trail page: fetch via REST + map + difficulty dist
// ---------------------------------------------------------------------------


import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";

import DifficultyDistPanel from "./DifficultyDistPanel";
import MonthlyHikesPanel from "./MonthlyHikesPanel";
import ReviewForm from "./ReviewForm";

import "leaflet/dist/leaflet.css";

export default function TrailDetail() {
  const { id } = useParams();
  const trailId = Number(id);
  const [trail, setTrail] = useState(null);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchTrail();
  }, [trailId]);

  // fetch trail
  const fetchTrail = () => {
    fetch(`http://localhost:3001/api/trails/${trailId}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => {
        setTrail(data);
        checkFavorite(data);
      })
      .catch((err) => {
        console.error("Error loading trail:", err);
        setError(err.message);
      });
  };

  const checkFavorite = (trailData) => {
    const saved = JSON.parse(localStorage.getItem("favoriteTrails")) || [];
    setIsFavorited(saved.some((t) => t.id === trailData.TrailID));
  };

  const toggleFavorite = () => {
    let saved = JSON.parse(localStorage.getItem("favoriteTrails")) || [];

    const trailInfo = {
      id: trail.TrailID,
      name: trail.Name,
      location: trail.Location || "Unknown",
      imageUrl:
        trail.ImageURL ||
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // fallback image
    };

    if (isFavorited) {
      saved = saved.filter((t) => t.id !== trail.TrailID);
    } else {
      saved.push(trailInfo);
    }

    localStorage.setItem("favoriteTrails", JSON.stringify(saved));
    setIsFavorited(!isFavorited);
  };

  if (error) return <p className="text-red-600 p-4">Error: {error}</p>;
  if (!trail) return <p className="text-center mt-10 text-slate-500">Loading trail…</p>;

  const coords = trail.GeoBoundary?.match(/-?\d+(?:\.\d+)?/g);
  const lat = coords?.[1] ? parseFloat(coords[1]) : 46.8182;
  const lng = coords?.[0] ? parseFloat(coords[0]) : 8.2275;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Heading + Favorite */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{trail.Name}</h1>
          <p className="text-slate-600 text-sm">Trail ID {trail.TrailID}</p>
        </div>
        <button
          onClick={toggleFavorite}
          className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorited ? (
            <SolidHeart className="w-6 h-6 text-red-500" />
          ) : (
            <OutlineHeart className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </header>
      {/* Map */}
      <MapContainer
        center={[lat, lng]}
        zoom={11}
        style={{ height: "300px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]}>
          <Popup>{trail.Name}</Popup>
        </Marker>
      </MapContainer>


      <DifficultyDistPanel trailId={trailId} />


      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <p><span className="font-semibold">Length:</span> {trail.Length2D?.toFixed(2)} mi</p>
        <p><span className="font-semibold">Uphill:</span> {trail.Uphill?.toFixed(0)} ft</p>
        <p><span className="font-semibold">Downhill:</span> {trail.Downhill?.toFixed(0)} ft</p>
        <p><span className="font-semibold">Min Elev:</span> {trail.MinElevation?.toFixed(0)} ft</p>
        <p><span className="font-semibold">Avg Rating:</span> {trail.AvgRating ? trail.AvgRating.toFixed(1) + " ★" : "N/A"}</p>
        <p><span className="font-semibold">Reviews:</span> {trail.NumReviews ?? "—"}</p>
      </div>

      {trail.gpx && (
        <a
          href={`data:application/gpx+xml;charset=utf-8,${encodeURIComponent(trail.gpx)}`}
          download={`${trail.Name || "trail"}.gpx`}
          className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download GPX
        </a>
      )}

      <hr className="border-t border-slate-300 my-8" />

      <ReviewForm trailId={trailId} onSubmitted={fetchTrail} />
 
    </div>
  );
}
