// ---------------------------------------------------------------------------
// ClubLeaderboardPanel.jsx – wider card + larger margins
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";

export default function ClubLeaderboardPanel({ top = 10 }) {
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ------------------------------------------------------------- fetch data */
  useEffect(() => {
    fetch(`http://localhost:3001/api/clubs/leaderboard?top=${top}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load leaderboard");
        return res.json();
      })
      .then((data) => {
        setClubs(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [top]);

  /* ------------------------------------------------------------- UI states */
  if (isLoading)
    return (
      <p className="py-8 text-center text-sm text-slate-500 animate-pulse">
        Loading leaderboard…
      </p>
    );

  if (error)
    return (
      <p className="py-8 text-center text-sm text-red-600">
        Error: {error}
      </p>
    );

  if (!clubs.length)
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No club data available.
      </p>
    );

  /* ------------------------------------------------------------- helpers */
  const medal = (rank) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

  /* ------------------------------------------------------------- component */
  return (
    <section className="mx-auto my-10 max-w-3xl px-4 sm:px-8">
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-slate-200">
        {/* header */}
        <header className="flex items-left justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            🏆 Club Leaderboard
          </h2>
          <span className="text-xs text-green-700/80">Top&nbsp;{top}</span>
        </header>

        {/* list */}
        <ul className="divide-y divide-slate-100">
          {clubs.map((club, i) => (
            <li
              key={club.clubId}
              className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center px-8 py-4
                        ${
                          i % 2 ? "bg-green-50/25" : "bg-transparent"
                        } hover:bg-green-100/40 transition`}
            >
              {/* Rank / medal */}
              <span
                className={
                  "text-base font-bold " +
                  (i === 0
                    ? "text-amber-500"
                    : i === 1
                    ? "text-gray-500"
                    : i === 2
                    ? "text-yellow-700"
                    : "text-slate-600")
                }
              >
                {medal(i + 1)}
              </span>

              {/* Club name + members */}
              <div>
                <p className="font-medium text-slate-800">{club.clubName}</p>
                <p className="text-xs text-slate-500">
                  {club.numMembers}&nbsp;
                  {club.numMembers === 1 ? "member" : "members"}
                </p>
              </div>

              {/* Total distance */}
              <div className="text-right">
                <p className="font-semibold text-slate-700">
                  {club.totalDistance.toFixed(1)}
                  <span className="ml-1 text-xs text-slate-500">mi</span>
                </p>
                <p className="text-[10px] text-slate-400 tracking-wide">
                  total
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
