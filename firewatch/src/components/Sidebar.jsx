export default function Sidebar({ summary, filter, onFilterChange }) {
  const filters = [
    { key: "all", label: "Semua hotspot", count: summary.total },
    { key: "high", label: "Risiko tinggi", count: summary.high },
    { key: "medium", label: "Risiko sedang", count: summary.medium },
    { key: "low", label: "Risiko rendah", count: summary.low },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-section-title">Ringkasan hari ini</div>
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
          <div className="stat-card safe">
            <div className="stat-value">{summary.safeAreaPct}%</div>
            <div className="stat-label">Area terpantau aman</div>
          </div>
        </div>
      </div>

      <div>
        <div className="sidebar-section-title">Saring peta</div>
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
        <div className="sidebar-section-title">Legenda</div>
        <div className="legend">
          <div className="legend-row">
            <span className="legend-dot" style={{ background: "var(--risk-high)" }} />
            Risiko tinggi &mdash; verifikasi &amp; respons segera
          </div>
          <div className="legend-row">
            <span className="legend-dot" style={{ background: "var(--risk-medium)" }} />
            Risiko sedang &mdash; pantau perkembangan
          </div>
          <div className="legend-row">
            <span className="legend-dot" style={{ background: "var(--risk-low)" }} />
            Risiko rendah &mdash; belum terverifikasi
          </div>
        </div>
      </div>

      <div className="sidebar-note">
        Fire Risk Score dihitung dari confidence satelit, keberadaan asap, riwayat kemunculan berulang, dan jenis
        tutupan lahan. Skor bukan bukti pasti kejadian kebakaran &mdash; verifikasi lapangan tetap diperlukan.
      </div>
    </aside>
  );
}
