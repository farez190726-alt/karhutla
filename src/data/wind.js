// Medan Aliran Angin Dinamis Nusantara (Realistis & Bervariasi)
// Memodelkan sirkulasi monsun khatulistiwa, pusaran siklonik Samudra Hindia & Laut Cina Selatan,
// efek Coriolis antar-belahan bumi, dan kanal angin kepulauan.
//
// Vektor (u, v):
// u > 0 : angin bertiup ke TIMUR (kanan)
// u < 0 : angin bertiup ke BARAT (kiri)
// v > 0 : angin bertiup ke UTARA (atas)
// v < 0 : angin bertiup ke SELATAN (bawah)

// Pusat pusaran siklonik & sirkulasi regional
const VORTICES = [
  // Pusaran Samudra Hindia (Barat Daya Jawa / Sumatra) - putaran searah jarum jam (BBS)
  { lat: -10.5, lon: 101.0, strength: 14, radius: 6.0, clockwise: 1 },
  // Pusaran Laut Cina Selatan / Laut Natuna - putaran berlawanan jarum jam (BBU)
  { lat: 7.0, lon: 112.0, strength: 12, radius: 6.0, clockwise: -1 },
  // Sel Sirkulasi Laut Banda / Maluku
  { lat: -6.0, lon: 128.0, strength: 11, radius: 5.5, clockwise: 1 },
  // Sel Sirkulasi Pasifik Barat (Utara Papua)
  { lat: 3.0, lon: 139.0, strength: 10, radius: 5.5, clockwise: -1 },
];

// Gelombang sinus & harmonik untuk turbulensi melengkung alami (pseudo-curl noise)
function pseudoCurl(lat, lon) {
  const x = lon * 0.18;
  const y = lat * 0.22;
  const n1 = Math.sin(x + y * 0.6) * Math.cos(x * 0.8 - y);
  const n2 = Math.cos(x * 1.3 - y * 0.7) * Math.sin(x * 0.5 + y * 1.2);
  const uCurl = Math.cos(x * 0.9 + y * 1.1) * 3.5 + n1 * 2.0;
  const vCurl = Math.sin(x * 1.1 - y * 0.8) * 3.5 + n2 * 2.0;
  return { u: uCurl, v: vCurl };
}

/**
 * Menghitung vektor kecepatan angin (u: timur/barat, v: utara/selatan) di koordinat tertentu.
 * Menghasilkan variasi arah yang kaya: ada yang mengalir ke timur laut, tenggara, barat daya,
 * dan melingkar di sekeliling pusat pusaran seperti pada peta cuaca IQAir / Windy.
 */
export function windVectorAt(lat, lon) {
  // 1. Aliran latar belakang monsun khatulistiwa (Cross-Equatorial Monsoon Flow)
  let uBase = 0;
  let vBase = 0;

  if (lat >= 0) {
    const t = Math.min(lat / 8, 1);
    uBase = 3.0 + t * 6.0 * Math.sin(lon * 0.08);
    vBase = 2.0 + t * 4.0 * Math.cos(lon * 0.1);
  } else {
    const s = Math.min(Math.abs(lat) / 10, 1);
    uBase = -1.5 + s * 8.0 * Math.sin((lon - 105) * 0.09);
    vBase = 3.5 + s * 3.0 * Math.cos((lon - 115) * 0.07);
  }

  // Kanal angin Selat Makassar & Selat Karimata
  if (lon > 116 && lon < 120 && lat > -5 && lat < 2) {
    vBase -= 4.0;
    uBase += 2.0;
  }
  if (lon > 106 && lon < 111 && lat > -4 && lat < 1) {
    vBase += 3.0;
    uBase += 2.5;
  }

  // 2. Kontribusi pusaran siklonik (Vortex Swirls)
  let uVortex = 0;
  let vVortex = 0;

  for (const vort of VORTICES) {
    const dLat = lat - vort.lat;
    const dLon = lon - vort.lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);

    if (dist < vort.radius * 2.0) {
      const influence = Math.exp(-(dist * dist) / (vort.radius * vort.radius));
      const speed = vort.strength * influence;

      const angle = Math.atan2(dLat, dLon);
      const perpAngle = angle + (vort.clockwise * Math.PI) / 2;

      uVortex += Math.cos(perpAngle) * speed;
      vVortex += Math.sin(perpAngle) * speed;
    }
  }

  // 3. Turbulensi gelombang alami
  const curl = pseudoCurl(lat, lon);

  let u = uBase + uVortex + curl.u;
  let v = vBase + vVortex + curl.v;

  // Pastikan ada sedikit kelajuan dasar minimum agar partikel tetap meluncur mulus
  const rawSpeed = Math.sqrt(u * u + v * v);
  if (rawSpeed < 2.5) {
    const boost = 2.5 / (rawSpeed + 0.001);
    u *= boost;
    v *= boost;
  }

  return { u, v };
}

/**
 * Menghasilkan informasi kecepatan dan arah mata angin untuk ditampilkan ke pengguna
 */
export function getWindAt(lat, lon) {
  const { u, v } = windVectorAt(lat, lon);
  const speed = Math.sqrt(u * u + v * v);
  const speedKmH = Math.round(speed * 1.6);

  let blowToAngle = (Math.atan2(u, v) * 180) / Math.PI;
  if (blowToAngle < 0) blowToAngle += 360;
  let fromAngle = (blowToAngle + 180) % 360;

  const CARDINALS = [
    "Utara",
    "Timur Laut",
    "Timur",
    "Tenggara",
    "Selatan",
    "Barat Daya",
    "Barat",
    "Barat Laut",
  ];
  const index = Math.round(fromAngle / 45) % 8;
  const cardinal = CARDINALS[index];

  return {
    u,
    v,
    speedKmH: Math.max(speedKmH, 4),
    angleDeg: Math.round(fromAngle),
    cardinal,
    description: `${cardinal} · ${Math.max(speedKmH, 4)} km/jam`,
  };
}
