import { useState } from "react";
import { AQI_TIERS } from "../data/airQuality";

export default function AQILegend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`aqi-legend-card ${expanded ? "expanded" : "collapsed"}`}>
      <div className="aqi-legend-header" onClick={() => setExpanded((e) => !e)}>
        <div className="aqi-legend-title">
          <span className="msi">air</span>
          <span>Indeks Kualitas Udara (AQI AS)</span>
        </div>
        <button
          className="aqi-legend-toggle"
          aria-label={expanded ? "Kecilkan legenda" : "Buka legenda"}
          type="button"
        >
          <span className="msi">{expanded ? "expand_more" : "expand_less"}</span>
        </button>
      </div>

      {/* Baris Spektrum Warna Selalu Terlihat */}
      <div className="aqi-spectrum-bar">
        {AQI_TIERS.map((tier) => (
          <div
            key={tier.key}
            className="aqi-spectrum-segment"
            style={{ backgroundColor: tier.color }}
            title={`${tier.min}-${tier.max}: ${tier.label}`}
          >
            <span className="aqi-seg-label">{tier.min === 0 ? "0" : tier.min}</span>
          </div>
        ))}
        <span className="aqi-seg-max">500</span>
      </div>

      {/* Penjelasan Detail (dapat di-expand atau tampil di desktop) */}
      <div className="aqi-legend-details">
        <div className="aqi-tier-grid">
          {AQI_TIERS.map((tier) => (
            <div key={tier.key} className="aqi-tier-item">
              <span
                className="aqi-tier-dot"
                style={{ backgroundColor: tier.color }}
              />
              <div className="aqi-tier-info">
                <div className="aqi-tier-name">
                  <span>{tier.label}</span>
                  <span className="aqi-tier-range">
                    {tier.min} - {tier.max >= 500 ? "301+" : tier.max}
                  </span>
                </div>
                <div className="aqi-tier-desc">{tier.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
