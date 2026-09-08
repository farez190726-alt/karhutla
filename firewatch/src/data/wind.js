// Contoh medan angin sederhana (bukan data meteorologi real-time). Tiap titik
// kontrol punya arah datang angin (derajat meteorologi, 0 = dari utara, 90 = dari
// timur, dst) dan kecepatan (km/jam). windVectorAt() melakukan interpolasi jarak
// terbalik (inverse distance weighting) antar titik kontrol supaya arah angin
// terlihat mengalir mulus di seluruh peta.

export const WIND_CONTROL_POINTS = [
  { lat: 5, lon: 96, dirDeg: 60, speed: 14 },
  { lat: 1, lon: 101, dirDeg: 70, speed: 18 },
  { lat: -1, lon: 104, dirDeg: 80, speed: 20 },
  { lat: -3, lon: 106, dirDeg: 95, speed: 16 },
  { lat: -1, lon: 111, dirDeg: 110, speed: 12 },
  { lat: -3, lon: 114, dirDeg: 130, speed: 15 },
  { lat: -6, lon: 108, dirDeg: 150, speed: 10 },
  { lat: -7.5, lon: 113, dirDeg: 160, speed: 13 },
  { lat: 0, lon: 122, dirDeg: 40, speed: 11 },
  { lat: -8, lon: 122, dirDeg: 170, speed: 9 },
  { lat: -2, lon: 137, dirDeg: 50, speed: 12 },
];

function toComponents(dirDeg, speed) {
  // meteorological "from" direction -> unit vector pointing where the wind blows TO
  const rad = ((dirDeg + 180) * Math.PI) / 180;
  return { u: Math.sin(rad) * speed, v: Math.cos(rad) * speed };
}

export function windVectorAt(lat, lon) {
  let sumW = 0;
  let u = 0;
  let v = 0;
  for (const p of WIND_CONTROL_POINTS) {
    const dLat = lat - p.lat;
    const dLon = lon - p.lon;
    const distSq = dLat * dLat + dLon * dLon + 0.6; // +0.6 avoids divide-by-zero & over-sharp falloff
    const w = 1 / distSq;
    const { u: pu, v: pv } = toComponents(p.dirDeg, p.speed);
    u += pu * w;
    v += pv * w;
    sumW += w;
  }
  return { u: u / sumW, v: v / sumW };
}
