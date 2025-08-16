import { useClubSizes } from "../api/api";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function ClubSizesPanel({ limit = 10 }) {
  const { data = [], isLoading, isError, error } = useClubSizes();
  const top = data.slice(0, limit);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Spinner />
        Loading clubs…
      </div>
    );

  if (isError)
    return (
      <p className="py-8 text-center text-red-600">Error: {error.message}</p>
    );

  if (!top.length)
    return (
      <p className="py-8 text-center text-slate-500">No club data yet.</p>
    );

  // Medal-style rank display
  const medal = (rank) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

  return (
    <section className="mx-auto my-10 max-w-3xl px-4 sm:px-8">
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-slate-200">
        {/* header */}
        <header className="flex items-left justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            🌲 Largest Hiking Clubs
          </h2>
          <span className="text-xs text-green-700/80">Top&nbsp;{limit}</span>
        </header>

        {/* list */}
        <ul className="divide-y divide-slate-100">
          {top.map((club, i) => (
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

              {/* Club name */}
              <div>
                <p className="font-medium text-slate-800">{club.name}</p>
                <p className="text-xs text-slate-500">Club ID: {club.clubId}</p>
              </div>

              {/* Member count */}
              <div className="text-right">
                <p className="font-semibold text-slate-700">
                  {club.numMembers}
                </p>
                <p className="text-[10px] text-slate-400 tracking-wide">
                  members
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
