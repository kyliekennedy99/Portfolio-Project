import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect, useState } from 'react';

const smallMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [30, 30],
  shadowAnchor: [10, 30],
});

function MapEvents({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      const bounds = e.target.getBounds();
      onBoundsChange(bounds);
    },
  });
  return null;
}

export default function MapView({ trails, setMapBounds }) {
  const [position, setPosition] = useState([47.5162, 14.5501]); // Center of Austria

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        () => console.warn("Could not get user location — using Austria center")
      );
    }
  }, []);

  return (
    <MapContainer center={position} zoom={7} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapEvents onBoundsChange={setMapBounds} />

      <MarkerClusterGroup chunkedLoading>
        {trails.map((trail) => {
          if (!trail.GeoBoundary) return null;

          const coords = trail.GeoBoundary.match(/-?\d+(\.\d+)?/g);
          const lat = coords?.[1] ? parseFloat(coords[1]) : null;
          const lng = coords?.[0] ? parseFloat(coords[0]) : null;
          if (!lat || !lng) return null;

          return (
            <Marker
              key={trail.TrailID}
              position={[lat, lng]}
              icon={smallMarkerIcon}
            >
              <Popup>{trail.Name?.trim() || `Trail #${trail.TrailID}`}</Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
