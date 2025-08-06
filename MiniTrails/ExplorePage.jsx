import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, UsersIcon } from "@heroicons/react/24/outline";
import TrailCard from "./TrailCard";
import MapView from "./MapView";
import RecommendationsPanel from "./RecommendationsPanel";
import TopHikersPanel from "./TopHikersPanel";
import TopRatedCarousel from "./TopRatedPanel";
import ChallengeTrailsPanel from "./ChallengeTrailsPanel";
import ClubSizesPanel from "./ClubSizesPanel";
import SteepTrailsPanel from "./SteepTrailsPanel";
import UnreviewedTrailsPanel from "./UnreviewedTrailsPanel";
import ClubLeaderboardPanel from "./ClubLeaderboardPanel";
import MonthlyTrailStatsPanel from "./MonthlyTrailStatsPanel";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState([]);
  const [hikers, setHikers] = useState([]);

  useEffect(() => {
    // Simulated data
    setClubs([
      {
        id: 1,
        name: "Madison Hiking Club",
        location: "Madison, WI",
        members: 24,
        imageUrl: "https://images.unsplash.com/photo-1520962912092-2d6bd7690f1f",
      },
      {
        id: 2,
        name: "Trail Seekers",
        location: "Milwaukee, WI",
        members: 40,
        imageUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
      },
    ]);

    setHikers([
      {
        id: 1,
        name: "Emily R.",
        location: "Madison, WI",
        experience: "Intermediate",
        photo: "https://randomuser.me/api/portraits/women/68.jpg",
      },
      {
        id: 2,
        name: "Alex J.",
        location: "Verona, WI",
        experience: "Advanced",
        photo: "https://randomuser.me/api/portraits/men/52.jpg",
      },
    ]);
  }, []);

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHikers = hikers.filter((hiker) =>
    hiker.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Explore the Community</h1>
      <p className="text-gray-500 mb-6">
        Find local hiking clubs and connect with fellow hikers near you.
      </p>

      {/* Search bar */}
      <div className="relative max-w-md mb-8">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute top-2.5 left-3" />
        <input
          type="text"
          placeholder="Search clubs or hikers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Clubs */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Hiking Clubs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={club.imageUrl}
                alt={club.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{club.name}</h3>
                <p className="text-sm text-gray-500">{club.location}</p>
                <div className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {club.members} members
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <ClubLeaderboardPanel top={5} />
      <ClubSizesPanel limit={10} />
      {/* Hikers */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Hikers Near You</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHikers.map((hiker) => (
            <div
              key={hiker.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 flex items-center gap-4"
            >
              <img
                src={hiker.photo}
                alt={hiker.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{hiker.name}</h3>
                <p className="text-sm text-gray-500">{hiker.location}</p>
                <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded mt-1 inline-block">
                  {hiker.experience}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
