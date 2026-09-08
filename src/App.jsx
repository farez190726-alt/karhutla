import { useMemo, useState, useEffect } from "react";
import "./App.css";
import { hotspots as allHotspots, summary } from "./data/hotspots";
import { formatClock } from "./utils/geo";
import Sidebar from "./components/Sidebar";
import IndonesiaMap from "./components/IndonesiaMap";
import HotspotTicker from "./components/HotspotTicker";
import DetailDrawer from "./components/DetailDrawer";
import AlertBanner from "./components/AlertBanner";

function App() {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return allHotspots;
    return allHotspots.filter((h) => h.risk === filter);
  }, [filter]);

  const selected = allHotspots.find((h) => h.id === selectedId) || null;

  const topAlert = useMemo(
    () => [...allHotspots].filter((h) => h.risk === "high").sort((a, b) => b.score - a.score)[0],
    []
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">FireWatch</span>
          <span className="brand-tagline">Deteksi &amp; verifikasi dini karhutla berbasis satelit</span>
        </div>
        <div className="topbar-meta">
          <span>
            <span className="sync-dot" />
            Sinkron terakhir {formatClock(summary.lastSync)} WIB
          </span>
          <span>{summary.total} hotspot aktif</span>
        </div>
      </header>

      {!alertDismissed && topAlert && (
        <AlertBanner
          hotspot={topAlert}
          onView={() => setSelectedId(topAlert.id)}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      <div className={`layout${selected ? " with-drawer" : ""}`}>
        <Sidebar summary={summary} filter={filter} onFilterChange={setFilter} />

        <div className="map-column">
          <IndonesiaMap
            hotspots={filtered}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
            nowMs={nowMs}
          />
          <HotspotTicker
            hotspots={filtered}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
            nowMs={nowMs}
          />
        </div>

        {selected && <DetailDrawer hotspot={selected} onClose={() => setSelectedId(null)} nowMs={nowMs} />}
      </div>
    </div>
  );
}

export default App;
