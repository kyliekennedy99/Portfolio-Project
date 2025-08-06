import { useUsersWithoutReviews } from "../api/api";

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
  );
}

export default function UsersNoReviewsPanel({ limit = 20 }) {
  const { data = [], isLoading, isError, error } = useUsersWithoutReviews();
  const users = data.slice(0, limit);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-4 text-slate-500">
        <Spinner /> Loading users…
      </div>
    );
  if (isError) return <p className="text-red-600 py-4">Error: {error.message}</p>;
  if (!users.length) return <p className="text-slate-500 py-4">Everyone has reviewed at least one trail!</p>;

  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold px-2">Users with No Reviews</h2>
      <ul className="list-disc ml-6 space-y-1">
        {users.map((u) => (
          <li key={u.userId}>{u.name}</li>
        ))}
      </ul>
    </section>
  );
}
