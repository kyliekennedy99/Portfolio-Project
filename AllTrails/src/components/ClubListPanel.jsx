import { Link } from "react-router-dom";
import { useClubSizes } from "../api/api";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function ClubListPanel() {
  const {
    data: clubs = [],
    isLoading,
    isError,
    error,
  } = useClubSizes();

  if (isLoading)
    return (
      <p className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading clubs…
      </p>
    );
  if (isError)
    return (
      <p className="py-4 text-red-600">
        Error loading clubs: {error?.message ?? "unknown error"}
      </p>
    );
  if (!clubs.length)
    return <p className="py-4 text-slate-500">No clubs found.</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        🏕️ Hiking Clubs
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {clubs.map((club) => (
          <Link
            key={club.clubId}
            to={`/clubs/${club.clubId}`}
            className="block rounded-xl border bg-white p-4 hover:shadow-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {club.name}
            </h3>
            <p className="text-sm text-gray-600">{club.numMembers} members</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
