export default function VolcanoDrawer({ volcano, onClose }) {
  if (!volcano) return null;
  const v = volcano;

  return (
    <aside className="drawer">
      <div className="drawer-header">
        <div>
          <div className="drawer-id">{v.id}</div>
          <div className="drawer-title">{v.name}</div>
          <div className="drawer-id">{v.province}</div>
        </div>
        <button className="drawer-close" onClick={onClose} aria-label="Tutup detail">
          &times;
        </button>
      </div>

      <div className="score-block">
        <div
          className="score-number"
          style={{ color: v.levelColor, fontSize: "1.4rem" }}
        >
          {v.levelLabel}
        </div>
        <div className="score-meta">
          <div className="label">Status aktivitas (PVMBG-style)</div>
          <div>Radius bahaya {v.exclusionRadiusKm} km dari puncak</div>
          <div>Aktivitas terakhir dicatat {v.lastActivity}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <div className="k">Koordinat puncak</div>
          <div className="v">{v.lat.toFixed(3)}, {v.lon.toFixed(3)}</div>
        </div>
        <div className="detail-item">
          <div className="k">Ketinggian</div>
          <div className="v">{v.elevation} mdpl</div>
        </div>
        <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
          <div className="k">Pos pemantauan</div>
          <div className="v">{v.monitoringPost}</div>
        </div>
      </div>

      <div>
        <div className="drawer-section-title">Ringkasan aktivitas</div>
        <p className="empty-hint" style={{ color: "var(--text-secondary)" }}>{v.summary}</p>
      </div>

      <p className="drawer-footnote">
        Status di atas adalah <strong>data contoh</strong> untuk keperluan prototipe, bukan status resmi
        real-time. Untuk status resmi dan mutakhir, cek MAGMA Indonesia (Badan Geologi, Kementerian ESDM).
      </p>
    </aside>
  );
}
