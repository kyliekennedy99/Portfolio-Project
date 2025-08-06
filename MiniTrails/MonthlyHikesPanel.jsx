// ---------------------------------------------------------------------------
// MonthlyHikesPanel.jsx – Q7: past-12-month hike counts
// ---------------------------------------------------------------------------
import { useMonthlyHikeCounts } from "../api/api";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function MonthlyHikesPanel() {
  const { data = [], isLoading, isError, error } = useMonthlyHikeCounts();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading monthly stats…
      </div>
    );
  }

  if (isError) return <p className="text-red-600 py-4">Error: {error.message}</p>;
  if (!data.length) return <p className="text-slate-500 py-4">No hikes in the last year.</p>;

  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold px-2">Hikes per Month (last 12 mo)</h2>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-2 py-1 text-left">Month</th>
            <th className="px-2 py-1 text-left"># Hikes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.yearMonth} className="even:bg-slate-50">
              <td className="px-2 py-1">{row.yearMonth}</td>
              <td className="px-2 py-1 font-mono">{row.numHikes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
