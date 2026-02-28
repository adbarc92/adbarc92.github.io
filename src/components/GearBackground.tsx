import { useEffect, useRef, useState, useCallback } from "react";
import { createGearLayout } from "../lib/gears";
import type { GearData } from "../lib/gears";

function getGearColor(index: number): { fill: string; opacity: number } {
  const mod = index % 3;
  if (mod === 0) {
    return { fill: "var(--color-gear-accent)", opacity: 0.12 };
  }
  if (mod === 1) {
    return { fill: "var(--color-gear-accent-2)", opacity: 0.08 };
  }
  return { fill: "var(--color-gear)", opacity: 0.08 };
}

export default function GearBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const rotationsRef = useRef<number[]>([]);
  const gearsRef = useRef<GearData[]>([]);
  const [gears, setGears] = useState<GearData[]>([]);

  const buildLayout = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const layout = createGearLayout(w, h);
    gearsRef.current = layout;
    rotationsRef.current = layout.map((g) => g.rotation);
    setGears(layout);
  }, []);

  // Build layout on mount and resize
  useEffect(() => {
    buildLayout();
    const onResize = () => buildLayout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [buildLayout]);

  // Animation loop — direct DOM manipulation for performance
  useEffect(() => {
    let frameId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      if (!svgRef.current) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const delta = lastTime === 0 ? 16 : time - lastTime;
      lastTime = time;

      const groups = svgRef.current.querySelectorAll<SVGGElement>(".gear-group");
      const currentGears = gearsRef.current;

      groups.forEach((group, i) => {
        if (i >= currentGears.length) return;
        const gear = currentGears[i];
        rotationsRef.current[i] += gear.speed * gear.direction * (delta / 16);
        const r = rotationsRef.current[i];
        group.setAttribute(
          "transform",
          `rotate(${r} ${gear.config.cx} ${gear.config.cy})`,
        );
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [gears]);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {gears.map((gear, i) => {
        const { fill, opacity } = getGearColor(i);
        return (
          <g key={i} className="gear-group">
            <path d={gear.path} fill={fill} opacity={opacity} />
            <path
              d={gear.holePath}
              fill="var(--color-bg)"
              stroke="var(--color-gear-stroke)"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </svg>
  );
}
