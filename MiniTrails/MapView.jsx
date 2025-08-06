import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useState } from "react";

const smallMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [24, 38],
  iconAnchor: [12, 38],
  popupAnchor: [0, -38],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [40, 40],
  shadowAnchor: [13, 37],
  className: "leaflet-marker-glow",
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
  const [position, setPosition] = useState([47.5162, 14.5501]); // Austria fallback

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
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        center={position}
        zoom={7}
        style={{ height: "400px", width: "100%" }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
        />

        <MapEvents onBoundsChange={setMapBounds} />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            let size = "small";
            if (count >= 50) size = "large";
            else if (count >= 20) size = "medium";

            return L.divIcon({
              html: `<div class="cluster-icon ${size}">${count}</div>`,
              className: "custom-cluster",
              iconSize: L.point(40, 40, true),
            });
          }}
        >
          {trails.map((trail) => {
            const coords = trail.GeoBoundary?.match(/-?\d+(\.\d+)?/g);
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
    </div>
  );
}
