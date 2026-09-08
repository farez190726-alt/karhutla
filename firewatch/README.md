# FireWatch — Sistem Monitoring & Deteksi Dini Karhutla

Prototipe dashboard React + Vite untuk proyek Teknik Informatika: memantau hotspot
kebakaran hutan dan lahan (karhutla) menggunakan data ala satelit (VIIRS/FIRMS-style),
skor risiko, CCTV terdekat, dan kondisi akses jalan.

Saat ini semua data di `src/data/hotspots.js` adalah **data contoh (mock)** yang
dibentuk mengikuti struktur data satelit sungguhan, supaya mudah diganti dengan data
asli nanti.

## Menjalankan proyek

```bash
npm install
npm run dev       # mode pengembangan, buka URL yang muncul di terminal
npm run build     # build produksi ke folder dist/
npm run preview   # menjalankan hasil build secara lokal
```

## Struktur proyek

```
src/
  data/hotspots.js         # dataset contoh hotspot (ganti dengan data API asli)
  utils/geo.js              # proyeksi lat/lon ke koordinat peta SVG
  components/
    Sidebar.jsx              # ringkasan statistik + filter risiko
    MapView.jsx               # peta interaktif sungguhan (Leaflet + tile CARTO dark)
    HotspotTicker.jsx         # daftar hotspot terbaru
    DetailDrawer.jsx          # panel detail: skor, CCTV, jalan, timeline
    CCTVViewer.jsx             # modal "tonton" kamera CCTV (simulasi live feed)
    AlertBanner.jsx            # peringatan dini untuk risiko tinggi
  App.jsx                     # menyusun seluruh layout & state
```

## Peta

Peta menggunakan [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/)
dengan tile gratis dari CARTO (`dark_all`, data dasar OpenStreetMap). Peta ini
sungguhan bisa di-zoom/geser, dan marker mengikuti koordinat asli tiap hotspot.
Untuk produksi, pertimbangkan mendaftar tile provider berbayar (mis. Mapbox/MapTiler)
jika trafiknya tinggi, karena tile gratis punya batas wajar pemakaian.

## CCTV

Karena prototipe ini belum terhubung ke kamera sungguhan, tombol **Lihat/Cek** pada
setiap CCTV membuka modal yang menampilkan *simulasi* tampilan kamera (animasi
canvas + HUD berisi id kamera, jarak, koordinat, dan jam). ​Kamera dengan status
`offline` menampilkan pola *no-signal*. Untuk versi produksi, ganti isi
`CCTVViewer.jsx` dengan elemen `<video>`/pemutar HLS yang terhubung ke stream
RTSP-to-HLS dari kamera publik/berizin — struktur HUD dan modalnya sudah siap dipakai.

## Menghubungkan ke data asli

Proyek ini dirancang agar `src/data/hotspots.js` mudah diganti dengan pemanggilan API
sungguhan, misalnya:

- **NASA FIRMS / VIIRS** — sumber hotspot near-real-time (butuh API key gratis dari
  https://firms.modaps.eosdis.nasa.gov/api/).
- **Sentinel-2 / Copernicus Data Space** — citra untuk verifikasi visual lanjutan.
- **Landsat (USGS)** — data tambahan suhu permukaan.
- **CCTV & data jalan** — gunakan sumber yang memang menyediakan akses publik/API
  resmi (mis. milik pemerintah/instansi), jangan mengakses kamera tanpa izin.

Setiap objek hotspot mengikuti bentuk berikut, sehingga field yang sama bisa diisi
dari respons API sungguhan:

```js
{
  id, province, district, lat, lon, acquired, confidence, frp, satellite,
  landCover, score, smoke, recurring, distanceToRoadKm, cctv: [...], roads: [...],
  timeline: [...]
}
```

## Roadmap bertahap (sesuai diskusi awal)

1. **MVP** — satelit → hotspot → peta (sudah ada di prototipe ini).
2. Tambahkan analisis risiko otomatis + notifikasi ambang batas.
3. Integrasikan CCTV publik/berizin untuk verifikasi visual.
4. Tambahkan data kondisi jalan untuk rekomendasi akses petugas.
5. Tambahkan model AI untuk prediksi risiko dan pengurangan false alarm.
