import { useState } from "react";

export default function ReviewForm({ trailId, onSubmitted }) {
  const [rating, setRating]       = useState(5);
  const [difficulty, setDifficulty] = useState("");
  const [comments, setComments]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === "" || trailId == null) return;

    await fetch("http://localhost:3001/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1, // TODO: replace with logged-in user
        trailId,
        rating: Number(rating),
        difficulty,
        comments
      })
    });

    // clear form & notify parent
    setRating(5);
    setDifficulty("");
    setComments("");
    onSubmitted();
  };

  return (
    <form className="space-y-4 mt-8" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold">Add a Review</h3>

      <label className="block">
        Rating&nbsp;(1–5):
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) =>
            setRating(e.target.value ? Number(e.target.value) : "")
          }
          className="border p-2 ml-2 w-16"
          required
        />
      </label>

      <label className="block">
        Difficulty:
        <select
          className="border p-2 ml-2"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">Select…</option>
          <option>Easy</option>
          <option>Moderate</option>
          <option>Hard</option>
        </select>
      </label>

      <label className="block">
        Comments:
        <textarea
          className="border p-2 w-full"
          rows="3"
          maxLength="4000"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </label>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}
