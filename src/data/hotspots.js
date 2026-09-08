// Mock data shaped like a real satellite active-fire feed (VIIRS/FIRMS-style fields)
// plus the derived risk, CCTV, and road-access layers described in the project brief.
// lat/lon are approximate real locations across Indonesia's fire-prone provinces.

export const REGION_BOUNDS = {
  // bounding box used to project lat/lon onto the SVG map
  lonMin: 95,
  lonMax: 141,
  latMin: -11,
  latMax: 6,
};

const riskFromScore = (score) => {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
};

const rawHotspots = [
  {
    id: "HS-2309",
    province: "Kalimantan Tengah",
    district: "Pulang Pisau",
    lat: -2.789,
    lon: 114.29,
    acquired: "2026-09-08T08:42:00+07:00",
    confidence: 87,
    frp: 42.6, // fire radiative power, MW
    satellite: "Suomi NPP / VIIRS",
    landCover: "Lahan gambut & semak",
    score: 91,
    smoke: true,
    recurring: true,
    distanceToRoadKm: 2.3,
    cctv: [
      { id: "CCTV-01", label: "Pos Pantau Pulang Pisau", distanceKm: 2.1, status: "online" },
      { id: "CCTV-02", label: "Simpang Jalan Trans Kalimantan", distanceKm: 3.7, status: "online" },
    ],
    roads: [
      { name: "Jalan Trans Kalimantan (A)", status: "padat" },
      { name: "Jalan Desa Henda (B)", status: "lancar" },
    ],
    timeline: [
      { time: "08:20", label: "Hotspot pertama terdeteksi", risk: 58 },
      { time: "09:00", label: "Hotspot menetap, ukuran stabil", risk: 64 },
      { time: "10:00", label: "Confidence naik, asap terdeteksi", risk: 78 },
      { time: "12:00", label: "Area meluas ~1.4 ha", risk: 88 },
      { time: "14:00", label: "Risiko meningkat tajam", risk: 91 },
    ],
  },
  {
    id: "HS-2310",
    province: "Sumatera Selatan",
    district: "Ogan Komering Ilir",
    lat: -3.02,
    lon: 105.86,
    acquired: "2026-09-08T09:05:00+07:00",
    confidence: 79,
    frp: 31.2,
    satellite: "NOAA-20 / VIIRS",
    landCover: "Perkebunan & lahan gambut",
    score: 74,
    smoke: true,
    recurring: false,
    distanceToRoadKm: 4.1,
    cctv: [{ id: "CCTV-08", label: "Pos Damkarhut OKI", distanceKm: 5.4, status: "online" }],
    roads: [{ name: "Jalan Lintas Timur Sumatera", status: "lancar" }],
    timeline: [
      { time: "08:50", label: "Hotspot terdeteksi", risk: 52 },
      { time: "09:05", label: "Confidence tinggi, asap tipis", risk: 74 },
    ],
  },
  {
    id: "HS-2311",
    province: "Riau",
    district: "Bengkalis",
    lat: 1.46,
    lon: 101.87,
    acquired: "2026-09-08T07:58:00+07:00",
    confidence: 63,
    frp: 12.4,
    satellite: "Suomi NPP / VIIRS",
    landCover: "Lahan gambut",
    score: 48,
    smoke: false,
    recurring: false,
    distanceToRoadKm: 6.8,
    cctv: [],
    roads: [{ name: "Jalan Kabupaten Bengkalis", status: "ditutup" }],
    timeline: [{ time: "07:58", label: "Hotspot terdeteksi, belum terverifikasi", risk: 48 }],
  },
  {
    id: "HS-2312",
    province: "Kalimantan Barat",
    district: "Ketapang",
    lat: -1.85,
    lon: 110.13,
    acquired: "2026-09-08T06:40:00+07:00",
    confidence: 55,
    frp: 8.1,
    satellite: "NOAA-21 / VIIRS",
    landCover: "Hutan sekunder",
    score: 33,
    smoke: false,
    recurring: false,
    distanceToRoadKm: 9.2,
    cctv: [],
    roads: [],
    timeline: [{ time: "06:40", label: "Hotspot terdeteksi", risk: 33 }],
  },
  {
    id: "HS-2313",
    province: "Jambi",
    district: "Muaro Jambi",
    lat: -1.61,
    lon: 103.61,
    acquired: "2026-09-08T09:22:00+07:00",
    confidence: 82,
    frp: 27.9,
    satellite: "Suomi NPP / VIIRS",
    landCover: "Lahan gambut & semak",
    score: 68,
    smoke: true,
    recurring: true,
    distanceToRoadKm: 3.4,
    cctv: [{ id: "CCTV-14", label: "Pos Pantau Muaro Jambi", distanceKm: 4.0, status: "offline" }],
    roads: [{ name: "Jalan Lintas Sumatera (Jambi)", status: "lancar" }],
    timeline: [
      { time: "08:00", label: "Hotspot terdeteksi", risk: 44 },
      { time: "09:22", label: "Asap terdeteksi, confidence naik", risk: 68 },
    ],
  },
  {
    id: "HS-2314",
    province: "Kalimantan Tengah",
    district: "Kapuas",
    lat: -2.99,
    lon: 114.38,
    acquired: "2026-09-08T05:15:00+07:00",
    confidence: 40,
    frp: 5.6,
    satellite: "NOAA-20 / VIIRS",
    landCover: "Semak belukar",
    score: 21,
    smoke: false,
    recurring: false,
    distanceToRoadKm: 11.5,
    cctv: [],
    roads: [],
    timeline: [{ time: "05:15", label: "Hotspot kecil terdeteksi", risk: 21 }],
  },
  {
    id: "HS-2315",
    province: "Papua Selatan",
    district: "Merauke",
    lat: -8.47,
    lon: 140.4,
    acquired: "2026-09-08T04:30:00+07:00",
    confidence: 71,
    frp: 19.8,
    satellite: "Suomi NPP / VIIRS",
    landCover: "Savana",
    score: 56,
    smoke: false,
    recurring: false,
    distanceToRoadKm: 14.7,
    cctv: [],
    roads: [],
    timeline: [{ time: "04:30", label: "Hotspot terdeteksi di savana", risk: 56 }],
  },
];

