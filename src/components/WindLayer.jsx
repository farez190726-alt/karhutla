import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { windVectorAt } from "../data/wind";

const PARTICLE_COUNT = 260;
const TRAIL_ALPHA = 0.08;
const SPEED_SCALE = 0.9; // visual tuning only — not a physical unit conversion

export default function WindLayer({ visible }) {
  const map = useMap();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "wind-canvas";
    canvasRef.current = canvas;
    map.getContainer().appendChild(canvas);

    const resize = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };

    const seedParticles = () => {
      const b = map.getBounds();
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        lat: b.getSouth() + Math.random() * (b.getNorth() - b.getSouth()),
        lon: b.getWest() + Math.random() * (b.getEast() - b.getWest()),
        life: Math.random() * 100,
      }));
    };

    resize();
    seedParticles();

    map.on("resize", resize);
    map.on("zoomend", seedParticles);
    map.on("moveend", seedParticles);

    const ctx = canvas.getContext("2d");

    const step = () => {
      rafRef.current = requestAnimationFrame(step);
      if (!canvasRef.current) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${TRAIL_ALPHA})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      const b = map.getBounds();

      particlesRef.current.forEach((p) => {
        const { u, v } = windVectorAt(p.lat, p.lon);
        const start = map.latLngToContainerPoint([p.lat, p.lon]);

        const dLon = (u * SPEED_SCALE) / 6000;
        const dLat = (v * SPEED_SCALE) / 6000;
        const nextLat = p.lat + dLat;
        const nextLon = p.lon + dLon;
        const end = map.latLngToContainerPoint([nextLat, nextLon]);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = "rgba(180, 220, 205, 0.55)";
        ctx.lineWidth = 1.1;
        ctx.stroke();

        p.lat = nextLat;
        p.lon = nextLon;
        p.life -= 1;

        const outOfBounds =
          p.lat > b.getNorth() || p.lat < b.getSouth() || p.lon > b.getEast() || p.lon < b.getWest();
        if (p.life <= 0 || outOfBounds) {
          p.lat = b.getSouth() + Math.random() * (b.getNorth() - b.getSouth());
          p.lon = b.getWest() + Math.random() * (b.getEast() - b.getWest());
          p.life = 60 + Math.random() * 80;
        }
      });
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      map.off("resize", resize);
      map.off("zoomend", seedParticles);
      map.off("moveend", seedParticles);
      canvas.remove();
    };
  }, [map]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.display = visible ? "block" : "none";
    }
  }, [visible]);

  return null;
}
