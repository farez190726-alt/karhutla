export default function AlertBanner({ hotspot, onView, onDismiss }) {
  if (!hotspot) return null;
  return (
    <div className="alert-banner">
      <span>
        <strong>Peringatan dini &mdash; risiko tinggi.</strong> {hotspot.province}, {hotspot.district} &middot; skor{" "}
        {hotspot.score}/100 &middot; {hotspot.cctv.length} CCTV dalam radius pemantauan.
      </span>
      <button onClick={onView}>Lihat detail</button>
      <button onClick={onDismiss} aria-label="Tutup peringatan">
        Tutup
      </button>
    </div>
  );
}
