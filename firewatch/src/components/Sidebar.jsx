export default function Sidebar({
  summary,
  volcanoSummary,
  filter,
  onFilterChange,
  layers,
  onToggleLayer,
  volcanoes,
  onSelectVolcano,
}) {
  const filters = [
    { key: "all", label: "Semua hotspot", count: summary.total },
    { key: "high", label: "Risiko tinggi", count: summary.high },
    { key: "medium", label: "Risiko sedang", count: summary.medium },
    { key: "low", label: "Risiko rendah", count: summary.low },
  ];

  const layerToggles = [
    { key: "showHotspots", label: "Titik hotspot" },
    { key: "showVolcanoes", label: "Gunung berapi" },
    { key: "showWind", label: "Arah angin" },
  ];

  const sortedVolcanoes = [...volcanoes].sort((a, b) => b.level - a.level);

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-section-title">Ringkasan hari ini</div>
        <div className="stat-grid">
          <div className="stat-card high">
            <div className="stat-value">{summary.high}</div>
            <div className="stat-label">Hotspot risiko tinggi</div>
          </div>
          <div className="stat-card medium">
            <div className="stat-value">{summary.medium}</div>
            <div className="stat-label">Hotspot risiko sedang</div>
          </div>
          <div className="stat-card low">
            <div className="stat-value">{summary.low}</div>
            <div className="stat-label">Hotspot risiko rendah</div>
          </div>
          <div className="stat-card safe">
            <div className="stat-value">{summary.safeAreaPct}%</div>
            <div className="stat-label">Area terpantau aman</div>
          </div>
          <div className="stat-card high full">
            <div className="stat-value">{volcanoSummary.awas + volcanoSummary.siaga}</div>
            <div className="stat-label">Gunung berapi status Siaga/Awas</div>
          </div>
        </div>
      </div>

      <div>
        <div className="sidebar-section-title">Lapisan peta</div>
        <div className="filter-list">
          {layerToggles.map((l) => (
            <label className="filter-row layer-row" key={l.key}>
              <span>{l.label}</span>
              <input
                type="checkbox"
                checked={layers[l.key]}
                onChange={() => onToggleLayer(l.key)}
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="sidebar-section-title">Saring hotspot</div>
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

      <div>
        <div className="sidebar-section-title">Gunung berapi</div>
        <div className="filter-list">
          {sortedVolcanoes.map((v) => (
            <div
              key={v.id}
              className="filter-row volcano-row"
              onClick={() => onSelectVolcano(v.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectVolcano(v.id)}
            >
              <span>{v.name}</span>
              <span className="volcano-level" style={{ color: v.levelColor }}>
                {v.levelLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="sidebar-section-title">Legenda</div>
        <div className="legend">
          <div className="legend-row">
            <span className="legend-dot" style={{ background: "var(--risk-high)" }} />
            Hotspot risiko tinggi
          </div>
          <div className="legend-row">
            <span className="legend-dot" style={{ background: "var(--risk-medium)" }} />
            Hotspot risiko sedang
          </div>
          <div className="legend-row">
            <span className="legend-dot" style={{ background: "var(--risk-low)" }} />
            Hotspot risiko rendah
          </div>
          <div className="legend-row">
            <span className="legend-tri" />
            Gunung berapi (warna = status)
          </div>
          <div className="legend-row">
            <span className="legend-line" />
            Arah aliran angin (ilustratif)
          </div>
        </div>
      </div>

      <div className="sidebar-note">
        Fire Risk Score dihitung dari confidence satelit, keberadaan asap, riwayat kemunculan berulang, dan jenis
        tutupan lahan. Status gunung berapi dan medan angin di peta ini adalah data contoh, bukan data resmi
        real-time &mdash; verifikasi lapangan dan sumber resmi tetap diperlukan.
      </div>
    </aside>
  );
}
