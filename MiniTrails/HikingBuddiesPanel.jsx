// ---------------------------------------------------------------------------
// HikingBuddiesPanel.jsx – Q6 list of hiking pairs
// ---------------------------------------------------------------------------
import { useHikingBuddies } from "../api/api";
import { Link } from "react-router-dom";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function HikingBuddiesPanel({ limit = 20 }) {
  const { data = [], isLoading, isError, error } = useHikingBuddies();
  const rows = data.slice(0, limit);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading hiking buddies…
      </div>
    );
  if (isError) return <p className="text-red-600 py-4">Error: {error.message}</p>;
  if (!rows.length) return <p className="text-slate-500 py-4">No shared hikes yet.</p>;

  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold px-2">Hikers Who Went Together</h2>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-2 py-1 text-left">Hiker A</th>
            <th className="px-2 py-1 text-left">Hiker B</th>
            <th className="px-2 py-1 text-left">Trail</th>
            <th className="px-2 py-1 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="even:bg-slate-50">
              <td className="px-2 py-1">{r.hikerA}</td>
              <td className="px-2 py-1">{r.hikerB}</td>
              <td className="px-2 py-1">
                <Link
                  to={`/trails/${r.TrailID}`}
                  className="text-blue-600 hover:underline"
                >
                  {r.TrailID}
                </Link>
              </td>
              <td className="px-2 py-1">
                {new Date(r.StartTime).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
