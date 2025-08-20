import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";

export default function TrailCard({ trail, isHovered = false }) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favoriteTrails")) || [];
    setIsFavorited(saved.some((t) => t.id === trail.TrailID));
  }, [trail.TrailID]);

  const toggleFavorite = (e) => {
    e.preventDefault();

    let saved = JSON.parse(localStorage.getItem("favoriteTrails")) || [];
    const trailInfo = {
      id: trail.TrailID,
      name: trail.Name?.trim() || `Trail #${trail.TrailID}`,
    };

    if (isFavorited) {
      saved = saved.filter((t) => t.id !== trail.TrailID);
    } else {
      saved.push(trailInfo);
    }

    localStorage.setItem("favoriteTrails", JSON.stringify(saved));
    setIsFavorited(!isFavorited);
  };

  return (
    <Link
      to={`/trails/${trail.TrailID}`}
      className={`group block rounded-xl transition overflow-hidden relative bg-white 
        ${isHovered ? "ring-2 ring-emerald-400 shadow-lg" : "shadow"}`}
    >
      <div className="p-4 h-40 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800 leading-snug">
            {trail.Name?.trim() || `Trail #${trail.TrailID}`}
          </h2>
          <button
            onClick={toggleFavorite}
            className="p-1 rounded-full hover:bg-gray-100 transition"
            title={isFavorited ? "Unfavorite" : "Favorite"}
          >
            {isFavorited ? (
              <SolidHeart className="w-5 h-5 text-red-500" />
            ) : (
              <OutlineHeart className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        <ul className="text-sm mt-2 space-y-1 text-gray-600">
          <li>
            <strong>Length:</strong> {trail.Length2D?.toFixed(2) ?? "?"} mi
          </li>
          <li>
            <strong>Uphill:</strong> {trail.Uphill?.toFixed(0) ?? "?"} ft
          </li>
          <li>
            <strong>Downhill:</strong> {trail.Downhill?.toFixed(0) ?? "?"} ft
          </li>
        </ul>
      </div>
    </Link>
  );
}
