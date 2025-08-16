import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-800">
      <section className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">About MiniTrails</h1>
        <p className="text-lg text-gray-600 mb-6">
          Connecting hikers, clubs, and trails in one beautiful, social platform.
        </p>
        <p className="text-md text-gray-500 max-w-2xl mx-auto">
          AllTrails helps outdoor enthusiasts find new hiking adventures, join local hiking clubs, and meet like-minded people. Whether you're a casual weekend hiker or a seasoned trail runner, AllTrails brings the community and the outdoors together.
        </p>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-12">Our Mission</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
              <img
                src="https://img.icons8.com/ios-filled/100/4CAF50/compass.png"
                alt="Explore"
                className="mx-auto mb-4 w-12 h-12"
              />
              <h3 className="text-lg font-semibold mb-2">Discover Trails</h3>
              <p className="text-sm text-gray-500">
                Browse thousands of trails with detailed info, difficulty ratings, and user reviews.
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
              <img
                src="https://img.icons8.com/ios-filled/100/4CAF50/people-working-together.png"
                alt="Community"
                className="mx-auto mb-4 w-12 h-12"
              />
              <h3 className="text-lg font-semibold mb-2">Build Community</h3>
              <p className="text-sm text-gray-500">
                Join local hiking clubs, share experiences, and plan trips together.
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
              <img
                src="https://img.icons8.com/ios-filled/100/4CAF50/leaf.png"
                alt="Sustainability"
                className="mx-auto mb-4 w-12 h-12"
              />
              <h3 className="text-lg font-semibold mb-2">Respect Nature</h3>
              <p className="text-sm text-gray-500">
                Promote responsible hiking and protect our trails for generations to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-center mb-12">Behind MiniTrails</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <TeamMember name="Kylie Kennedy" role="Frontend Developer" />
          <TeamMember name="Josiah Lillestrand" role="Backend Developer" />
          <TeamMember name="Alex Hsu" role="Backend Developer" />
        </div>
      </section>

      <section className="bg-green-600 text-white text-center py-12 px-4">
        <h2 className="text-2xl font-semibold mb-4">Join the Adventure</h2>
        <p className="mb-6">Start exploring trails and connecting with nature lovers near you.</p>
        <Link
          to="/explore"
          className="inline-block bg-white text-green-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition"
        >
          Explore Now
        </Link>
      </section>
    </div>
  );
}

function TeamMember({ name, role }) {
  return (
    <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition">
      <h4 className="text-lg font-semibold">{name}</h4>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  );
}
