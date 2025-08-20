// TrailList.jsx — highlights the card for the trail currently hovered on the map
import { useState, useMemo, useEffect, useRef } from "react";
import MapView from "./MapView";
import TrailCard from "./TrailCard";

export default function TrailList({ trails = [] }) {
  const [hovered, setHovered] = useState(null); // { trailId, name, ... } | null
  const containerRef = useRef(null);

  // Build a consistent key for comparing hovered marker ↔ card
  const hoverKey = useMemo(() => {
    if (!hovered) return null;
    if (hovered.trailId != null) return `id:${hovered.trailId}`;
    if (hovered.name) return `name:${hovered.name.toLowerCase().trim()}`;
    return null;
  }, [hovered]);

  const cardKeyFor = (t) => {
    if (t.trailId != null) return `id:${t.trailId}`;
    if (t.TrailID != null) return `id:${t.TrailID}`;
    if (t.name) return `name:${t.name.toLowerCase().trim()}`;
    if (t.Name) return `name:${t.Name.toLowerCase().trim()}`;
    return null;
  };

  // Optional: auto-scroll the hovered card into view
  useEffect(() => {
    if (!hoverKey || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-hoverkey="${CSS.escape(hoverKey)}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  }, [hoverKey]);

  return (
    <div className="space-y-8">
      {/* Map reports hovered trail via onTrailHover */}
      <section>
        <MapView trails={trails} onTrailHover={setHovered} />
      </section>

      {/* Cards, with hover highlight */}
      <section
        ref={containerRef}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {trails.map((t) => {
          const keyForThis = cardKeyFor(t);
          const isHovered = hoverKey && hoverKey === keyForThis;

          return (
            <div
              key={t.trailId ?? t.TrailID ?? t.name ?? t.Name}
              data-hoverkey={keyForThis ?? ""}
              className={`rounded-xl border bg-white transition-shadow ${
                isHovered ? "ring-2 ring-emerald-400 shadow-lg" : "shadow-sm"
              }`}
            >
              <TrailCard trail={t} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
