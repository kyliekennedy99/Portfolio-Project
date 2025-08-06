import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      <header className="text-center py-20 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to MiniTrails
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Discover hiking trails, join clubs, track your adventures, and connect with fellow hikers across the globe.
        </p>
        <Link
          to="/trails"
          className="mt-6 inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full text-lg font-semibold shadow-md transition"
        >
          Explore Trails <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Link>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">🏞️ Explore Trails</h2>
          <p className="text-gray-600 mb-3">
            Browse and search through thousands of hiking trails with detailed elevation stats, reviews, and maps.
          </p>
          <Link to="/trails" className="text-green-600 font-medium hover:underline">
            Find a trail
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">👥 Join Hiking Clubs</h2>
          <p className="text-gray-600 mb-3">
            Connect with local or global hiking clubs. Share hikes, compete, and grow your outdoor community.
          </p>
          <Link to="/explore" className="text-green-600 font-medium hover:underline">
            Meet hikers
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">📈 Track Your Stats</h2>
          <p className="text-gray-600 mb-3">
            View your progress, favorite trails, and see how your hikes stack up month to month.
          </p>
          <Link to="/profile" className="text-green-600 font-medium hover:underline">
            View profile
          </Link>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-400 py-8">
        &copy; {new Date().getFullYear()} MiniTrails. All rights reserved.
      </footer>
    </div>
  );
}
