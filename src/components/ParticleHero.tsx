"use client";

import { useCallback, useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticleHero() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="hero-particles"
      className="absolute inset-0 z-0"
      options={{
        fullScreen: false,
        fpsLimit: 60,
        background: { color: { value: "transparent" } },
        particles: {
          number: { value: 60, density: { enable: true, width: 1920, height: 1080 } },
          color: { value: ["#6366f1", "#818cf8", "#a78bfa", "#60a5fa"] },
          shape: { type: "circle" },
          opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 0.5, sync: false } },
          size: { value: { min: 1, max: 3 } },
          links: {
            enable: true,
            distance: 150,
            color: "#6366f1",
            opacity: 0.15,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.8,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "bounce" },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: { enable: true },
          },
          modes: {
            grab: { distance: 180, links: { opacity: 0.4, color: "#818cf8" } },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
