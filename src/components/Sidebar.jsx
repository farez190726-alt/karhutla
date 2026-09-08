import { aqiStations, aqiSummary, getAqiCategory } from "../data/airQuality";

export default function Sidebar({
  summary,
  volcanoSummary,
  filter,
  onFilterChange,
  layers,
  onToggleLayer,
  volcanoes,
  onSelectVolcano,
  onSelectStation,
  onCloseMobile,
  basemap = "carto_dark",
  onBasemapChange,
}) {
  const filters = [
    { key: "all", label: "Semua hotspot", count: summary.total },
    { key: "high", label: "Risiko tinggi", count: summary.high },
    { key: "medium", label: "Risiko sedang", count: summary.medium },
    { key: "low", label: "Risiko rendah", count: summary.low },
  ];

  const layerToggles = [
    { key: "showAQI", label: "Stasiun Kualitas Udara (AQI)", icon: "air" },
    { key: "showAQIHeatmap", label: "Heatmap Polusi Udara", icon: "grain" },
    { key: "showHotspots", label: "Titik Hotspot Karhutla", icon: "local_fire_department" },
    { key: "showVolcanoes", label: "Gunung Berapi (MAGMA)", icon: "volcano" },
    { key: "showWind", label: "Aliran Angin Dinamis", icon: "waves" },
  ];

  const sortedVolcanoes = [...volcanoes].sort((a, b) => b.level - a.level);
  const sortedAqiCities = [...aqiStations].sort((a, b) => b.aqi - a.aqi);

  return (
    <aside className="sidebar">
      {/* Header khusus mobile dengan tombol tutup */}
      <div className="sidebar-mobile-header">
        <div className="sidebar-mobile-title">
          <span className="msi">tune</span>
          <span>Panel Kontrol &amp; Telemetri</span>
        </div>
        <button
          className="sidebar-close-btn"
          onClick={onCloseMobile}
          aria-label="Tutup menu"
          type="button"
        >
          <span className="msi">close</span>
        </button>
      </div>

      {/* Ringkasan Kualitas Udara Nasional (IQAir Style) */}
      <div>
        <div className="sidebar-section-title">
          <span className="msi">air</span> Kualitas Udara Hari Ini
        </div>
        <div className="stat-grid">
          <div className="stat-card medium full">
            <div className="stat-value">{aqiSummary.averageAqi}</div>
            <div className="stat-label">Rata-rata AQI Nasional (Kategori Sedang)</div>
          </div>
          <div className="stat-card high">
            <div className="stat-value">{aqiSummary.mostPollutedCity?.aqi}</div>
            <div className="stat-label">
              Tertinggi: {aqiSummary.mostPollutedCity?.city}
            </div>
          </div>
          <div className="stat-card safe">
            <div className="stat-value">{aqiSummary.cleanestCity?.aqi}</div>
            <div className="stat-label">
              Terbersih: {aqiSummary.cleanestCity?.city}
            </div>
          </div>
        </div>
      </div>

      {/* Kontrol Lapisan Peta */}
      <div>
        <div className="sidebar-section-title">
          <span className="msi">layers</span> Lapisan Peta
        </div>
        <div className="filter-list">
          {layerToggles.map((l) => (
            <label className="filter-row layer-row" key={l.key}>
              <span className="layer-row-label">
                <span className="msi layer-icon">{l.icon}</span>
                {l.label}
              </span>
              <input
                type="checkbox"
                checked={layers[l.key]}
                onChange={() => onToggleLayer(l.key)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Citra Peta Dasar & Satelit Kamera */}
      <div>
        <div className="sidebar-section-title">
          <span className="msi">satellite_alt</span> Citra Peta / Satelit
        </div>
        <div className="filter-list">
          {[
            {
              id: "carto_dark",
              label: "CARTO Dark (Taktis)",
              desc: "API Key terpasang (Bebas Watermark)",
              icon: "dark_mode",
            },
            {
              id: "satellite_hd",
              label: "Satelit Optik HD (Kamera Nyata)",
              desc: "Kamera optik, bisa zoom in detail kawah & daratan",
              icon: "satellite_alt",
            },
            {
              id: "esri_satellite",
              label: "Esri World Imagery",
              desc: "Survei satelit optik bumi",
              icon: "public",
            },
          ].map((b) => (
            <div
              key={b.id}
              className={`filter-row basemap-row ${basemap === b.id ? "active" : ""}`}
              onClick={() => onBasemapChange && onBasemapChange(b.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onBasemapChange && onBasemapChange(b.id)}
            >
              <span className="layer-row-label">
                <span className="msi layer-icon">{b.icon}</span>
                <div className="basemap-text-col">
                  <span className="basemap-title">{b.label}</span>
                  <span className="basemap-desc">{b.desc}</span>
                </div>
              </span>
              {basemap === b.id && <span className="msi active-check">check</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Peringkat Kualitas Udara Kota (IQAir City Ranking) */}
      <div>
        <div className="sidebar-section-title">
          <span className="msi">format_list_numbered</span> Peringkat Polusi Kota
        </div>
        <div className="city-aqi-ranking">
          {sortedAqiCities.slice(0, 7).map((c, idx) => {
            const tier = getAqiCategory(c.aqi);
            return (
              <div
                key={c.id}
                className="city-aqi-row"
                onClick={() => {
                  if (onSelectStation) onSelectStation(c.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelectStation && onSelectStation(c.id)}
              >
                <span className="city-rank">#{idx + 1}</span>
                <div className="city-name-wrap">
                  <span className="city-name">{c.city}</span>
                  <span className="city-sub">{c.name}</span>
                </div>
                <span
                  className="city-aqi-badge"
                  style={{ backgroundColor: tier.color, color: tier.textColor }}
                >
                  {c.aqi}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ringkasan Karhutla & Gunung */}
      <div>
        <div className="sidebar-section-title">
          <span className="msi">local_fire_department</span> Hotspot &amp; Karhutla
        </div>
        <div className="stat-grid">
          <div className="stat-card high">
            <div className="stat-value">{summary.high}</div>
            <div className="stat-label">Risiko tinggi</div>
          </div>
          <div className="stat-card medium">
            <div className="stat-value">{summary.medium}</div>
            <div className="stat-label">Risiko sedang</div>
          </div>
          <div className="stat-card low">
            <div className="stat-value">{summary.low}</div>
            <div className="stat-label">Risiko rendah</div>
          </div>
          <div className="stat-card high full">
            <div className="stat-value">{volcanoSummary.awas + volcanoSummary.siaga}</div>
            <div className="stat-label">Gunung status Siaga/Awas</div>
          </div>
        </div>
      </div>

      {/* Saring Hotspot */}
      <div>
        <div className="sidebar-section-title">
          <span className="msi">filter_alt</span> Saring Hotspot
        </div>
        <div className="filter-list">
          {filters.map((f) => (
            <div
              key={f.key}
              className={`filter-row${filter === f.key ? " active" : ""}`}
              onClick={() => onFilterChange(f.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onFilterChange(f.key)}
            >
              <span>{f.label}</span>
              <span className="count">{f.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gunung Berapi */}
      <div>
        <div className="sidebar-section-title">
          <span className="msi">volcano</span> Gunung Berapi
        </div>
        <div className="filter-list">
          {sortedVolcanoes.map((v) => (
            <div
              key={v.id}
              className="filter-row volcano-row"
              onClick={() => {
                onSelectVolcano(v.id);
                if (onCloseMobile) onCloseMobile();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectVolcano(v.id)}
            >
              <span>{v.name}</span>
              <span className="tier-pill" style={{ "--tier-color": v.levelColor }}>
                {v.levelLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-note">
        Peta menggabungkan indeks kualitas udara US AQI (IQAir format), data titik panas karhutla, status
        aktivitas vulkanik MAGMA Indonesia, dan medan aliran angin meteorologis dinamis.
      </div>
    </aside>
  );
}
