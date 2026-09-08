export default function AlertBanner({ title, message, onView, onDismiss }) {
  return (
    <div className="alert-banner">
      <span className="alert-banner-icon">
        <span className="msi">warning</span>
      </span>
      <span className="alert-banner-text">
        <strong>{title}</strong> {message}
      </span>
      <button onClick={onView}>Lihat detail</button>
      <button onClick={onDismiss} aria-label="Tutup peringatan">
        <span className="msi">close</span>
      </button>
    </div>
  );
}
