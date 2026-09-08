import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import WindLayer from "./WindLayer";

const RISK_COLOR = {
  high: "#e0472c",
  medium: "#e0a53c",
  low: "#5aa88f",
};

const INDONESIA_CENTER = [-1.5, 116];

function volcanoIcon(color, selected) {
  const size = selected ? 26 : 20;
  return L.divIcon({
    className: "volcano-icon",
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24">
        <path d="M12 3 L21 20 H3 Z" fill="${color}" stroke="#0a1512" stroke-width="1.2" />
        <path d="M12 3 L14.8 8.5 L9.2 8.5 Z" fill="#0a1512" opacity="0.55" />
      </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size * 0.9],
  });
}

// Recenters/zooms the map when the selection changes, without remounting it.
function FlyToSelected({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lon], Math.max(map.getZoom(), 7), { duration: 0.6 });
    }
  }, [target, map]);
  return null;
}

export default function MapView({
  hotspots,
  volcanoes,
  selected,
  onSelectHotspot,
  onSelectVolcano,
  showHotspots,
  showVolcanoes,
  showWind,
}) {
  const flyTarget = useMemo(() => {
    if (!selected) return null;
    return selected.kind === "hotspot"
      ? hotspots.find((h) => h.id === selected.id) || null
      : volcanoes.find((v) => v.id === selected.id) || null;
  }, [selected, hotspots, volcanoes]);

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

        <WindLayer visible={showWind} />

        {showHotspots &&
          hotspots.map((h) => {
            const isSelected = selected?.kind === "hotspot" && selected.id === h.id;
            const color = RISK_COLOR[h.risk];
            return (
              <CircleMarker
                key={h.id}
                center={[h.lat, h.lon]}
                radius={isSelected ? 11 : h.risk === "high" ? 7 : 5.5}
                pathOptions={{
                  color,
                  weight: isSelected ? 3 : 1,
                  fillColor: color,
                  fillOpacity: 0.8,
                }}
                eventHandlers={{
                  click: () => onSelectHotspot(isSelected ? null : h.id),
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

        {showVolcanoes &&
          volcanoes.map((v) => {
            const isSelected = selected?.kind === "volcano" && selected.id === v.id;
            return (
              <Marker
                key={v.id}
                position={[v.lat, v.lon]}
                icon={volcanoIcon(v.levelColor, isSelected)}
                eventHandlers={{
                  click: () => onSelectVolcano(isSelected ? null : v.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                  <strong>{v.name}</strong>
                  <br />
                  Status {v.levelLabel}
                </Tooltip>
              </Marker>
            );
          })}

        <FlyToSelected target={flyTarget} />
      </MapContainer>
      <span className="map-caption">
        Titik: hotspot satelit (bulat) &amp; gunung berapi (segitiga) &middot; garis: arah aliran angin (ilustratif)
      </span>
    </div>
  );
}
