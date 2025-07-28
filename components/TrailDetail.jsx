import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function TrailDetail() {
  const { id } = useParams();
  const [trail, setTrail] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/trails/${id}`)
      .then((res) => res.json())
      .then((data) => setTrail(data))
      .catch((err) => console.error('Error loading trail:', err));
  }, [id]);

  if (!trail) return <p className="text-center mt-10">Loading trail...</p>;

  // Parse lat/lng for map (fallback to center of Austria)
  const coords = trail.GeoBoundary?.match(/-?\d+(\.\d+)?/g);
  const lat = coords?.[1] ? parseFloat(coords[1]) : 47.5162;
  const lng = coords?.[0] ? parseFloat(coords[0]) : 14.5501;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{trail.Name}</h1>

      <MapContainer center={[lat, lng]} zoom={11} style={{ height: '300px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]}>
          <Popup>{trail.Name}</Popup>
        </Marker>
      </MapContainer>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <p><span className="font-semibold">Trail ID:</span> {trail.TrailID}</p>
        <p><span className="font-semibold">Length:</span> {trail.Length2D?.toFixed(2)} mi</p>
        <p><span className="font-semibold">Uphill:</span> {trail.Uphill?.toFixed(0)} ft</p>
        <p><span className="font-semibold">Downhill:</span> {trail.Downhill?.toFixed(0)} ft</p>
        <p><span className="font-semibold">Min Elevation:</span> {trail.MinElevation?.toFixed(0)} ft</p>
        <p><span className="font-semibold">GPX Available:</span> {trail.gpx ? 'Yes' : 'No'}</p>
      </div>

      {trail.gpx && (
        <a
          href={`data:application/gpx+xml;charset=utf-8,${encodeURIComponent(trail.gpx)}`}
          download={`${trail.Name || 'trail'}.gpx`}
          className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download GPX
        </a>
      )}
    </div>
  );
}
