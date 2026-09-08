import { getAqiCategory } from "../data/airQuality";

export default function AQIDrawer({ station, onClose }) {
  if (!station) return null;
  const s = station;
  const tier = getAqiCategory(s.aqi);

  // Perbandingan dengan batas panduan tahunan WHO (5 µg/m³ untuk PM2.5)
  const whoRatio = (s.pm25 / 5).toFixed(1);

  return (
    <aside className="drawer aqi-drawer">
      {/* Drag handle untuk mobile bottom sheet */}
      <div className="mobile-drawer-handle" />

      <div className="drawer-header">
        <div>
          <div className="drawer-id">STASIUN PEMANTAU &middot; {s.id}</div>
          <div className="drawer-title">{s.city}</div>
          <div className="drawer-subtitle">{s.name}, {s.province}</div>
        </div>
        <button className="drawer-close" onClick={onClose} aria-label="Tutup detail">
          <span className="msi">close</span>
        </button>
      </div>

      {/* Hero Card AQI ala IQAir */}
      <div
        className="aqi-hero-card"
        style={{
          borderColor: tier.color,
          background: `linear-gradient(135deg, ${tier.color}22 0%, var(--panel) 100%)`,
        }}
      >
        <div className="aqi-hero-badge" style={{ backgroundColor: tier.color, color: tier.textColor }}>
          <span className="aqi-hero-num">{s.aqi}</span>
          <span className="aqi-hero-label">AQI AS</span>
        </div>
        <div className="aqi-hero-info">
          <div className="aqi-hero-tier" style={{ color: tier.color }}>
            <span className="msi">{tier.icon}</span>
            <span>{tier.label}</span>
          </div>
          <div className="aqi-hero-pollutant">
            Polutan utama: <strong>{s.primaryPollutant} ({s.pm25} µg/m³)</strong>
          </div>
          <div className="aqi-hero-who">
            Konsentrasi PM2.5 sebesar <strong>{whoRatio}x</strong> dari panduan tahunan WHO
          </div>
        </div>
      </div>

      {/* Rekomendasi Kesehatan Interaktif ala IQAir */}
      <div>
        <div className="drawer-section-title">
          <span className="msi">health_and_safety</span> Rekomendasi Kesehatan
        </div>
        <div className="aqi-recommendations-grid">
          <div className={`aqi-rec-card ${s.healthRecommendations.mask.needed ? "warn" : "ok"}`}>
            <div className="aqi-rec-icon">
              <span className="msi">masks</span>
            </div>
            <div className="aqi-rec-text">
              <div className="aqi-rec-title">Pakai Masker</div>
              <div className="aqi-rec-sub">{s.healthRecommendations.mask.text}</div>
            </div>
          </div>

          <div className={`aqi-rec-card ${!s.healthRecommendations.windows.open ? "warn" : "ok"}`}>
            <div className="aqi-rec-icon">
              <span className="msi">window</span>
            </div>
            <div className="aqi-rec-text">
              <div className="aqi-rec-title">Jendela & Ventilasi</div>
              <div className="aqi-rec-sub">{s.healthRecommendations.windows.text}</div>
            </div>
          </div>

          <div className={`aqi-rec-card ${s.healthRecommendations.airPurifier.needed ? "warn" : "ok"}`}>
            <div className="aqi-rec-icon">
              <span className="msi">mode_fan</span>
            </div>
            <div className="aqi-rec-text">
              <div className="aqi-rec-title">Pembersih Udara</div>
              <div className="aqi-rec-sub">{s.healthRecommendations.airPurifier.text}</div>
            </div>
          </div>

          <div className={`aqi-rec-card ${!s.healthRecommendations.outdoorActivity.allowed ? "warn" : "ok"}`}>
            <div className="aqi-rec-icon">
              <span className="msi">directions_run</span>
            </div>
            <div className="aqi-rec-text">
              <div className="aqi-rec-title">Aktivitas Luar</div>
              <div className="aqi-rec-sub">{s.healthRecommendations.outdoorActivity.text}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kondisi Cuaca & Atmosfer */}
      <div>
        <div className="drawer-section-title">
          <span className="msi">thermostat</span> Cuaca &amp; Atmosfer Lokal
        </div>
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">device_thermostat</span> Suhu
            </div>
            <div className="telemetry-v">{s.weather.temp}°C</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">humidity_percentage</span> Kelembapan
            </div>
            <div className="telemetry-v">{s.weather.humidity}%</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">air</span> Angin
            </div>
            <div className="telemetry-v">
              {s.weather.windSpeed} <span className="unit">km/h</span> ({s.weather.windDir})
            </div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-k">
              <span className="msi">compress</span> Tekanan
            </div>
            <div className="telemetry-v">{s.weather.pressure} <span className="unit">hPa</span></div>
          </div>
        </div>
      </div>

      {/* Rincian Polutan */}
      <div>
        <div className="drawer-section-title">
          <span className="msi">bar_chart</span> Rincian Konsentrasi Polutan
        </div>
        <div className="pollutant-table">
          <div className="pollutant-row">
            <span className="pollutant-name">PM2.5</span>
            <div className="pollutant-bar-wrap">
              <div
                className="pollutant-bar"
                style={{
                  width: `${Math.min(100, (s.pm25 / 150) * 100)}%`,
                  backgroundColor: tier.color,
                }}
              />
            </div>
            <span className="pollutant-val">{s.pm25} µg/m³</span>
          </div>

          <div className="pollutant-row">
            <span className="pollutant-name">PM10</span>
            <div className="pollutant-bar-wrap">
              <div
                className="pollutant-bar"
                style={{
                  width: `${Math.min(100, (s.pm10 / 250) * 100)}%`,
                  backgroundColor: "#eab308",
                }}
              />
            </div>
            <span className="pollutant-val">{s.pm10} µg/m³</span>
          </div>

          <div className="pollutant-row">
            <span className="pollutant-name">O₃</span>
            <div className="pollutant-bar-wrap">
              <div
                className="pollutant-bar"
                style={{ width: `${Math.min(100, (s.o3 / 100) * 100)}%`, backgroundColor: "#10b981" }}
              />
            </div>
            <span className="pollutant-val">{s.o3} µg/m³</span>
          </div>

          <div className="pollutant-row">
            <span className="pollutant-name">NO₂</span>
            <div className="pollutant-bar-wrap">
              <div
                className="pollutant-bar"
                style={{ width: `${Math.min(100, (s.no2 / 80) * 100)}%`, backgroundColor: "#10b981" }}
              />
            </div>
            <span className="pollutant-val">{s.no2} µg/m³</span>
          </div>

          <div className="pollutant-row">
            <span className="pollutant-name">SO₂</span>
            <div className="pollutant-bar-wrap">
              <div
                className="pollutant-bar"
                style={{ width: `${Math.min(100, (s.so2 / 60) * 100)}%`, backgroundColor: "#f97316" }}
              />
            </div>
            <span className="pollutant-val">{s.so2} µg/m³</span>
          </div>

          <div className="pollutant-row">
            <span className="pollutant-name">CO</span>
            <div className="pollutant-bar-wrap">
              <div
                className="pollutant-bar"
                style={{ width: `${Math.min(100, (s.co / 20) * 100)}%`, backgroundColor: "#10b981" }}
              />
            </div>
            <span className="pollutant-val">{s.co} mg/m³</span>
          </div>
        </div>
      </div>

      {/* Grafik Tren 24 Jam */}
      {s.forecast24h && s.forecast24h.length > 0 && (
        <div>
          <div className="drawer-section-title">
            <span className="msi">show_chart</span> Tren &amp; Proyeksi 24 Jam
          </div>
          <div className="forecast-chart">
            {s.forecast24h.map((f, i) => {
              const fTier = getAqiCategory(f.aqi);
              const barHeight = Math.max(16, Math.min(100, (f.aqi / 250) * 100));
              return (
                <div key={i} className="forecast-col">
                  <div className="forecast-bar-wrap">
                    <span className="forecast-val">{f.aqi}</span>
                    <div
                      className="forecast-bar"
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: fTier.color,
                      }}
                      title={`${f.hour}: AQI ${f.aqi} (${fTier.label})`}
                    />
                  </div>
                  <span className="forecast-time">{f.hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="drawer-footnote">
        Data kualitas udara mengacu pada sensor terkalibrasi dan model asimilasi satelit.
        Indeks menggunakan standar US AQI (Air Quality Index).
      </p>

      <div className="drawer-actions">
        <button className="btn-secondary" onClick={onClose}>
          <span className="msi">check</span> Selesai
        </button>
      </div>
    </aside>
  );
}
