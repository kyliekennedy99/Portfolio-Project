import { Link } from 'react-router-dom';

export default function TrailCard({ trail }) {
  return (
    <Link to={`/trails/${trail.TrailID}`} className="block hover:scale-[1.01] transition-transform">
      <div className="bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg transition">
        <h2 className="text-lg font-medium">{trail.Name?.trim() || `Trail #${trail.TrailID}`}</h2>
        <p className="text-sm text-gray-500">Min Elevation: {trail.MinElevation?.toFixed(0)} ft</p>
        <ul className="mt-2 text-sm">
          <li>Length: {trail.Length2D?.toFixed(2)} mi</li>
          <li>Uphill: {trail.Uphill?.toFixed(0)} ft</li>
          <li>Downhill: {trail.Downhill?.toFixed(0)} ft</li>
        </ul>
      </div>
    </Link>
  );
}
