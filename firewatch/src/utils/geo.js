import { REGION_BOUNDS } from "../data/hotspots";

// Maps geographic lon/lat to the map SVG's 0..1000 / 0..520 viewBox.
export function project(lon, lat) {
  const { lonMin, lonMax, latMin, latMax } = REGION_BOUNDS;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * 1000;
  const y = ((latMax - lat) / (latMax - latMin)) * 520;
  return { x, y };
}

export function formatTimeAgo(isoString, nowMs) {
  const diffMs = nowMs - new Date(isoString).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs} jam ${rem} menit lalu` : `${hrs} jam lalu`;
}

export function formatClock(isoString) {
  return new Date(isoString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
