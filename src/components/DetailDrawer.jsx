import { formatClock, formatTimeAgo } from "../utils/geo";

const RISK_TIERS = [
  { key: "low", label: "RENDAH" },
  { key: "medium", label: "SEDANG" },
  { key: "high", label: "TINGGI" },
];

const RISK_LABEL = { low: "Rendah", medium: "Sedang", high: "Tinggi" };

export default function DetailDrawer({ hotspot, onClose, nowMs, onViewCctv }) {
  if (!hotspot) return null;
  const h = hotspot;

  return (
    <aside className="drawer">
      <div className="drawer-header">
        <div>
          <div className="drawer-id">SEKTOR &middot; {h.id}</div>
          <div className="drawer-title">{h.province}</div>
          <div className="drawer-id">{h.district}</div>
        </div>
        <button className="drawer-close" onClick={onClose} aria-label="Tutup detail">
          <span className="msi">close</span>
        </button>
      </div>

      <div className="tier-bar">
        {RISK_TIERS.map((t) => (
          <span key={t.key} className={`tier-bar-seg${t.key === h.risk ? " active" : ""}`} data-tier={t.key}>
            {t.label}
          </span>
        ))}
      </div>

      <div className={`status-banner status-${h.risk}`}>
        <span className="status-dot-lg" />
        STATUS RISIKO: {RISK_LABEL[h.risk].toUpperCase()}
        <span className="status-banner-time">Update {formatClock(h.acquired)} WIB</span>
      </div>

      <div className="score-block">
        <div className={`score-number ${h.risk}`}>{h.score}</div>
        <div className="score-meta">
          <div className="label">Fire Risk Score</div>
          <div>Confidence satelit {h.confidence}%</div>
          <div>Terdeteksi {formatClock(h.acquired)} WIB &middot; {formatTimeAgo(h.acquired, nowMs)}</div>
        </div>
      </div>

      <div>
        <div className="drawer-section-title">
          <span className="msi">sensors</span> Telemetri hotspot
        </div>
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">my_location</span> Koordinat
            </div>
            <div className="telemetry-v">
              {h.lat.toFixed(4)}, {h.lon.toFixed(4)}
            </div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">satellite_alt</span> Satelit
            </div>
            <div className="telemetry-v">{h.satellite}</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">local_fire_department</span> Fire Radiative Power
            </div>
            <div className="telemetry-v accent-ember">{h.frp} <span className="unit">MW</span></div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">forest</span> Tutupan lahan
            </div>
            <div className="telemetry-v">{h.landCover}</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">airwave</span> Indikasi asap
            </div>
            <div className="telemetry-v">{h.smoke ? "Terdeteksi" : "Tidak terdeteksi"}</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">history</span> Kemunculan berulang
            </div>
            <div className="telemetry-v">{h.recurring ? "Ya, lokasi sama" : "Tidak"}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="drawer-section-title">
          <span className="msi">videocam</span> CCTV terdekat
        </div>
        {h.cctv.length === 0 ? (
          <p className="empty-hint">Belum ada CCTV publik/berizin dalam radius pemantauan.</p>
        ) : (
          <div className="chip-list">
            {h.cctv.map((c) => (
              <button className="chip cctv-chip" key={c.id} onClick={() => onViewCctv(c)}>
                <span className={`status-dot ${c.status}`} />
                {c.label} &middot; {c.distanceKm} km
                <span className="cctv-chip-action">{c.status === "online" ? "Lihat" : "Cek"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="drawer-section-title">
          <span className="msi">route</span> Akses jalan
        </div>
        {h.roads.length === 0 ? (
          <p className="empty-hint">Data akses jalan di sekitar lokasi belum tersedia.</p>
        ) : (
          <div className="chip-list">
            {h.roads.map((r) => (
              <span className={`chip road ${r.status}`} key={r.name}>
                {r.name} &middot; {r.status}
              </span>
            ))}
          </div>
        )}
        <p className="empty-hint" style={{ marginTop: 8 }}>
          Jarak ke jalan terdekat: {h.distanceToRoadKm} km
        </p>
      </div>

      <div>
        <div className="drawer-section-title">
          <span className="msi">timeline</span> Kronologi &amp; fire tracking
        </div>
        <div className="timeline">
          {h.timeline.map((t, i) => (
            <div className="timeline-row" key={i}>
              <span className="timeline-time">{t.time}</span>
              <span className="timeline-rail">
                <span
                  className="timeline-dot"
                  style={{
                    background: t.risk >= 75 ? "var(--risk-high)" : t.risk >= 45 ? "var(--risk-medium)" : "var(--risk-low)",
                  }}
                />
                <span className="timeline-line" />
              </span>
              <span className="timeline-content">
                <div className="timeline-label">{t.label}</div>
                <div className="timeline-risk">Skor risiko: {t.risk}</div>
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="drawer-footnote">
        Hotspot merupakan lokasi perkiraan anomali termal dari citra satelit, bukan konfirmasi pasti adanya api.
        Gunakan CCTV dan verifikasi lapangan sebelum mengambil tindakan.
      </p>

      <div className="drawer-actions">
        <button className="btn-secondary" onClick={onClose}>
          <span className="msi">visibility</span> Tutup Detail
        </button>
        <button className="btn-danger" disabled title="Simulasi — belum terhubung ke posko siaga">
          <span className="msi">sos</span> SOS Darurat
        </button>
      </div>
    </aside>
  );
}
