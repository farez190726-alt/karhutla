import RiskPill from "./RiskPill";
import { formatTimeAgo } from "../utils/geo";

export default function HotspotTicker({ hotspots, selectedId, onSelect, nowMs, expanded }) {
  const sorted = [...hotspots].sort((a, b) => new Date(b.acquired) - new Date(a.acquired));

  return (
    <div className={`ticker${expanded ? " ticker-expanded" : ""}`}>
      <div className="ticker-title">
        <span className="msi">local_fire_department</span> Hotspot terbaru
      </div>
      {sorted.map((h) => (
        <div
          key={h.id}
          className={`ticker-row${h.id === selectedId ? " selected" : ""}`}
          onClick={() => onSelect(h.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onSelect(h.id)}
        >
          <span className="ticker-sub">{formatTimeAgo(h.acquired, nowMs)}</span>
          <span>
            <span className="ticker-loc">{h.province}</span>
            <div className="ticker-sub">{h.district}</div>
          </span>
          <RiskPill risk={h.risk} />
          <span className="ticker-sub ticker-frp">{h.frp} MW</span>
          <span className="ticker-sub ticker-time">{h.cctv.length} CCTV</span>
        </div>
      ))}
    </div>
  );
}