// ---------------------------------------------------------------------------
// Dense generated hotspot field
//
// A handful of hand-authored hotspots (above) carry full detail — CCTV, road
// access, a multi-step timeline — to show what a fully verified record looks
// like. Real satellite feeds during peak karhutla season show dozens to
// hundreds of points clustered over peatland districts, so the rest of the
// dataset is generated around known fire-prone clusters with a seeded random
// generator (deterministic, so the demo looks the same on every load).
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(19820804);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const CLUSTERS = [
  {
    province: "Kalimantan Tengah",
    districts: ["Pulang Pisau", "Kapuas", "Kotawaringin Timur", "Katingan", "Seruyan"],
    center: [-2.3, 113.9],
    spread: 0.9,
    count: 22,
    landCover: ["Lahan gambut", "Lahan gambut & semak", "Semak belukar"],
  },
  {
    province: "Riau",
    districts: ["Bengkalis", "Rokan Hilir", "Pelalawan", "Siak", "Indragiri Hilir"],
    center: [1.0, 101.6],
    spread: 0.8,
    count: 18,
    landCover: ["Lahan gambut", "Perkebunan & lahan gambut", "Semak belukar"],
  },
  {
    province: "Sumatera Selatan",
    districts: ["Ogan Komering Ilir", "Banyuasin", "Musi Banyuasin"],
    center: [-3.0, 104.8],
    spread: 0.7,
    count: 16,
    landCover: ["Perkebunan & lahan gambut", "Lahan gambut", "Semak belukar"],
  },
  {
    province: "Kalimantan Barat",
    districts: ["Ketapang", "Kubu Raya", "Sintang", "Kayong Utara"],
    center: [-0.6, 110.4],
    spread: 0.9,
    count: 14,
    landCover: ["Hutan sekunder", "Lahan gambut", "Semak belukar"],
  },
  {
    province: "Jambi",
    districts: ["Muaro Jambi", "Tanjung Jabung Timur", "Tanjung Jabung Barat"],
    center: [-1.5, 103.5],
    spread: 0.6,
    count: 12,
    landCover: ["Lahan gambut & semak", "Perkebunan"],
  },
  {
    province: "Kalimantan Selatan",
    districts: ["Banjar", "Hulu Sungai Selatan", "Tanah Laut"],
    center: [-3.0, 115.2],
    spread: 0.6,
    count: 9,
    landCover: ["Semak belukar", "Hutan sekunder"],
  },
  {
    province: "Sumatera Utara",
    districts: ["Labuhanbatu", "Labuhanbatu Selatan"],
    center: [2.0, 99.9],
    spread: 0.4,
    count: 6,
    landCover: ["Perkebunan", "Semak belukar"],
  },
  {
    province: "Papua Selatan",
    districts: ["Merauke"],
    center: [-8.4, 140.3],
    spread: 0.5,
    count: 5,
    landCover: ["Savana"],
  },
];

