import { useUsersWithoutReviews } from "../api/api";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function UsersNoReviewsPanel({ limit = 20 }) {
  const { data = [], isLoading, isError, error } = useUsersWithoutReviews();

  // slice & compute max for progress bars
  const users = (data ?? []).slice(0, limit);
  const maxReviews = Math.max(1, ...users.map(u => u.numReviews ?? 0));

  if (isLoading)
    return (
      <p className="py-8 text-center text-sm text-slate-500 animate-pulse">
        Loading users…
      </p>
    );

  if (isError)
    return (
      <p className="py-8 text-center text-sm text-red-600">
        Error: {error?.message || "Failed to load"}
      </p>
    );

  if (!users.length)
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No users to display.
      </p>
    );

  const medal = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`);

  return (
    <section className="mx-auto my-10 max-w-12xl px-4 sm:px-0">
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-slate-200">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            ⭐ Top Reviewers
          </h2>
          <span className="text-xs text-green-700/80">Top {limit}</span>
        </header>

        {/* List */}
        <ul className="divide-y divide-slate-100">
          {users.map((u, i) => {
            const reviews = u.numReviews ?? 0;
            const trails = u.distinctTrailsReviewed ?? null; // optional
            const avg = u.avgRating ?? null;                 // optional
            const pct = Math.round((reviews / maxReviews) * 100);

            return (
              <li
                key={u.userId ?? u.UserID ?? i}
                className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-8 py-4
                            ${i % 2 ? "bg-green-50/25" : "bg-transparent"}
                            hover:bg-green-100/40 transition`}
              >
                {/* Rank / medal */}
                <span
                  className={
                    "min-w-10 text-base font-bold " +
                    (i === 0
                      ? "text-amber-500"
                      : i === 1
                      ? "text-gray-500"
                      : i === 2
                      ? "text-yellow-700"
                      : "text-slate-600")
                  }
                >
                  {medal(i)}
                </span>

                {/* Name + meta + progress */}
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{u.name ?? u.Name}</p>
                  <p className="text-xs text-slate-500">
                    <span className="font-mono">{reviews}</span> review{reviews === 1 ? "" : "s"}
                    {trails != null && (
                      <>
                        &nbsp;·&nbsp;<span className="font-mono">{trails}</span> trail
                        {trails === 1 ? "" : "s"}
                      </>
                    )}
                    {avg != null && (
                      <>
                        &nbsp;·&nbsp;avg {Number(avg).toFixed(2)}
                      </>
                    )}
                  </p>

                  {/* progress vs top reviewer */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-green-600 transition-all"
                      style={{ width: `${pct}%` }}
                      aria-label={`Progress ${pct}%`}
                    />
                  </div>
                </div>

                {/* Right-aligned count */}
                <div className="text-right">
                  <p className="font-semibold text-slate-700 font-mono">{reviews}</p>
                  <p className="text-[10px] text-slate-400 tracking-wide">reviews</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
