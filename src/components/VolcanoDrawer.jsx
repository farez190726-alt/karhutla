const LEVEL_TIERS = [
  { level: 1, label: "I NORMAL" },
  { level: 2, label: "II WASPADA" },
  { level: 3, label: "III SIAGA" },
  { level: 4, label: "IV AWAS" },
];

export default function VolcanoDrawer({ volcano, onClose }) {
  if (!volcano) return null;
  const v = volcano;

  return (
    <aside className="drawer">
      <div className="mobile-drawer-handle" />
      <div className="drawer-header">
        <div>
          <div className="drawer-id">{v.id}</div>
          <div className="drawer-title">{v.name}</div>
          <div className="drawer-id">{v.province}</div>
        </div>
        <button className="drawer-close" onClick={onClose} aria-label="Tutup detail">
          <span className="msi">close</span>
        </button>
      </div>

      <div className="tier-bar">
        {LEVEL_TIERS.map((t) => (
          <span
            key={t.level}
            className={`tier-bar-seg${t.level === v.level ? " active" : ""}`}
            data-tier={t.level >= 3 ? "high" : t.level === 2 ? "medium" : "low"}
          >
            {t.label}
          </span>
        ))}
      </div>

      <div
        className={`status-banner status-${v.level >= 4 ? "high" : v.level === 3 ? "ember" : v.level === 2 ? "medium" : "low"}`}
      >
        <span className="status-dot-lg" />
        STATUS LEVEL {v.level}: {v.levelLabel.toUpperCase()}
        <span className="status-banner-time">Aktivitas terakhir {v.lastActivity}</span>
      </div>

      <div className="score-block">
        <div className="score-number" style={{ color: v.levelColor, fontSize: "1.4rem" }}>
          {v.levelLabel}
        </div>
        <div className="score-meta">
          <div className="label">Status aktivitas (PVMBG-style)</div>
          <div>Radius bahaya {v.exclusionRadiusKm} km dari puncak</div>
          <div>Elevasi {v.elevation} mdpl</div>
        </div>
      </div>

      <div>
        <div className="drawer-section-title">
          <span className="msi">explore</span> Telemetri gunung
        </div>
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">my_location</span> Koordinat puncak
            </div>
            <div className="telemetry-v">
              {v.lat.toFixed(3)}, {v.lon.toFixed(3)}
            </div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">landscape</span> Ketinggian
            </div>
            <div className="telemetry-v">{v.elevation} <span className="unit">mdpl</span></div>
          </div>
          <div className="telemetry-card telemetry-card--wide">
            <div className="telemetry-k">
              <span className="msi">radio_button_checked</span> Pos pemantauan
            </div>
            <div className="telemetry-v">{v.monitoringPost}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="drawer-section-title">
          <span className="msi">notifications_active</span> Ringkasan aktivitas
        </div>
        <p className="empty-hint" style={{ color: "var(--text-secondary)" }}>
          {v.summary}
        </p>
      </div>

      <p className="drawer-footnote">
        Status di atas adalah <strong>data contoh</strong> untuk keperluan prototipe, bukan status resmi
        real-time. Untuk status resmi dan mutakhir, cek MAGMA Indonesia (Badan Geologi, Kementerian ESDM).
      </p>

      <div className="drawer-actions">
        <button className="btn-secondary" onClick={onClose}>
          <span className="msi">visibility</span> Tutup Detail
        </button>
        <button className="btn-danger" disabled title="Simulasi — belum terhubung ke posko siaga">
          <span className="msi">sos</span> Zona Evakuasi
        </button>
      </div>
    </aside>
  );
}
