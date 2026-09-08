import { useMemo, useState, useEffect } from "react";
import "./App.css";
import { hotspots as allHotspots, summary } from "./data/hotspots";
import { volcanoes, volcanoSummary } from "./data/volcanoes";
import { aqiStations, aqiSummary, getAqiCategory } from "./data/airQuality";
import { formatClock } from "./utils/geo";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import HotspotTicker from "./components/HotspotTicker";
import DetailDrawer from "./components/DetailDrawer";
import VolcanoDrawer from "./components/VolcanoDrawer";
import AQIDrawer from "./components/AQIDrawer";
import AlertBanner from "./components/AlertBanner";
import CCTVViewer from "./components/CCTVViewer";

const TABS = [
  { key: "map", label: "Peta & AQI", icon: "radar" },
  { key: "aqi", label: "Kualitas Udara", icon: "air" },
  { key: "incidents", label: "Karhutla & Gunung", icon: "warning" },
  { key: "broadcast", label: "Siaran", icon: "sensors" },
];

function PlaceholderPanel({ icon, title, text }) {
  return (
    <div className="placeholder-panel">
      <span className="msi placeholder-icon">{icon}</span>
      <div className="placeholder-title">{title}</div>
      <p className="placeholder-text">{text}</p>
    </div>
  );
}

