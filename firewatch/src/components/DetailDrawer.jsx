import { formatClock, formatTimeAgo } from "../utils/geo";

export default function DetailDrawer({ hotspot, onClose, nowMs, onViewCctv }) {
  if (!hotspot) return null;
  const h = hotspot;

  return (
    <aside className="drawer">
      <div className="drawer-header">
        <div>
          <div className="drawer-id">{h.id}</div>
          <div className="drawer-title">{h.province}</div>
          <div className="drawer-id">{h.district}</div>
        </div>
        <button className="drawer-close" onClick={onClose} aria-label="Tutup detail">
          &times;
        </button>
      </div>

      <div className="score-block">
        <div className={`score-number ${h.risk}`}>{h.score}</div>
        <div className="score-meta">
          <div className="label">Fire Risk Score</div>
          <div>Confidence satelit {h.confidence}%</div>
          <div>Terdeteksi {formatClock(h.acquired)} WIB &middot; {formatTimeAgo(h.acquired, nowMs)}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <div className="k">Koordinat</div>
          <div className="v">{h.lat.toFixed(4)}, {h.lon.toFixed(4)}</div>
        </div>
        <div className="detail-item">
          <div className="k">Satelit</div>
          <div className="v">{h.satellite}</div>
        </div>
        <div className="detail-item">
          <div className="k">Fire Radiative Power</div>
          <div className="v">{h.frp} MW</div>
        </div>
        <div className="detail-item">
          <div className="k">Tutupan lahan</div>
          <div className="v">{h.landCover}</div>
        </div>
        <div className="detail-item">
          <div className="k">Indikasi asap</div>
          <div className="v">{h.smoke ? "Terdeteksi" : "Tidak terdeteksi"}</div>
        </div>
        <div className="detail-item">
          <div className="k">Kemunculan berulang</div>
          <div className="v">{h.recurring ? "Ya, lokasi sama" : "Tidak"}</div>
        </div>
      </div>

      <div>
        <div className="drawer-section-title">CCTV terdekat</div>
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
        <div className="drawer-section-title">Akses jalan</div>
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
        <div className="drawer-section-title">Fire tracking timeline</div>
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
    </aside>
  );
}
