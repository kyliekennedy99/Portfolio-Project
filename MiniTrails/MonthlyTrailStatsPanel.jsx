import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyTrailStatsPanel() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/analytics/monthly-trail-stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load monthly stats");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error)
    return <p className="text-red-600 py-4">Error: {error}</p>;
  if (!data.length)
    return <p className="text-slate-500 py-4">Loading stats…</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">📊 Monthly Trail Stats</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={[...data].reverse()}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="yearMonth" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: "white", borderColor: "#d1d5db" }}
            labelStyle={{ color: "#374151" }}
          />
          <Legend />
          <Bar dataKey="numHikes" fill="#3b82f6" name="Hikes" radius={[4, 4, 0, 0]} />
          <Bar dataKey="distinctTrails" fill="#10b981" name="Unique Trails" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
