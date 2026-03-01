// ---------------------------------------------------------------------------
// Animation loop for the Three.js 3D gear scene
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { GearScene } from './gear-scene';
import type { GearChain } from './gears';

// ---- Constants ------------------------------------------------------------

const DEG_TO_RAD = Math.PI / 180;

// ---- Interfaces -----------------------------------------------------------

export interface PlanetaryAnimData {
  sunMesh: THREE.Group;
  planetMeshes: THREE.Group[];
  planetCarrier: THREE.Group;
  ringMesh: THREE.Group;
  sunTeeth: number;
  planetTeeth: number;
  ringTeeth: number;
}

export interface AnimationState {
  chains: {
    chain: GearChain;
    meshGroups: THREE.Group[];
    rootAngle: number;
  }[];
  bevelPairs: {
    gear1Mesh: THREE.Group;
    gear2Mesh: THREE.Group;
    speed: number;
    angle: number;
  }[];
  planetarySets: {
    set: PlanetaryAnimData;
    sunSpeed: number;
    sunAngle: number;
  }[];
  running: boolean;
}

// ---- Factory --------------------------------------------------------------

/**
 * Create the initial animation state with all angles zeroed and running = true.
 */
export function createAnimationState(
  chains: { chain: GearChain; meshGroups: THREE.Group[] }[],
  bevelPairs: { gear1Mesh: THREE.Group; gear2Mesh: THREE.Group; speed: number }[],
  planetarySets: { set: PlanetaryAnimData; sunSpeed: number }[],
): AnimationState {
  return {
    chains: chains.map((c) => ({ ...c, rootAngle: 0 })),
    bevelPairs: bevelPairs.map((b) => ({ ...b, angle: 0 })),
    planetarySets: planetarySets.map((p) => ({ ...p, sunAngle: 0 })),
    running: true,
  };
}

// ---- Animation loop -------------------------------------------------------

/**
 * Start the animation loop using the renderer's built-in `setAnimationLoop`.
 *
 * The loop computes a frame-rate-independent delta, then drives:
 *   1. Standard gear chains (spur meshing)
 *   2. Bevel gear pairs (perpendicular axes)
 *   3. Planetary gear sets (sun / carrier / planets / ring)
 *
 * Rendering is done via `gearScene.composer.render()` to support post-processing.
 */
export function startAnimation(gearScene: GearScene, state: AnimationState): void {
  const clock = new THREE.Clock();
  state.running = true;

  gearScene.renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    // Normalize speed so that 1.0 corresponds to 60 fps
    const speed = delta * 60;

    // --- 1. Standard chains ---
    for (const entry of state.chains) {
      entry.rootAngle += entry.chain.rootSpeed * speed;

      const { gears } = entry.chain;
      for (let i = 0; i < gears.length; i++) {
        const gear = gears[i];
        const meshGroup = entry.meshGroups[i];
        if (!meshGroup) continue;

        const angleDeg =
          entry.rootAngle * gear.gearRatio * gear.direction + gear.phaseOffset;
        meshGroup.rotation.z = angleDeg * DEG_TO_RAD;
      }
    }

    // --- 2. Bevel pairs ---
    for (const pair of state.bevelPairs) {
      pair.angle += pair.speed * speed;
      pair.gear1Mesh.rotation.z = pair.angle * DEG_TO_RAD;
      pair.gear2Mesh.rotation.x = -pair.angle * DEG_TO_RAD;
    }

    // --- 3. Planetary sets ---
    for (const entry of state.planetarySets) {
      entry.sunAngle += entry.sunSpeed * speed;
      const { sunTeeth, planetTeeth, ringTeeth } = entry.set;

      // Sun rotation
      entry.set.sunMesh.rotation.z = entry.sunAngle * DEG_TO_RAD;

      // Planet carrier rotates at sun_speed * sun/(sun+ring)
      entry.set.planetCarrier.rotation.z =
        entry.sunAngle * (sunTeeth / (sunTeeth + ringTeeth)) * DEG_TO_RAD;

      // Each planet self-rotation relative to carrier
      for (const planet of entry.set.planetMeshes) {
        planet.rotation.z =
          -entry.sunAngle * (sunTeeth / planetTeeth) * DEG_TO_RAD;
      }

      // Ring: very slow counter-rotation for visual interest
      entry.set.ringMesh.rotation.z = -entry.sunAngle * 0.02 * DEG_TO_RAD;
    }

    // --- Render ---
    gearScene.composer.render();
  });
}

// ---- Stop -----------------------------------------------------------------

/**
 * Stop the animation loop and mark the state as not running.
 */
export function stopAnimation(gearScene: GearScene, state: AnimationState): void {
  state.running = false;
  gearScene.renderer.setAnimationLoop(null);
}
