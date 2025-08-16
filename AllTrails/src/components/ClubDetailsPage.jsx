import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ClubDetailsPage() {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clubId) return;

    fetch(`http://localhost:3001/api/clubs/${clubId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Club not found");
        return res.json();
      })
      .then((data) => {
        setClub(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setIsLoading(false);
      });
  }, [clubId]);

  if (isLoading) {
    return <p className="p-6 text-slate-500">Loading club…</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>;
  }

  if (!club) {
    return <p className="p-6 text-slate-500">No club data found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{club.name}</h1>
      <p className="text-gray-600 mb-2">{club.location || "Location unknown"}</p>
      <p className="text-sm text-gray-500">
        Members: <span className="font-semibold">{club.numMembers}</span>
      </p>
      {/* Add more club details here if available */}
    </div>
  );
}