// Panel Peringkat Kualitas Udara Kota ala IQAir
function AQIPanel({ stations, onSelectStation }) {
  const [search, setSearch] = useState("");
  const sorted = useMemo(() => [...stations].sort((a, b) => b.aqi - a.aqi), [stations]);
  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (s) => s.city.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  return (
    <div className="aqi-panel">
      <div className="aqi-panel-header">
        <div className="aqi-panel-title">
          <span className="msi">air</span>
          <span>Peringkat Kualitas Udara Kota di Indonesia</span>
        </div>
        <p className="aqi-panel-subtitle">
          Data langsung dari stasiun pemantau US AQI terintegrasi pemantauan karhutla
        </p>

        <div className="aqi-search-box">
          <span className="msi">search</span>
          <input
            type="text"
            placeholder="Cari kota atau stasiun pemantau..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="aqi-stat-summary-bar">
        <div className="aqi-summary-badge">
          <span className="aqi-sb-label">Rata-rata AQI</span>
          <span className="aqi-sb-val">{aqiSummary.averageAqi}</span>
        </div>
        <div className="aqi-summary-badge warn">
          <span className="aqi-sb-label">Kota Terpolusi</span>
          <span className="aqi-sb-val">{aqiSummary.mostPollutedCity?.city} ({aqiSummary.mostPollutedCity?.aqi})</span>
        </div>
        <div className="aqi-summary-badge good">
          <span className="aqi-sb-label">Kota Terbersih</span>
          <span className="aqi-sb-val">{aqiSummary.cleanestCity?.city} ({aqiSummary.cleanestCity?.aqi})</span>
        </div>
      </div>

      <div className="aqi-ranking-table">
        {filtered.map((s, idx) => {
          const tier = getAqiCategory(s.aqi);
          return (
            <div
              key={s.id}
              className="aqi-ranking-card"
              onClick={() => onSelectStation(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectStation(s.id)}
            >
              <span className="aqi-rank-num">#{idx + 1}</span>
              <div className="aqi-rank-details">
                <div className="aqi-rank-city">{s.city}</div>
                <div className="aqi-rank-station">{s.name}, {s.province}</div>
                <div className="aqi-rank-pollutant">
                  Polutan utama: {s.primaryPollutant} ({s.pm25} µg/m³) &middot; {s.weather.temp}°C
                </div>
              </div>
              <div className="aqi-rank-score-wrap">
                <div
                  className="aqi-rank-badge"
                  style={{ backgroundColor: tier.color, color: tier.textColor }}
                >
                  {s.aqi}
                </div>
                <span className="aqi-rank-tier" style={{ color: tier.color }}>
                  {tier.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IncidentsPanel({ hotspots, volcanoes, selectedId, onSelectHotspot, onSelectVolcano, nowMs }) {
  const sortedVolcanoes = [...volcanoes].sort((a, b) => b.level - a.level);
  return (
    <div className="incidents-panel">
      <HotspotTicker hotspots={hotspots} selectedId={selectedId} onSelect={onSelectHotspot} nowMs={nowMs} expanded />
      <div className="incidents-volcanoes">
        <div className="section-label">
          <span className="msi">volcano</span> Status gunung berapi
        </div>
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
              <span className="tier-pill" style={{ "--tier-color": v.levelColor }}>
                {v.levelLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null); // { kind: 'hotspot' | 'volcano' | 'aqi', id }
  const [dismissedAlerts, setDismissedAlerts] = useState({});
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [viewingCctv, setViewingCctv] = useState(null);
  const [layers, setLayers] = useState({
    showAQI: true,
    showAQIHeatmap: true,
    showHotspots: true,
    showVolcanoes: true,
    showWind: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return allHotspots;
    return allHotspots.filter((h) => h.risk === filter);
  }, [filter]);

  const selectedHotspot =
    selected?.kind === "hotspot" ? allHotspots.find((h) => h.id === selected.id) || null : null;
  const selectedVolcano =
    selected?.kind === "volcano" ? volcanoes.find((v) => v.id === selected.id) || null : null;
  const selectedStation =
    selected?.kind === "aqi" ? aqiStations.find((s) => s.id === selected.id) || null : null;

  const topHotspotAlert = useMemo(
    () => [...allHotspots].filter((h) => h.risk === "high").sort((a, b) => b.score - a.score)[0],
    []
  );
  const topVolcanoAlert = useMemo(
    () => [...volcanoes].filter((v) => v.level >= 3).sort((a, b) => b.level - a.level)[0],
    []
  );

  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSelectStation = (id) => {
    setSelected(id ? { kind: "aqi", id } : null);
    if (id && activeTab !== "map") {
      setActiveTab("map");
    }
  };

  return (
    <div className="app">
      {/* Mobile Backdrops */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop active"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      {selected && (
        <div
          className="drawer-backdrop active"
          onClick={() => setSelected(null)}
          aria-hidden="true"
        />
      )}

      <header className="topbar">
        <div className="brand">
          <button
            className="topbar-menu-toggle icon-btn"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Buka menu navigasi"
          >
            <span className="msi">menu</span>
          </button>
          <span className="brand-icon">
            <span className="msi">local_fire_department</span>
          </span>
          <div className="brand-text">
            <span className="brand-name">
              FIREWATCH <span className="brand-name-accent">AQI</span>
            </span>
            <span className="brand-tagline">Peta Kualitas Udara, Karhutla &amp; Vulkanik</span>
          </div>
          <span className="live-badge">
            <span className="dot" />
            LIVE
          </span>
        </div>

        <div className="topbar-actions">
          <div className="topbar-aqi-chip" onClick={() => setActiveTab("aqi")} role="button" tabIndex={0}>
            <span className="topbar-aqi-dot" />
            <span>AQI Rata-rata: <strong>{aqiSummary.averageAqi}</strong></span>
          </div>
          <span className="topbar-meta-item">
            <span className="sync-dot" />
            {formatClock(summary.lastSync)} WIB
          </span>
          <button
            className="icon-btn sidebar-desktop-toggle"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Tampilkan/sembunyikan panel telemetri"
            title="Panel telemetri"
          >
            <span className="msi">tune</span>
          </button>
        </div>
      </header>

      {!dismissedAlerts.hotspot && topHotspotAlert && (
        <AlertBanner
          title="Peringatan dini — hotspot risiko tinggi."
          message={`${topHotspotAlert.province}, ${topHotspotAlert.district} · skor ${topHotspotAlert.score}/100.`}
          onView={() => setSelected({ kind: "hotspot", id: topHotspotAlert.id })}
          onDismiss={() => setDismissedAlerts((p) => ({ ...p, hotspot: true }))}
        />
      )}

      {!dismissedAlerts.volcano && topVolcanoAlert && (
        <AlertBanner
          title={`Status gunung berapi — ${topVolcanoAlert.levelLabel}.`}
          message={`${topVolcanoAlert.name}, ${topVolcanoAlert.province} · radius bahaya ${topVolcanoAlert.exclusionRadiusKm} km.`}
          onView={() => setSelected({ kind: "volcano", id: topVolcanoAlert.id })}
          onDismiss={() => setDismissedAlerts((p) => ({ ...p, volcano: true }))}
        />
      )}

      <div
        className={`layout${selected ? " with-drawer" : ""}${sidebarOpen ? " sidebar-open" : " sidebar-collapsed"}`}
      >
        <Sidebar
          summary={summary}
          volcanoSummary={volcanoSummary}
          filter={filter}
          onFilterChange={setFilter}
          layers={layers}
          onToggleLayer={toggleLayer}
          volcanoes={volcanoes}
          onSelectVolcano={(id) => setSelected({ kind: "volcano", id })}
          onSelectStation={handleSelectStation}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        <div className="map-column">
          {activeTab === "map" && (
            <>
              <div className="map-wrap-outer">
                <MapView
                  hotspots={filtered}
                  volcanoes={volcanoes}
                  aqiStations={aqiStations}
                  selected={selected}
                  onSelectHotspot={(id) => setSelected(id ? { kind: "hotspot", id } : null)}
                  onSelectVolcano={(id) => setSelected(id ? { kind: "volcano", id } : null)}
                  onSelectStation={handleSelectStation}
                  showHotspots={layers.showHotspots}
                  showVolcanoes={layers.showVolcanoes}
                  showWind={layers.showWind}
                  showAQI={layers.showAQI}
                  showAQIHeatmap={layers.showAQIHeatmap}
                  resetKey={resetKey}
                  onToggleSidebar={() => setSidebarOpen((s) => !s)}
                />

                <div className="map-toolbar">
                  <button
                    className="map-tool-btn"
                    onClick={() => setSidebarOpen((s) => !s)}
                    title="Lapisan & Telemetri"
                    aria-label="Lapisan & Telemetri"
                  >
                    <span className="msi">layers</span>
                  </button>
                  <button
                    className="map-tool-btn"
                    onClick={() => setResetKey((k) => k + 1)}
                    title="Pusatkan peta Indonesia"
                    aria-label="Pusatkan peta"
                  >
                    <span className="msi">my_location</span>
                  </button>
                </div>
              </div>
              <HotspotTicker
                hotspots={filtered}
                selectedId={selectedHotspot?.id}
                onSelect={(id) => setSelected(id ? { kind: "hotspot", id } : null)}
                nowMs={nowMs}
              />
            </>
          )}

          {activeTab === "aqi" && (
            <AQIPanel stations={aqiStations} onSelectStation={handleSelectStation} />
          )}

          {activeTab === "incidents" && (
            <IncidentsPanel
              hotspots={filtered}
              volcanoes={volcanoes}
              selectedId={selectedHotspot?.id}
              onSelectHotspot={(id) => setSelected(id ? { kind: "hotspot", id } : null)}
              onSelectVolcano={(id) => setSelected({ kind: "volcano", id })}
              nowMs={nowMs}
            />
          )}

          {activeTab === "broadcast" && (
            <PlaceholderPanel
              icon="sensors"
              title="Siaran Darurat Terpadu"
              text="Kanal siaran darurat terpadu mencakup peringatan polusi udara ekstrem, zona evakuasi karhutla, dan bahaya vulkanik MAGMA."
            />
          )}
        </div>

        {/* Laci Detail Stasiun AQI ala IQAir */}
        {selectedStation && (
          <AQIDrawer station={selectedStation} onClose={() => setSelected(null)} />
        )}

        {/* Laci Detail Hotspot */}
        {selectedHotspot && (
          <DetailDrawer
            hotspot={selectedHotspot}
            onClose={() => setSelected(null)}
            nowMs={nowMs}
            onViewCctv={(camera) => setViewingCctv(camera)}
          />
        )}

        {/* Laci Detail Gunung Berapi */}
        {selectedVolcano && (
          <VolcanoDrawer volcano={selectedVolcano} onClose={() => setSelected(null)} />
        )}
      </div>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`bottom-nav-btn${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            <span className="msi">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {viewingCctv && (
        <CCTVViewer camera={viewingCctv} hotspot={selectedHotspot} onClose={() => setViewingCctv(null)} />
      )}
    </div>
  );
}

export default App;
