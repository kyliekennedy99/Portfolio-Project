import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useMemo, useState } from "react";

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

const userMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Recenter map when position changes
function RecenterOnPosition({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center)) {
      map.flyTo(center, zoom, { duration: 0.75 });
    }
  }, [center, zoom, map]);
  return null;
}

function MapEvents({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      onBoundsChange?.(e.target.getBounds());
    },
    zoomend: (e) => {
      onBoundsChange?.(e.target.getBounds());
    },
  });
  return null;
}

function LocateControl({ onLocate }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "bottomright" });
    control.onAdd = function () {
      const btn = L.DomUtil.create("button", "leaflet-bar");
      btn.style.padding = "6px 10px";
      btn.style.cursor = "pointer";
      btn.style.background = "white";
      btn.style.border = "1px solid #ccc";
      btn.style.borderRadius = "8px";
      btn.title = "Locate Me";
      btn.innerText = "📍 Locate";
      L.DomEvent.on(btn, "click", (e) => {
        L.DomEvent.stopPropagation(e);
        onLocate?.((coords) => {
          if (coords) map.flyTo(coords, 12, { duration: 0.75 });
        });
      });
      return btn;
    };
    control.addTo(map);
    return () => control.remove();
  }, [map, onLocate]);

  return null;
}

export default function MapView({ trails = [], setMapBounds, onTrailHover }) {
  const FALLBACK = useMemo(() => [47.5162, 14.5501], []); // Austria fallback
  const [position, setPosition] = useState(FALLBACK);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
      },
      () => {
        console.warn("Could not get user location — using fallback center");
        setPosition(FALLBACK);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [FALLBACK]);

  const handleLocate = (cb) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        cb?.(coords);
      },
      (err) => {
        console.warn("Locate failed:", err?.message);
        cb?.(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const markers = useMemo(() => {
    return trails
      .map((trail) => {
        const nums = trail.GeoBoundary?.match(/-?\d+(\.\d+)?/g);
        if (!nums || nums.length < 2) return null;

        let lng = parseFloat(nums[0]);
        let lat = parseFloat(nums[1]);
        if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
          [lat, lng] = [lng, lat];
        }

        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
        return {
          key: trail.TrailID ?? trail.trailId,
          name: (trail.Name || trail.name || "").trim() || `Trail #${trail.TrailID ?? trail.trailId}`,
          position: [lat, lng],
        };
      })
      .filter(Boolean);
  }, [trails]);

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

        <RecenterOnPosition center={position} zoom={12} />
        <MapEvents onBoundsChange={setMapBounds} />
        <LocateControl onLocate={handleLocate} />

        {/* User location marker */}
        {position && (
          <Marker position={position} icon={userMarkerIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

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
          {markers.map((m) => (
            <Marker
              key={m.key}
              position={m.position}
              icon={smallMarkerIcon}
              eventHandlers={{
                mouseover: () => onTrailHover?.({ trailId: m.key, name: m.name }),
                mouseout: () => onTrailHover?.(null),
              }}
            >
              <Popup>{m.name}</Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
