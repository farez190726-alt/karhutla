import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RISK_COLOR = {
  high: "#e0472c",
  medium: "#e0a53c",
  low: "#5aa88f",
};

const INDONESIA_CENTER = [-1.5, 116];

// Recenters/zooms the map when the selected hotspot changes, without remounting it.
function FlyToSelected({ hotspot }) {
  const map = useMap();
  useEffect(() => {
    if (hotspot) {
      map.flyTo([hotspot.lat, hotspot.lon], Math.max(map.getZoom(), 7), { duration: 0.6 });
    }
  }, [hotspot, map]);
  return null;
}

export default function MapView({ hotspots, selectedId, onSelect }) {
  const selected = hotspots.find((h) => h.id === selectedId) || null;

  return (
    <div className="map-wrap">
      <span className="map-scan-hint">Peta langsung &middot; OpenStreetMap / CARTO</span>
      <MapContainer
        center={INDONESIA_CENTER}
        zoom={5}
        minZoom={4}
        maxZoom={12}
        scrollWheelZoom
        style={{ width: "100%", height: "100%", background: "var(--bg)" }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
        />

        {hotspots.map((h) => {
          const isSelected = h.id === selectedId;
          const color = RISK_COLOR[h.risk];
          return (
            <CircleMarker
              key={h.id}
              center={[h.lat, h.lon]}
              radius={isSelected ? 11 : 8}
              pathOptions={{
                color,
                weight: isSelected ? 3 : 1.5,
                fillColor: color,
                fillOpacity: 0.85,
              }}
              eventHandlers={{
                click: () => onSelect(h.id === selectedId ? null : h.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                <strong>{h.province}</strong>
                <br />
                {h.district} &middot; skor {h.score}
              </Tooltip>
            </CircleMarker>
          );
        })}

        <FlyToSelected hotspot={selected} />
      </MapContainer>
      <span className="map-caption">
        Sumber peta dasar: OpenStreetMap &amp; CARTO &middot; koordinat hotspot dari data satelit
      </span>
    </div>
  );
}
