import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { windVectorAt } from "../data/wind";

const BASE_PARTICLE_COUNT = 320;
const TRAIL_ALPHA = 0.12;
const SPEED_SCALE = 0.85;

export default function WindLayer({ visible }) {
  const map = useMap();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "wind-canvas";
    canvas.style.pointerEvents = "none";
    canvasRef.current = canvas;
    map.getContainer().appendChild(canvas);

    const resize = () => {
      const size = map.getSize();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size.x * dpr;
      canvas.height = size.y * dpr;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;

      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
    };

    const seedParticles = () => {
      const b = map.getBounds();
      const count = window.innerWidth < 640 ? 180 : BASE_PARTICLE_COUNT;

      particlesRef.current = Array.from({ length: count }, () => {
        const maxLife = 50 + Math.random() * 70;
        return {
          lat: b.getSouth() + Math.random() * (b.getNorth() - b.getSouth()),
          lon: b.getWest() + Math.random() * (b.getEast() - b.getWest()),
          life: Math.random() * maxLife,
          maxLife,
        };
      });
    };

    resize();
    seedParticles();

    map.on("resize", resize);
    map.on("zoomend", seedParticles);
    map.on("moveend", seedParticles);

    const ctx = canvas.getContext("2d");

    const step = () => {
      rafRef.current = requestAnimationFrame(step);
      if (!canvasRef.current || !visible) return;

      const size = map.getSize();

      // Soft trail clearing
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${TRAIL_ALPHA})`;
      ctx.fillRect(0, 0, size.x, size.y);
      ctx.globalCompositeOperation = "source-over";

      const b = map.getBounds();

      particlesRef.current.forEach((p) => {
        const { u, v } = windVectorAt(p.lat, p.lon);
        const speed = Math.sqrt(u * u + v * v);
        const start = map.latLngToContainerPoint([p.lat, p.lon]);

        const dLon = (u * SPEED_SCALE) / 5200;
        const dLat = (v * SPEED_SCALE) / 5200;
        const nextLat = p.lat + dLat;
        const nextLon = p.lon + dLon;
        const end = map.latLngToContainerPoint([nextLat, nextLon]);

        // Calculate opacity based on life progression (fade in & fade out)
        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.75;

        // Color based on wind velocity (IQAir / Windy style)
        let strokeStyle;
        if (speed > 22) {
          strokeStyle = `rgba(251, 191, 36, ${Math.min(alpha * 1.1, 0.9)})`; // Golden amber for strong wind
        } else if (speed > 13) {
          strokeStyle = `rgba(56, 189, 248, ${alpha})`; // Bright sky blue for moderate wind
        } else {
          strokeStyle = `rgba(167, 243, 208, ${alpha * 0.8})`; // Soft mint for gentle breeze
        }

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = speed > 18 ? 1.4 : 1.1;
        ctx.stroke();

        p.lat = nextLat;
        p.lon = nextLon;
        p.life -= 1;

        const outOfBounds =
          p.lat > b.getNorth() ||
          p.lat < b.getSouth() ||
          p.lon > b.getEast() ||
          p.lon < b.getWest();

        if (p.life <= 0 || outOfBounds) {
          p.lat = b.getSouth() + Math.random() * (b.getNorth() - b.getSouth());
          p.lon = b.getWest() + Math.random() * (b.getEast() - b.getWest());
          p.maxLife = 60 + Math.random() * 80;
          p.life = p.maxLife;
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
  }, [map, visible]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.display = visible ? "block" : "none";
    }
  }, [visible]);

  return null;
}
