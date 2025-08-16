import { useMonthlyHikeCounts } from "../api/api";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

function prettyMonth(ym) {
  // ym = "YYYY-MM" -> "Mon YYYY"
  const d = new Date(`${ym}-01T00:00:00`);
  return isNaN(d.getTime())
    ? ym
    : d.toLocaleString(undefined, { month: "short", year: "numeric" });
}

export default function MonthlyHikesPanel() {
  const { data = [], isLoading, isError, error } = useMonthlyHikeCounts();
  const rows = data ?? [];

  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading monthly stats…
      </div>
    );

  if (isError)
    return <p className="text-red-600 py-4">Error: {error?.message}</p>;

  if (!rows.length)
    return <p className="text-slate-500 py-4">No hike data.</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        📈 Top Months (most hikes)
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((m) => (
          <div
            key={m.yearMonth}
            className="border rounded-xl bg-white p-4 shadow-sm hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold leading-snug text-gray-800 mb-1">
              {prettyMonth(m.yearMonth)}
            </h3>

            <p className="text-sm text-gray-500">
              <span className="font-medium text-emerald-600">
                {m.numHikes}
              </span>{" "}
              {m.numHikes === 1 ? "hike" : "hikes"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