let genCounter = 100;
const generated = [];

for (const cluster of CLUSTERS) {
  for (let i = 0; i < cluster.count; i += 1) {
    genCounter += 1;
    const lat = cluster.center[0] + (rand() - 0.5) * cluster.spread;
    const lon = cluster.center[1] + (rand() - 0.5) * cluster.spread;
    const confidence = Math.round(30 + rand() * 65);
    const frp = Math.round((2 + rand() * 55) * 10) / 10;
    const smoke = rand() > 0.55;
    const recurring = rand() > 0.7;
    const hourAgo = rand() * 9;
    const acquired = new Date(Date.now() - hourAgo * 3600 * 1000).toISOString();

    let score = Math.round(
      confidence * 0.45 + Math.min(frp, 60) * 0.7 + (smoke ? 12 : 0) + (recurring ? 10 : 0) + rand() * 8
    );
    score = Math.max(8, Math.min(97, score));

    const hasInfra = rand() > 0.72;
    const distanceToRoadKm = Math.round((1.5 + rand() * 14) * 10) / 10;

    generated.push({
      id: `HS-${genCounter}`,
      province: cluster.province,
      district: pick(cluster.districts),
      lat: Math.round(lat * 1000) / 1000,
      lon: Math.round(lon * 1000) / 1000,
      acquired,
      confidence,
      frp,
      satellite: pick(["Suomi NPP / VIIRS", "NOAA-20 / VIIRS", "NOAA-21 / VIIRS"]),
      landCover: pick(cluster.landCover),
      score,
      smoke,
      recurring,
      distanceToRoadKm,
      cctv: hasInfra
        ? [
            {
              id: `CCTV-${genCounter}`,
              label: `Pos Pantau ${pick(cluster.districts)}`,
              distanceKm: Math.round((1 + rand() * 6) * 10) / 10,
              status: rand() > 0.25 ? "online" : "offline",
            },
          ]
        : [],
      roads: hasInfra
        ? [{ name: `Jalan Kabupaten ${pick(cluster.districts)}`, status: pick(["lancar", "padat", "ditutup"]) }]
        : [],
      timeline: [
        { time: "—", label: "Hotspot terdeteksi dari citra satelit", risk: Math.max(15, score - 15) },
        { time: "—", label: smoke ? "Asap terindikasi pada citra terbaru" : "Belum ada indikasi asap", risk: score },
      ],
    });
  }
}

export const hotspots = [...rawHotspots, ...generated].map((h) => ({ ...h, risk: riskFromScore(h.score) }));

export const summary = {
  total: hotspots.length,
  high: hotspots.filter((h) => h.risk === "high").length,
  medium: hotspots.filter((h) => h.risk === "medium").length,
  low: hotspots.filter((h) => h.risk === "low").length,
  safeAreaPct: 98.4,
  lastSync: "2026-09-08T09:22:00+07:00",
};
