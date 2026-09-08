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
          <span className="brand-mark" />
          <span className="brand-name">FireWatch</span>
          <span className="brand-tagline">Deteksi &amp; verifikasi dini karhutla &amp; aktivitas gunung berapi</span>
        </div>
        <div className="topbar-meta">
          <span>
            <span className="sync-dot" />
            Sinkron terakhir {formatClock(summary.lastSync)} WIB
          </span>
          <span>{summary.total} hotspot aktif</span>
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

      <div className={`layout${selected ? " with-drawer" : ""}`}>
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
          <MapView
            hotspots={filtered}
            volcanoes={volcanoes}
            selected={selected}
            onSelectHotspot={(id) => setSelected(id ? { kind: "hotspot", id } : null)}
            onSelectVolcano={(id) => setSelected(id ? { kind: "volcano", id } : null)}
            showHotspots={layers.showHotspots}
            showVolcanoes={layers.showVolcanoes}
            showWind={layers.showWind}
          />
          <HotspotTicker
            hotspots={filtered}
            selectedId={selectedHotspot?.id}
            onSelect={(id) => setSelected(id ? { kind: "hotspot", id } : null)}
            nowMs={nowMs}
          />
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

      {viewingCctv && (
        <CCTVViewer camera={viewingCctv} hotspot={selectedHotspot} onClose={() => setViewingCctv(null)} />
      )}
    </div>
  );
}

export default App;
