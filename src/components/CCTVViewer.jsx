import { useEffect, useRef, useState } from "react";

// There is no real camera stream to connect to in this prototype, so the viewer
// renders a simulated feed on canvas (a slow drifting forest/haze scene, or a
// "no signal" static pattern when the camera is offline) with a real HUD overlay
// (id, distance, coordinates, clock) so the interaction reads like an actual
// camera viewer that a real RTSP/HLS stream could be dropped into later.
export default function CCTVViewer({ camera, hotspot, onClose }) {
  const canvasRef = useRef(null);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let frame = 0;

    const width = canvas.width;
    const height = canvas.height;

    const drawOnline = () => {
      frame += 1;

      // sky/tree-line gradient backdrop
      const grd = ctx.createLinearGradient(0, 0, 0, height);
      grd.addColorStop(0, "#1a2b22");
      grd.addColorStop(0.55, "#12201a");
      grd.addColorStop(1, "#0b140f");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // simple tree-line silhouette
      ctx.fillStyle = "#0d1712";
      ctx.beginPath();
      ctx.moveTo(0, height * 0.62);
      for (let x = 0; x <= width; x += 24) {
        const bump = Math.sin((x + frame * 1.2) / 40) * 10 + Math.sin(x / 90) * 18;
        ctx.lineTo(x, height * 0.62 + bump);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // drifting haze bands
      for (let i = 0; i < 3; i += 1) {
        const y = height * 0.5 + i * 22;
        const shift = (frame * (0.4 + i * 0.2)) % (width + 200);
        ctx.fillStyle = `rgba(200, 200, 190, ${0.04 + i * 0.015})`;
        ctx.fillRect(width - shift, y, 200, 14);
        ctx.fillRect(width - shift + width + 200, y, 200, 14);
      }

      // subtle grain
      for (let i = 0; i < 40; i += 1) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
      }

      raf = requestAnimationFrame(drawOnline);
    };

    const drawOffline = () => {
      frame += 1;
      const imageData = ctx.createImageData(width, height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 40;
      }
      ctx.fillStyle = "#05080a";
      ctx.fillRect(0, 0, width, height);
      ctx.putImageData(imageData, 0, 0);
      raf = requestAnimationFrame(drawOffline);
    };

    if (camera.status === "online") drawOnline();
    else drawOffline();

    return () => cancelAnimationFrame(raf);
  }, [camera.status]);

  return (
    <div className="cctv-overlay" role="dialog" aria-label={`Tampilan ${camera.label}`} onClick={onClose}>
      <div className="cctv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cctv-frame">
          <canvas ref={canvasRef} width={640} height={360} />

          <div className="cctv-hud-top">
            <span className={`cctv-live ${camera.status}`}>
              <span className="dot" />
              {camera.status === "online" ? "LIVE" : "TIDAK ADA SINYAL"}
            </span>
            <span className="cctv-clock">
              <span className="msi" style={{ fontSize: 14, verticalAlign: "-2px", marginRight: 4 }}>
                schedule
              </span>
              {clock.toLocaleTimeString("id-ID")}
            </span>
          </div>

          <div className="cctv-hud-bottom">
            <span>{camera.id}</span>
            <span>{camera.label}</span>
            <span>{camera.distanceKm} km dari hotspot</span>
            <span>{hotspot.lat.toFixed(3)}, {hotspot.lon.toFixed(3)}</span>
          </div>

          {camera.status !== "online" && (
            <div className="cctv-offline-note">Koneksi kamera terputus &mdash; menampilkan cadangan terakhir tidak tersedia</div>
          )}
        </div>

        <div className="cctv-footer">
          <p>
            Simulasi tampilan kamera untuk prototipe. Hubungkan ke stream RTSP/HLS sungguhan dari kamera
            berizin untuk menggantikan tampilan ini di implementasi produksi.
          </p>
          <button onClick={onClose}>
            <span className="msi" style={{ fontSize: 16, verticalAlign: "-3px", marginRight: 4 }}>
              close
            </span>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
