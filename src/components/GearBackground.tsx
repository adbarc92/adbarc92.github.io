import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createGearLayout } from '../lib/gears';
import { initScene, resizeScene, destroyScene, type GearScene } from '../lib/gear-scene';
import { createGearMaterials, disposeGearMaterials, type GearMaterials } from '../lib/gear-materials';
import {
  createStandardGearMesh,
  createHelicalGearMesh,
  createBevelPair,
  createPlanetarySet,
  type GearMeshGroup,
  type PlanetarySet,
} from '../lib/gear-meshes';
import {
  createAnimationState,
  startAnimation,
  stopAnimation,
  type AnimationState,
  type PlanetaryAnimData,
} from '../lib/gear-animation';

// Indices within each chain where we swap in exotic types
// Mid layer: indices 2,5 become helical; index 4 replaced by planetary
// Front layer: indices 1,2 replaced by bevel pair
const HELICAL_MID_INDICES = new Set([2, 5]);
const PLANETARY_MID_INDEX = 4;
const BEVEL_FRONT_INDICES: [number, number] = [1, 2];

export default function GearBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<GearScene | null>(null);
  const materialsRef = useRef<GearMaterials | null>(null);
  const animStateRef = useRef<AnimationState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Init scene ---
    const gearScene = initScene(canvas);
    sceneRef.current = gearScene;

    // --- Materials ---
    const materials = createGearMaterials(gearScene.renderer);
    materialsRef.current = materials;

    // --- Layout ---
    const layout = createGearLayout(window.innerWidth, window.innerHeight);

    // Map viewport coords to scene coords (center at origin, flip Y)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mapX = (x: number) => x - vw / 2;
    const mapY = (y: number) => -(y - vh / 2);

    // Layer Z depths
    const layerZ: Record<string, number> = { back: -80, mid: 0, front: 80 };

    // Material per layer
    const layerMaterial: Record<string, THREE.MeshStandardMaterial> = {
      back: materials.darkIron,
      mid: materials.steel,
      front: materials.steel,
    };

    // --- Build gear meshes ---
    const chainAnimData: { chain: typeof layout.back; meshGroups: THREE.Group[] }[] = [];
    const bevelAnimData: { gear1Mesh: THREE.Group; gear2Mesh: THREE.Group; speed: number }[] = [];
    const planetaryAnimData: { set: PlanetaryAnimData; sunSpeed: number }[] = [];

    for (const layerName of ['back', 'mid', 'front'] as const) {
      const chain = layout[layerName];
      const meshGroups: THREE.Group[] = [];
      const z = layerZ[layerName];
      const baseMat = layerMaterial[layerName];

      const skipIndices = new Set<number>();

      // --- Planetary (mid layer) ---
      if (layerName === 'mid' && PLANETARY_MID_INDEX < chain.gears.length) {
        const gear = chain.gears[PLANETARY_MID_INDEX];
        const pSet: PlanetarySet = createPlanetarySet(
          mapX(gear.cx),
          mapY(gear.cy),
          gear.module,
          12,
          materials,
        );
        pSet.group.position.z = z;
        gearScene.scene.add(pSet.group);
        planetaryAnimData.push({
          set: pSet,
          sunSpeed: chain.rootSpeed * gear.gearRatio,
        });
        skipIndices.add(PLANETARY_MID_INDEX);
      }

      // --- Bevel pair (front layer) ---
      if (layerName === 'front') {
        const [i1, i2] = BEVEL_FRONT_INDICES;
        if (i1 < chain.gears.length && i2 < chain.gears.length) {
          const g1 = chain.gears[i1];
          const g2 = chain.gears[i2];
          const bevel = createBevelPair(
            g1,
            g2,
            materials.brass,
            materials.steel,
            materials,
          );
          bevel.group.position.set(mapX(g1.cx), mapY(g1.cy), z);
          gearScene.scene.add(bevel.group);
          bevelAnimData.push({
            gear1Mesh: bevel.gear1Mesh,
            gear2Mesh: bevel.gear2Mesh,
            speed: chain.rootSpeed * g1.gearRatio,
          });
          skipIndices.add(i1);
          skipIndices.add(i2);
        }
      }

      // --- Standard and helical gears ---
      for (let i = 0; i < chain.gears.length; i++) {
        if (skipIndices.has(i)) {
          meshGroups.push(new THREE.Group()); // placeholder for skipped
          continue;
        }

        const gear = chain.gears[i];
        const isHelical = layerName === 'mid' && HELICAL_MID_INDICES.has(i);
        const isAccent =
          (layerName === 'front' && i % 2 === 0) ||
          (layerName === 'mid' && i === 0);
        const mat = isAccent ? materials.brass : baseMat;

        let gearMesh: GearMeshGroup;
        if (isHelical) {
          gearMesh = createHelicalGearMesh(gear, mat, materials);
        } else {
          gearMesh = createStandardGearMesh(gear, mat, materials);
        }

        gearMesh.group.position.set(mapX(gear.cx), mapY(gear.cy), z);
        gearScene.scene.add(gearMesh.group);
        meshGroups.push(gearMesh.group);
      }

      chainAnimData.push({ chain, meshGroups });
    }

    // --- Start animation ---
    const animState = createAnimationState(
      chainAnimData,
      bevelAnimData,
      planetaryAnimData,
    );
    animStateRef.current = animState;
    startAnimation(gearScene, animState);

    // --- Resize handler ---
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeScene(gearScene, window.innerWidth, window.innerHeight);
      }, 200);
    };
    window.addEventListener('resize', onResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      if (animStateRef.current) {
        stopAnimation(gearScene, animStateRef.current);
      }
      if (materialsRef.current) {
        disposeGearMaterials(materialsRef.current);
      }
      destroyScene(gearScene);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
