import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("favoriteTrails");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-500">You haven’t favorited any trails yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((trail) => (
            <Link
              to={`/trail/${trail.id}`}
              key={trail.id}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={trail.imageUrl}
                alt={trail.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{trail.name}</h2>
                <p className="text-sm text-gray-500">{trail.location}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
