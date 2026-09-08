import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import WindLayer from "./WindLayer";
import AQILayer from "./AQILayer";
import AQILegend from "./AQILegend";

export const BASEMAPS = {
  carto_dark: {
    id: "carto_dark",
    name: "CARTO Dark (Taktis)",
    shortName: "CARTO Dark",
    icon: "dark_mode",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=cb1_31ew_1_94c3a7fa0397490a1e50fcef",
    subdomains: "abcd",
    maxZoom: 20,
    scanHint: "LIVE · CARTO Dark (API Key Aktif: Bebas Watermark) · IQAir AQI",
  },
  satellite_hd: {
    id: "satellite_hd",
    name: "Satelit Optik HD (Kamera Nyata)",
    shortName: "Satelit HD",
    icon: "satellite_alt",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    subdomains: "abcd",
    maxZoom: 20,
    scanHint: "LIVE · Citra Satelit Kamera Langsung (Zoom Tinggi)",
  },
  esri_satellite: {
    id: "esri_satellite",
    name: "Esri World Imagery",
    shortName: "Esri Satelit",
    icon: "public",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "abcd",
    maxZoom: 19,
    scanHint: "LIVE · Esri World Imagery (Survey Satelit)",
  },
};

const RISK_COLOR = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

const RISK_FIRE_STYLE = {
  high: { size: 30, glow: 14, pulse: true },
  medium: { size: 24, glow: 9, pulse: false },
  low: { size: 18, glow: 5, pulse: false },
};

const INDONESIA_CENTER = [-1.5, 116];

function volcanoIcon(color, selected) {
  const size = selected ? 26 : 20;
  return L.divIcon({
    className: "volcano-icon",
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24">
        <path d="M12 3 L21 20 H3 Z" fill="${color}" stroke="#070a0f" stroke-width="1.2" />
        <path d="M12 3 L14.8 8.5 L9.2 8.5 Z" fill="#070a0f" opacity="0.55" />
      </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size * 0.9],
  });
}

function fireIcon(risk, selected) {
  const base = RISK_FIRE_STYLE[risk] || RISK_FIRE_STYLE.low;
  const size = selected ? base.size + 8 : base.size;
  const color = RISK_COLOR[risk];
  return L.divIcon({
    className: `fire-icon fire-icon--${risk}${base.pulse ? " fire-icon--pulse" : ""}${selected ? " fire-icon--selected" : ""}`,
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="filter: drop-shadow(0 0 ${base.glow}px ${color}99);">
        <path d="M12 2.2c.4 2.4-1 3.6-2.1 4.9C8.6 8.5 7.6 10 7.6 12.2c0 3 2 5.3 4.4 5.3.6 0 1.1-.1 1.6-.3-1-.6-1.7-1.7-1.7-3 0-1.4.8-2.2 1.6-3.1.4-.5.9-1 1.1-1.7.6 1 1 2.1 1 3.4 0 3.3-2.4 5.9-5.7 6.5.6.2 1.3.3 2 .3 4 0 7.1-3.1 7.1-7.2 0-3.3-1.6-5.7-3.4-7.7C13.9 3.4 12.9 2.7 12 2.2z"
          fill="${color}" stroke="#070a0f" stroke-width="0.6" />
        <path d="M12 12.6c.3.9.1 1.6-.4 2.2-.1-1-.5-1.5-.9-2-.4.4-.7.9-.7 1.5 0 1 .7 1.7 1.6 1.7 1 0 1.8-.8 1.8-1.9 0-.7-.3-1.2-1.4-1.5z"
          fill="#2a1208" opacity="0.7" />
      </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size * 0.92],
  });
}

function FlyToSelected({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lon], Math.max(map.getZoom(), 9), { duration: 0.6 });
    }
  }, [target, map]);
  return null;
}

function ResetView({ resetKey }) {
  const map = useMap();
  useEffect(() => {
    if (resetKey > 0) {
      map.flyTo(INDONESIA_CENTER, 5, { duration: 0.7 });
    }
  }, [resetKey, map]);
  return null;
}

