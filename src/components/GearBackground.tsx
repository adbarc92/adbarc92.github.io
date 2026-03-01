import { useEffect, useRef, useState } from 'react';
import { createGearLayout, computeGearPaths, type GearLayout, type RenderGear } from '../lib/gears';

// ---------------------------------------------------------------------------
// Layer styling
// ---------------------------------------------------------------------------

const LAYER_STYLES: Record<string, { filter: string; strokeWidth: number; opacityRange: [number, number] }> = {
  back:  { filter: 'url(#gear-back)',  strokeWidth: 0.5, opacityRange: [0.06, 0.08] },
  mid:   { filter: 'url(#gear-mid)',   strokeWidth: 1.0, opacityRange: [0.10, 0.14] },
  front: { filter: 'url(#gear-front)', strokeWidth: 1.5, opacityRange: [0.12, 0.18] },
};

const LAYER_ORDER: Array<'back' | 'mid' | 'front'> = ['back', 'mid', 'front'];

const GEAR_COLORS = [
  'var(--color-gear-accent)',
  'var(--color-gear-accent-2)',
  'var(--color-gear)',
];

// ---------------------------------------------------------------------------
// Color assignment
// ---------------------------------------------------------------------------

function getGearColor(layerIndex: number, gearIndex: number, layer: 'back' | 'mid' | 'front'): string {
  if (layer === 'front') {
    return gearIndex % 2 === 0 ? GEAR_COLORS[0] : GEAR_COLORS[1];
  }
  if (layer === 'mid' && gearIndex === 0) {
    return GEAR_COLORS[0];
  }
  return GEAR_COLORS[(gearIndex + layerIndex) % 3];
}

function getGearOpacity(gearIndex: number, range: [number, number]): number {
  return range[0] + (range[1] - range[0]) * ((Math.sin(gearIndex * 1.7) + 1) / 2);
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

interface ChainRenderData {
  layer: 'back' | 'mid' | 'front';
  rootSpeed: number;
  gears: RenderGear[];
}

function buildRenderData(layout: GearLayout): ChainRenderData[] {
  return LAYER_ORDER.map((layer) => {
    const chain = layout[layer];
    return {
      layer,
      rootSpeed: chain.rootSpeed,
      gears: chain.gears.map((g) => computeGearPaths(g)),
    };
  });
}

function buildLayout(): { layout: GearLayout; chains: ChainRenderData[] } {
  const layout = createGearLayout(window.innerWidth, window.innerHeight);
  return { layout, chains: buildRenderData(layout) };
}

// Compute initial layout outside component to avoid ref issues
const initialData = buildLayout();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GearBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootAnglesRef = useRef<number[]>(LAYER_ORDER.map(() => 0));
  const chainsRef = useRef<ChainRenderData[]>(initialData.chains);
  const [chains, setChains] = useState<ChainRenderData[]>(initialData.chains);

  // Rebuild layout on debounced resize
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const data = buildLayout();
        chainsRef.current = data.chains;
        rootAnglesRef.current = LAYER_ORDER.map(() => 0);
        setChains(data.chains);
      }, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Animation loop — direct DOM manipulation for performance
  useEffect(() => {
    let frameId: number;
    const RAD_TO_DEG = 180 / Math.PI;

    const animate = () => {
      if (!svgRef.current) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const currentChains = chainsRef.current;
      const angles = rootAnglesRef.current;

      for (let ci = 0; ci < currentChains.length; ci++) {
        const chain = currentChains[ci];
        angles[ci] += chain.rootSpeed;

        const chainGroup = svgRef.current.querySelector(`.chain-${ci}`);
        if (!chainGroup) continue;

        const gearGroups = chainGroup.querySelectorAll<SVGGElement>('.gear-group');
        for (let gi = 0; gi < chain.gears.length; gi++) {
          const group = gearGroups[gi];
          if (!group) continue;
          const gear = chain.gears[gi];
          const angle =
            angles[ci] * gear.gearRatio * gear.direction +
            gear.phaseOffset * RAD_TO_DEG;
          group.setAttribute(
            'transform',
            `translate(${gear.cx} ${gear.cy}) rotate(${angle})`,
          );
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [chains]);

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <defs>
        {/* Back layer: atmospheric blur */}
        <filter id="gear-back" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>

        {/* Mid layer: subtle blur + specular lighting */}
        <filter id="gear-mid" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blurred" />
          <feSpecularLighting
            in="blurred"
            result="specular"
            specularExponent="20"
            surfaceScale="2"
            lightingColor="white"
          >
            <fePointLight x="-5000" y="-5000" z="10000" />
          </feSpecularLighting>
          <feComposite in="specular" in2="blurred" operator="in" result="specClipped" />
          <feComposite in="blurred" in2="specClipped" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
        </filter>

        {/* Front layer: no blur, stronger specular + drop shadow */}
        <filter id="gear-front" x="-10%" y="-10%" width="120%" height="120%">
          <feSpecularLighting
            in="SourceGraphic"
            result="specular"
            specularExponent="30"
            surfaceScale="3"
            lightingColor="white"
          >
            <fePointLight x="-5000" y="-5000" z="10000" />
          </feSpecularLighting>
          <feComposite in="specular" in2="SourceGraphic" operator="in" result="specClipped" />
          <feComposite in="SourceGraphic" in2="specClipped" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" result="lit" />
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>

      {chains.map((chain, ci) => {
        const layerStyle = LAYER_STYLES[chain.layer];
        return (
          <g key={ci} className={`chain-${ci}`} filter={layerStyle.filter}>
            {chain.gears.map((rg, gi) => {
              const color = getGearColor(ci, gi, chain.layer);
              const opacity = getGearOpacity(gi, layerStyle.opacityRange);
              return (
                <g key={gi} className="gear-group">
                  <path
                    d={rg.paths.profile}
                    fill={color}
                    opacity={opacity}
                    stroke="var(--color-gear-stroke)"
                    strokeWidth={layerStyle.strokeWidth}
                  />
                  {rg.paths.spokes && (
                    <path
                      d={rg.paths.spokes}
                      fill="var(--color-bg)"
                      opacity={opacity * 0.9}
                    />
                  )}
                  <path
                    d={rg.paths.hole}
                    fill="var(--color-bg)"
                    stroke="var(--color-gear-stroke)"
                    strokeWidth={layerStyle.strokeWidth}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
