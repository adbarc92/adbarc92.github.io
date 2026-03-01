// ---------------------------------------------------------------------------
// Three.js scene setup — renderer, camera, lights, post-processing
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface GearScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  composer: EffectComposer;
}

/**
 * Initialize the Three.js scene, camera, lights, and post-processing pipeline.
 */
export function initScene(canvas: HTMLCanvasElement): GearScene {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // --- Scene ---
  const scene = new THREE.Scene();
  scene.background = null; // transparent — CSS background handles page color

  // --- Camera ---
  const aspect = w / h;
  const camera = new THREE.PerspectiveCamera(30, aspect, 1, 5000);

  // Position above, looking down at slight angle (~12 deg from vertical)
  const sceneRadius = Math.min(w, h) * 0.5;
  camera.position.set(0, sceneRadius * 0.5, sceneRadius * 2.5);
  camera.lookAt(0, 0, 0);

  // --- Lights ---
  // Key light: warm white from upper-left
  const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
  keyLight.position.set(-sceneRadius, sceneRadius * 1.5, sceneRadius * 2);
  scene.add(keyLight);

  // Fill light: cool blue from lower-right
  const fillLight = new THREE.PointLight(0x6688aa, 0.3);
  fillLight.position.set(sceneRadius, -sceneRadius * 0.5, sceneRadius);
  scene.add(fillLight);

  // Ambient
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  // Rim light: edge highlights from behind
  const rimLight = new THREE.DirectionalLight(0x8899bb, 0.4);
  rimLight.position.set(0, 0, -sceneRadius * 2);
  scene.add(rimLight);

  // --- Post-processing ---
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Bloom
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    0.3,  // strength
    0.5,  // radius
    0.85, // threshold
  );
  composer.addPass(bloomPass);

  // Depth of field — very subtle, only blurs the far back layer slightly
  const bokehPass = new BokehPass(scene, camera, {
    focus: sceneRadius * 2.5,
    aperture: 0.0004,
    maxblur: 0.001,
  });
  composer.addPass(bokehPass);

  // Output
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return { renderer, scene, camera, composer };
}

/**
 * Handle viewport resize.
 */
export function resizeScene(
  gearScene: GearScene,
  width: number,
  height: number,
): void {
  const { camera, renderer, composer } = gearScene;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
}

/**
 * Clean up all Three.js resources.
 */
export function destroyScene(gearScene: GearScene): void {
  const { composer, renderer, scene } = gearScene;

  composer.dispose();

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          for (const material of object.material) {
            material.dispose();
          }
        } else {
          object.material.dispose();
        }
      }
    }
  });

  renderer.dispose();
}
