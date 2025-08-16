// ---------------------------------------------------------------------------
// DifficultyDistPanel.jsx – shows bar chart/table of difficulty counts (Q2)
// ---------------------------------------------------------------------------
import { useDifficultyDist } from "../api/api";

export default function DifficultyDistPanel({ trailId }) {
  const { data = [], isLoading, isError, error } = useDifficultyDist(trailId);

  if (isLoading) return <p className="text-slate-500">Loading difficulty…</p>;
  if (isError)   return <p className="text-red-600">Error: {error.message}</p>;
  if (!data.length) return <p className="text-slate-500">No reviews yet.</p>;

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Difficulty Breakdown</h3>
      <ul className="space-y-1">
        {data.map((row) => (
          <li key={row.difficulty} className="flex justify-between border-b py-1">
            <span>{row.difficulty || "Unrated"}</span>
            <span className="font-mono">{row.numReviews}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
