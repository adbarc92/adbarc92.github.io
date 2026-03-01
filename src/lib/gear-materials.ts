import * as THREE from 'three';

export interface GearMaterials {
  steel: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  darkIron: THREE.MeshStandardMaterial;
  hub: THREE.MeshStandardMaterial;
  envMap: THREE.Texture;
}

function createEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileCubemapShader();

  const scene = new THREE.Scene();

  const gradientMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: /* glsl */ `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorldPosition;
      void main() {
        vec3 dir = normalize(vWorldPosition);

        // Dark gradient: navy at top to black at bottom
        float t = dir.y * 0.5 + 0.5;
        vec3 darkNavy = vec3(0.02, 0.03, 0.08);
        vec3 black = vec3(0.0, 0.0, 0.02);
        vec3 color = mix(black, darkNavy, t);

        // Subtle bright spot 1 (upper right)
        float spot1 = pow(max(dot(dir, normalize(vec3(0.6, 0.7, 0.4))), 0.0), 64.0);
        color += vec3(0.4, 0.4, 0.5) * spot1;

        // Subtle bright spot 2 (lower left)
        float spot2 = pow(max(dot(dir, normalize(vec3(-0.5, -0.3, 0.6))), 0.0), 48.0);
        color += vec3(0.3, 0.3, 0.4) * spot2;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  const sphereGeometry = new THREE.SphereGeometry(500, 32, 32);
  const sphereMesh = new THREE.Mesh(sphereGeometry, gradientMaterial);
  scene.add(sphereMesh);

  const envMapRenderTarget = pmremGenerator.fromScene(scene);
  const envMap = envMapRenderTarget.texture;

  // Dispose temporary resources
  sphereGeometry.dispose();
  gradientMaterial.dispose();
  pmremGenerator.dispose();

  return envMap;
}

export function createGearMaterials(renderer: THREE.WebGLRenderer): GearMaterials {
  const envMap = createEnvMap(renderer);

  const steel = new THREE.MeshStandardMaterial({
    color: 0x8090a0,
    metalness: 0.85,
    roughness: 0.35,
    envMap,
    envMapIntensity: 0.8,
  });

  const brass = new THREE.MeshStandardMaterial({
    color: 0xc8a44e,
    metalness: 0.9,
    roughness: 0.25,
    envMap,
    envMapIntensity: 1.0,
  });

  const darkIron = new THREE.MeshStandardMaterial({
    color: 0x3a3d4a,
    metalness: 0.7,
    roughness: 0.5,
    envMap,
    envMapIntensity: 0.5,
  });

  const hub = new THREE.MeshStandardMaterial({
    color: 0x6a6d7a,
    metalness: 0.8,
    roughness: 0.4,
    envMap,
    envMapIntensity: 0.7,
  });

  return { steel, brass, darkIron, hub, envMap };
}

export function disposeGearMaterials(materials: GearMaterials): void {
  materials.steel.dispose();
  materials.brass.dispose();
  materials.darkIron.dispose();
  materials.hub.dispose();
  materials.envMap.dispose();
}