export default function MapView({
  hotspots,
  volcanoes,
  aqiStations = [],
  selected,
  onSelectHotspot,
  onSelectVolcano,
  onSelectStation,
  showHotspots = true,
  showVolcanoes = true,
  showWind = true,
  showAQI = true,
  showAQIHeatmap = true,
  resetKey = 0,
  basemap = "carto_dark",
  onBasemapChange,
  onToggleSidebar,
}) {
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const currentBasemap = BASEMAPS[basemap] || BASEMAPS.carto_dark;

  const flyTarget = useMemo(() => {
    if (!selected) return null;
    if (selected.kind === "hotspot") {
      return hotspots.find((h) => h.id === selected.id) || null;
    }
    if (selected.kind === "volcano") {
      return volcanoes.find((v) => v.id === selected.id) || null;
    }
    if (selected.kind === "aqi") {
      return aqiStations.find((s) => s.id === selected.id) || null;
    }
    return null;
  }, [selected, hotspots, volcanoes, aqiStations]);

  return (
    <div className="map-wrap">
      <span className="map-scan-hint">
        <span className="msi">{currentBasemap.icon}</span> {currentBasemap.scanHint}
      </span>

      <MapContainer
        center={INDONESIA_CENTER}
        zoom={5}
        minZoom={4}
        maxZoom={20}
        scrollWheelZoom
        style={{ width: "100%", height: "100%", background: "#05080c" }}
        attributionControl={false}
      >
        <TileLayer
          key={currentBasemap.id}
          url={currentBasemap.url}
          subdomains={currentBasemap.subdomains}
          maxZoom={currentBasemap.maxZoom}
        />

        {/* Lapisan Aliran Angin Dinamis */}
        <WindLayer visible={showWind} />

        {/* Lapisan Kualitas Udara (Stasiun & Heatmap) */}
        <AQILayer
          stations={aqiStations}
          selectedId={selected?.kind === "aqi" ? selected.id : null}
          onSelectStation={(id) => onSelectStation(id)}
          showHeatmap={showAQIHeatmap}
          visible={showAQI}
        />

        {/* Lapisan Titik Hotspot Karhutla */}
        {showHotspots &&
          hotspots.map((h) => {
            const isSelected = selected?.kind === "hotspot" && selected.id === h.id;
            return (
              <Marker
                key={h.id}
                position={[h.lat, h.lon]}
                icon={fireIcon(h.risk, isSelected)}
                eventHandlers={{
                  click: () => onSelectHotspot(isSelected ? null : h.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                  <strong>{h.province}</strong>
                  <br />
                  {h.district} &middot; skor {h.score} &middot; risiko {h.risk}
                </Tooltip>
              </Marker>
            );
          })}

        {/* Lapisan Gunung Berapi */}
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
        <ResetView resetKey={resetKey} />
      </MapContainer>

      {/* Legenda Indeks Kualitas Udara Mengambang */}
      {showAQI && <AQILegend />}

      {/* Menu Pemilihan Jenis Peta / Citra Satelit */}
      {showBasemapMenu && (
        <div className="basemap-popup-menu">
          <div className="basemap-popup-title">
            <span className="msi">layers</span> Pilih Citra Peta / Satelit
          </div>
          <div className="basemap-options-list">
            {Object.values(BASEMAPS).map((b) => (
              <button
                key={b.id}
                className={`basemap-option-btn ${basemap === b.id ? "active" : ""}`}
                onClick={() => {
                  if (onBasemapChange) onBasemapChange(b.id);
                  setShowBasemapMenu(false);
                }}
                type="button"
              >
                <span className="msi">{b.icon}</span>
                <div className="basemap-option-text">
                  <div className="basemap-option-name">{b.name}</div>
                  <div className="basemap-option-sub">
                    {b.id === "carto_dark" && "Bebas watermark dengan API Key"}
                    {b.id === "satellite_hd" && "Kamera optik nyata, zoom level 20"}
                    {b.id === "esri_satellite" && "Foto survei satelit permukaan bumi"}
                  </div>
                </div>
                {basemap === b.id && <span className="msi check-icon">check_circle</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Toolbar Peta */}
      <div className="map-toolbar">
        {/* Tombol Cepat Pengalih Citra Satelit / Mode Peta */}
        <button
          className={`map-tool-btn ${basemap === "satellite_hd" ? "active" : ""}`}
          onClick={() => setShowBasemapMenu((s) => !s)}
          title={`Ganti tampilan peta/satelit (Saat ini: ${currentBasemap.shortName})`}
          aria-label="Pilih citra satelit atau peta"
        >
          <span className="msi">{currentBasemap.icon}</span>
        </button>

        {onToggleSidebar && (
          <button
            className="map-tool-btn"
            onClick={onToggleSidebar}
            title="Buka panel telemetri"
            aria-label="Panel telemetri"
          >
            <span className="msi">tune</span>
          </button>
        )}

        <button
          className="map-tool-btn"
          onClick={() => {
            if (onBasemapChange) {
              const next = basemap === "carto_dark" ? "satellite_hd" : "carto_dark";
              onBasemapChange(next);
            }
          }}
          title={basemap === "satellite_hd" ? "Beralih ke CARTO Dark" : "Beralih ke Citra Satelit Kamera"}
          aria-label="Beralih cepat satelit/peta"
        >
          <span className="msi">{basemap === "satellite_hd" ? "dark_mode" : "satellite_alt"}</span>
        </button>
      </div>

      <span className="map-caption">
        Mode: {currentBasemap.name} &middot; Zoom hingga level 20 untuk melihat kawah, vegetasi &amp; daratan secara riil
      </span>
    </div>
  );
}
