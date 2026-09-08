import { useMemo, useState, useEffect } from "react";
import "./App.css";
import { hotspots as allHotspots, summary } from "./data/hotspots";
import { volcanoes, volcanoSummary } from "./data/volcanoes";
import { formatClock } from "./utils/geo";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import HotspotTicker from "./components/HotspotTicker";
import DetailDrawer from "./components/DetailDrawer";
import VolcanoDrawer from "./components/VolcanoDrawer";
import AlertBanner from "./components/AlertBanner";
import CCTVViewer from "./components/CCTVViewer";

const TABS = [
  { key: "map", label: "Map Radar", icon: "radar" },
  { key: "incidents", label: "Incidents", icon: "warning" },
  { key: "shelters", label: "Shelters", icon: "home_pin" },
  { key: "broadcast", label: "Broadcast", icon: "sensors" },
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
  const [selected, setSelected] = useState(null); // { kind: 'hotspot' | 'volcano', id }
  const [dismissedAlerts, setDismissedAlerts] = useState({});
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [viewingCctv, setViewingCctv] = useState(null);
  const [layers, setLayers] = useState({
    showHotspots: true,
    showVolcanoes: true,
    showWind: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const topHotspotAlert = useMemo(
    () => [...allHotspots].filter((h) => h.risk === "high").sort((a, b) => b.score - a.score)[0],
    []
  );
  const topVolcanoAlert = useMemo(
    () => [...volcanoes].filter((v) => v.level >= 3).sort((a, b) => b.level - a.level)[0],
    []
  );

  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">
            <span className="msi">local_fire_department</span>
          </span>
          <div className="brand-text">
            <span className="brand-name">
              FIREWATCH <span className="brand-name-accent">ID</span>
            </span>
            <span className="brand-tagline">Deteksi &amp; verifikasi dini karhutla &amp; gunung berapi</span>
          </div>
          <span className="live-badge">
            <span className="dot" />
            LIVE
          </span>
        </div>
        <div className="topbar-actions">
          <span className="topbar-meta-item">
            <span className="sync-dot" />
            Sinkron {formatClock(summary.lastSync)} WIB
          </span>
          <span className="topbar-meta-item topbar-meta-count">{summary.total} hotspot aktif</span>
          <button
            className="icon-btn"
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
          message={`${topHotspotAlert.province}, ${topHotspotAlert.district} · skor ${topHotspotAlert.score}/100 · ${topHotspotAlert.cctv.length} CCTV dalam radius pemantauan.`}
          onView={() => setSelected({ kind: "hotspot", id: topHotspotAlert.id })}
          onDismiss={() => setDismissedAlerts((p) => ({ ...p, hotspot: true }))}
        />
      )}

      {!dismissedAlerts.volcano && topVolcanoAlert && (
        <AlertBanner
          title={`Status gunung berapi — ${topVolcanoAlert.levelLabel}.`}
          message={`${topVolcanoAlert.name}, ${topVolcanoAlert.province} · radius bahaya ${topVolcanoAlert.exclusionRadiusKm} km. Data contoh, cek MAGMA Indonesia untuk status resmi.`}
          onView={() => setSelected({ kind: "volcano", id: topVolcanoAlert.id })}
          onDismiss={() => setDismissedAlerts((p) => ({ ...p, volcano: true }))}
        />
      )}

      <div
        className={`layout${selected ? " with-drawer" : ""}${sidebarOpen ? "" : " sidebar-collapsed"}`}
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
        />

        <div className="map-column">
          {activeTab === "map" && (
            <>
              <div className="map-wrap-outer">
                <MapView
                  hotspots={filtered}
                  volcanoes={volcanoes}
                  selected={selected}
                  onSelectHotspot={(id) => setSelected(id ? { kind: "hotspot", id } : null)}
                  onSelectVolcano={(id) => setSelected(id ? { kind: "volcano", id } : null)}
                  showHotspots={layers.showHotspots}
                  showVolcanoes={layers.showVolcanoes}
                  showWind={layers.showWind}
                  resetKey={resetKey}
                />
                <div className="map-toolbar">
                  <button
                    className="map-tool-btn"
                    onClick={() => setSidebarOpen((s) => !s)}
                    title="Lapisan peta"
                    aria-label="Lapisan peta"
                  >
                    <span className="msi">layers</span>
                  </button>
                  <button
                    className="map-tool-btn"
                    onClick={() => setResetKey((k) => k + 1)}
                    title="Pusatkan peta"
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

          {activeTab === "shelters" && (
            <PlaceholderPanel
              icon="home_pin"
              title="Pos Pengungsian & Rute Evakuasi"
              text="Direktori lokasi pengungsian, kapasitas, dan rute evakuasi terverifikasi akan tersedia di iterasi berikutnya — terhubung ke data BPBD/BNPB setempat."
            />
          )}

          {activeTab === "broadcast" && (
            <PlaceholderPanel
              icon="sensors"
              title="Siaran Darurat"
              text="Kanal siaran darurat terpadu (SOS, radio komunitas, dan notifikasi push) sedang dalam pengembangan untuk menjangkau warga di zona bahaya secara real-time."
            />
          )}
        </div>

        {selectedHotspot && (
          <DetailDrawer
            hotspot={selectedHotspot}
            onClose={() => setSelected(null)}
            nowMs={nowMs}
            onViewCctv={(camera) => setViewingCctv(camera)}
          />
        )}

        {selectedVolcano && <VolcanoDrawer volcano={selectedVolcano} onClose={() => setSelected(null)} />}
      </div>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`bottom-nav-btn${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            <span className="msi">{t.icon}</span>
            {t.label}
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
