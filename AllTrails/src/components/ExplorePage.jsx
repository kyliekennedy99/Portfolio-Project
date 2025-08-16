import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, UsersIcon } from "@heroicons/react/24/outline";
import ClubSizesPanel from "./ClubSizesPanel";
import ClubLeaderboardPanel from "./ClubLeaderboardPanel";
import HikingBuddiesPanel from "./HikingBuddiesPanel";
import TopHikersPanel from "./TopHikersPanel";
import UsersNoReviewsPanel from "./UsersNoReviewsPanel";




import ClubListPanel from "./ClubListPanel";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState([]);
  const [hikers, setHikers] = useState([]);

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
      <div className="relative max-w-md mb-10">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute top-2.5 left-3" />
        <input
          type="text"
          placeholder="Search clubs or hikers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Club panels */}
      <ClubListPanel />
      
<div className="my-12 space-y-6">
  {/* Section Title */}
  <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
    🏕️ Club Stats
  </h2>

  {/* Two-panel layout */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
     <div className="w-full scale-[1.1]">
    <ClubLeaderboardPanel top={5} />
  </div>
  <div className="w-full scale-[1.1]">
    <ClubSizesPanel limit={5} />
  </div>
  </div>
</div>
<h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
    🏕️ Buddy Stats
  </h2>
      <HikingBuddiesPanel limit={5}/>
    <TopHikersPanel limit={8} />
    <UsersNoReviewsPanel limit={5} />

    </div>
  );
}
