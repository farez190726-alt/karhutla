import { Marker, Tooltip, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { aqiStations, getAqiCategory } from "../data/airQuality";

// Membuat icon badge AQI ala IQAir: pil angka berwarna cerah dengan teks kontras
function createAqiIcon(aqi, isSelected) {
  const tier = getAqiCategory(aqi);
  const size = isSelected ? 34 : 28;
  const fontSize = isSelected ? 12 : 11;

  return L.divIcon({
    className: "aqi-marker-container",
    html: `
      <div class="iqair-badge ${isSelected ? "iqair-badge--selected" : ""}" 
           style="background-color: ${tier.color}; color: ${tier.textColor};">
        <span class="iqair-badge-val" style="font-size: ${fontSize}px;">${aqi}</span>
        <div class="iqair-badge-pin" style="border-top-color: ${tier.color};"></div>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 6],
  });
}

export default function AQILayer({
  stations = aqiStations,
  selectedId,
  onSelectStation,
  showHeatmap = true,
  visible = true,
}) {
  if (!visible) return null;

  return (
    <>
      {/* Lapisan Heatmap/Gradien Polusi Kualitas Udara */}
      {showHeatmap &&
        stations.map((s) => {
          const tier = getAqiCategory(s.aqi);
          // Radius lebih besar dan lebih pekat untuk wilayah polusi tinggi (misal zona karhutla)
          const radius = Math.max(35, Math.min(85, s.aqi * 0.45));
          const opacity = Math.min(0.38, 0.12 + (s.aqi / 300) * 0.26);

          return (
            <CircleMarker
              key={`heat-${s.id}`}
              center={[s.lat, s.lon]}
              radius={radius}
              pathOptions={{
                color: tier.color,
                fillColor: tier.color,
                fillOpacity: opacity,
                stroke: false,
                interactive: false,
              }}
            />
          );
        })}

      {/* Pin/Badge Stasiun Pemantau Kualitas Udara */}
      {stations.map((s) => {
        const isSelected = selectedId === s.id;
        const tier = getAqiCategory(s.aqi);

        return (
          <Marker
            key={s.id}
            position={[s.lat, s.lon]}
            icon={createAqiIcon(s.aqi, isSelected)}
            eventHandlers={{
              click: () => onSelectStation(isSelected ? null : s.id),
            }}
          >
            <Tooltip direction="top" offset={[0, -28]} opacity={0.96}>
              <div className="aqi-tooltip">
                <div className="aqi-tooltip-header">
                  <strong>{s.city}</strong>
                  <span
                    className="aqi-tooltip-badge"
                    style={{ backgroundColor: tier.color, color: tier.textColor }}
                  >
                    AQI {s.aqi}
                  </span>
                </div>
                <div className="aqi-tooltip-sub">{s.name}</div>
                <div className="aqi-tooltip-tier" style={{ color: tier.color }}>
                  {tier.label}
                </div>
                <div className="aqi-tooltip-meta">
                  Polutan utama: {s.primaryPollutant} ({s.pm25} µg/m³)
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
