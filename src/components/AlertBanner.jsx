export default function AlertBanner({ title, message, onView, onDismiss }) {
  return (
    <div className="alert-banner">
      <span>
        <strong>{title}</strong> {message}
      </span>
      <button onClick={onView}>Lihat detail</button>
      <button onClick={onDismiss} aria-label="Tutup peringatan">
        Tutup
      </button>
    </div>
  );
}
