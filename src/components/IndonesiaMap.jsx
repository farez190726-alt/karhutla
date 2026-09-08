import { project } from "../utils/geo";

const RISK_COLOR = {
  high: "var(--risk-high)",
  medium: "var(--risk-medium)",
  low: "var(--risk-low)",
};

// Simplified, stylized landmass silhouettes (not precise cartography) positioned
// to roughly match real longitude/latitude so hotspot markers land in sensible places.
const ISLANDS = [
  {
    name: "Sumatera",
    d: "M120,60 C160,40 190,80 200,140 C210,210 190,300 170,360 C155,400 130,420 110,400 C90,375 95,320 85,260 C75,190 80,110 120,60 Z",
  },
  {
    name: "Kalimantan",
    d: "M330,90 C400,70 480,90 520,140 C560,190 550,260 500,300 C450,335 380,330 340,290 C300,250 290,190 300,140 C305,120 315,100 330,90 Z",
  },
  {
    name: "Jawa",
    d: "M230,380 C300,368 400,372 470,388 C495,393 495,410 468,415 C400,428 300,426 235,412 C210,406 210,386 230,380 Z",
  },
  {
    name: "Sulawesi",
    d: "M600,120 C630,110 650,140 645,175 C665,190 680,220 665,250 C650,275 620,270 610,245 C590,255 570,240 575,210 C555,200 555,170 580,150 C585,135 590,125 600,120 Z",
  },
  {
    name: "Papua",
    d: "M840,150 C920,135 1000,150 1040,190 C1000,215 990,250 1010,280 C960,300 900,285 870,255 C845,230 830,190 840,150 Z",
  },
];

export default function IndonesiaMap({ hotspots, selectedId, onSelect, nowMs }) {
  return (
    <div className="map-wrap">
      <span className="map-scan-hint">Pemindaian citra hotspot &middot; wilayah barat &amp; tengah Indonesia</span>
      <svg viewBox="0 0 1080 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Peta sebaran hotspot">
        <defs>
          <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="var(--border)" strokeWidth="0.6" />
          </pattern>
          <radialGradient id="glowHigh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--risk-high)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--risk-high)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1080" height="520" fill="var(--bg)" />
        <rect width="1080" height="520" fill="url(#grid)" />

        {ISLANDS.map((isl) => (
          <path key={isl.name} d={isl.d} fill="var(--panel)" stroke="var(--border-strong)" strokeWidth="1" />
        ))}

        {hotspots.map((h) => {
          const { x, y } = project(h.lon, h.lat);
          const isSelected = h.id === selectedId;
          const color = RISK_COLOR[h.risk];
          return (
            <g
              key={h.id}
              className={`hotspot-marker${isSelected ? " selected" : ""}`}
              onClick={() => onSelect(h.id)}
              tabIndex={0}
              role="button"
              aria-label={`${h.province}, risiko ${h.risk}`}
              onKeyDown={(e) => e.key === "Enter" && onSelect(h.id)}
            >
              {h.risk === "high" && <circle cx={x} cy={y} r="26" fill="url(#glowHigh)" />}
              <circle
                className="ring"
                cx={x}
                cy={y}
                r={isSelected ? 11 : 9}
                fill="none"
                stroke={color}
                strokeWidth={isSelected ? 1.5 : 1}
                opacity="0.6"
              />
              <circle className="core" cx={x} cy={y} r={isSelected ? 6.5 : 5} fill={color} />
            </g>
          );
        })}
      </svg>
      <span className="map-caption">
        Peta bersifat skematik &middot; posisi mengikuti koordinat lintang/bujur asli, bukan kontur pantai presisi
      </span>
    </div>
  );
}
