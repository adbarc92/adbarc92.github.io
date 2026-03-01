// ---------------------------------------------------------------------------
// 3D Three.js gear mesh generation — standard, helical, bevel, planetary
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { getInvoluteProfilePoints, type PlacedGear } from './gears';
import type { GearMaterials } from './gear-materials';

// ---- Constants ------------------------------------------------------------

const DEDENDUM_FACTOR = 1.25;
const SPOKE_TOOTH_THRESHOLD = 16;

// ---- Types ----------------------------------------------------------------

export interface GearMeshGroup {
  group: THREE.Group;
  gear: PlacedGear;
}

export interface PlanetarySet {
  group: THREE.Group;
  sunMesh: THREE.Group;
  planetMeshes: THREE.Group[];
  planetCarrier: THREE.Group;
  ringMesh: THREE.Group;
  sunTeeth: number;
  planetTeeth: number;
  ringTeeth: number;
}

// ---- Private helpers ------------------------------------------------------

/**
 * Convert an array of [x, y] coordinate pairs into a THREE.Shape.
 */
function profileToShape(points: [number, number][]): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  shape.closePath();
  return shape;
}

/**
 * Create spoke window cutout paths for gears with >= 16 teeth.
 */
function createSpokeHoles(
  teeth: number,
  mod: number,
  spokeCount?: number,
): THREE.Path[] {
  if (teeth < SPOKE_TOOTH_THRESHOLD) return [];

  const pitchR = (mod * teeth) / 2;
  const rootR = pitchR - DEDENDUM_FACTOR * mod;
  const holeRadius = Math.max(rootR * 0.3, mod);

  const hubR = holeRadius + (rootR - holeRadius) * 0.25;
  const rimR = rootR - mod * 0.5;

  if (rimR <= hubR + mod * 0.5) return [];

  const count = spokeCount ?? Math.min(Math.max(Math.floor(teeth / 5), 4), 6);
  const sectorAngle = (2 * Math.PI) / count;
  const windowHalfAngle = (sectorAngle * 0.7) / 2;

  const ARC_SEGMENTS = 8;
  const paths: THREE.Path[] = [];

  for (let i = 0; i < count; i++) {
    const centerAngle = i * sectorAngle;
    const a0 = centerAngle - windowHalfAngle;
    const a1 = centerAngle + windowHalfAngle;

    const path = new THREE.Path();

    // Start at inner arc (hub), left edge
    path.moveTo(hubR * Math.cos(a0), hubR * Math.sin(a0));

    // Radial line outward to rim at a0
    path.lineTo(rimR * Math.cos(a0), rimR * Math.sin(a0));

    // Outer arc (rim) from a0 to a1
    for (let s = 1; s <= ARC_SEGMENTS; s++) {
      const a = a0 + (a1 - a0) * (s / ARC_SEGMENTS);
      path.lineTo(rimR * Math.cos(a), rimR * Math.sin(a));
    }

    // Radial line inward to hub at a1
    path.lineTo(hubR * Math.cos(a1), hubR * Math.sin(a1));

    // Inner arc (hub) from a1 back to a0
    for (let s = 1; s <= ARC_SEGMENTS; s++) {
      const a = a1 + (a0 - a1) * (s / ARC_SEGMENTS);
      path.lineTo(hubR * Math.cos(a), hubR * Math.sin(a));
    }

    path.closePath();
    paths.push(path);
  }

  return paths;
}

// ---- Standard gear --------------------------------------------------------

/**
 * Create a complete 3D gear mesh group from a PlacedGear definition.
 * Includes: gear body with spoke holes, hub cylinder, center bore,
 * bolt holes, and keyway.
 */
export function createStandardGearMesh(
  gear: PlacedGear,
  material: THREE.MeshStandardMaterial,
  materials: GearMaterials,
): GearMeshGroup {
  const { teeth, module: mod, pitchRadius, innerRadius } = gear;
  const group = new THREE.Group();

  const rootR = pitchRadius - DEDENDUM_FACTOR * mod;
  const holeRadius = Math.max(rootR * 0.3, mod);
  const thickness = pitchRadius * 0.25;

  // 1. Gear body (extruded involute profile)
  const profilePoints = getInvoluteProfilePoints(teeth, mod);
  const shape = profileToShape(profilePoints);

  // Add spoke window holes
  const spokeHoles = createSpokeHoles(teeth, mod);
  for (const hole of spokeHoles) {
    shape.holes.push(hole);
  }

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: mod * 0.15,
    bevelSize: mod * 0.15,
    bevelSegments: 2,
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  bodyGeometry.translate(0, 0, -thickness / 2);

  const bodyMesh = new THREE.Mesh(bodyGeometry, material);
  group.add(bodyMesh);

  // 2. Hub cylinder (slightly taller than gear body)
  const hubRadius = pitchRadius * 0.2 * 1.5;
  const hubHeight = thickness * 1.4;
  const hubGeometry = new THREE.CylinderGeometry(
    hubRadius,
    hubRadius,
    hubHeight,
    32,
  );
  hubGeometry.rotateX(Math.PI / 2); // Align with Z axis

  const hubMesh = new THREE.Mesh(hubGeometry, materials.hub);
  group.add(hubMesh);

  // 3. Center bore (dark cylinder to simulate hole)
  const boreMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0f,
    metalness: 0.3,
    roughness: 0.8,
  });

  const boreRadius = holeRadius * 0.6;
  const boreHeight = hubHeight * 1.05;
  const boreGeometry = new THREE.CylinderGeometry(
    boreRadius,
    boreRadius,
    boreHeight,
    32,
  );
  boreGeometry.rotateX(Math.PI / 2);

  const boreMesh = new THREE.Mesh(boreGeometry, boreMaterial);
  group.add(boreMesh);

  // 4. Bolt holes
  const boltCount = teeth >= 20 ? 6 : 4;
  const boltOrbitRadius = hubRadius + (innerRadius - hubRadius) * 0.4;
  const boltRadius = mod * 0.2;
  const boltHeight = thickness * 1.02;

  const boltMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0f,
    metalness: 0.3,
    roughness: 0.8,
  });

  for (let i = 0; i < boltCount; i++) {
    const angle = (2 * Math.PI * i) / boltCount;
    const bx = boltOrbitRadius * Math.cos(angle);
    const by = boltOrbitRadius * Math.sin(angle);

    const boltGeometry = new THREE.CylinderGeometry(
      boltRadius,
      boltRadius,
      boltHeight,
      8,
    );
    boltGeometry.rotateX(Math.PI / 2);

    const boltMesh = new THREE.Mesh(boltGeometry, boltMaterial);
    boltMesh.position.set(bx, by, 0);
    group.add(boltMesh);
  }

  // 5. Keyway (small notch in bore)
  const keywayWidth = boreRadius * 0.35;
  const keywayDepth = boreRadius * 0.2;
  const keywayHeight = hubHeight * 0.9;

  const keywayMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0f,
    metalness: 0.3,
    roughness: 0.8,
  });

  const keywayGeometry = new THREE.BoxGeometry(
    keywayWidth,
    keywayDepth,
    keywayHeight,
  );
  const keywayMesh = new THREE.Mesh(keywayGeometry, keywayMaterial);
  keywayMesh.position.set(boreRadius - keywayDepth / 2, 0, 0);
  group.add(keywayMesh);

  return { group, gear };
}

// ---- Helical gear ---------------------------------------------------------

/**
 * Create a helical gear — same involute profile but with twisted extrusion.
 * Twist is applied by manually rotating vertices along Z after extrusion.
 */
export function createHelicalGearMesh(
  gear: PlacedGear,
  material: THREE.MeshStandardMaterial,
  materials: GearMaterials,
  helixAngleDeg: number = 18,
): GearMeshGroup {
  const result = createStandardGearMesh(gear, material, materials);

  // Apply twist to gear body (first child mesh)
  const bodyMesh = result.group.children[0] as THREE.Mesh;
  const geo = bodyMesh.geometry;
  const positions = geo.attributes.position;
  const thickness = gear.pitchRadius * 0.25;
  const helixRad = helixAngleDeg * (Math.PI / 180);

  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i);
    // Twist angle proportional to Z position
    const twist = (z / thickness) * helixRad;
    const x = positions.getX(i);
    const y = positions.getY(i);
    const cos = Math.cos(twist);
    const sin = Math.sin(twist);
    positions.setXY(i, x * cos - y * sin, x * sin + y * cos);
  }

  positions.needsUpdate = true;
  geo.computeVertexNormals();

  return result;
}

// ---- Bevel gear pair ------------------------------------------------------

/**
 * Create a bevel gear pair — two conical gears meshing at 90 degrees.
 * Returns a group containing both gears with conical taper applied.
 */
export function createBevelPair(
  gear1: PlacedGear,
  gear2: PlacedGear,
  material1: THREE.MeshStandardMaterial,
  material2: THREE.MeshStandardMaterial,
  materials: GearMaterials,
): { group: THREE.Group; gear1Mesh: THREE.Group; gear2Mesh: THREE.Group } {
  const group = new THREE.Group();

  const mesh1 = createStandardGearMesh(gear1, material1, materials);
  const mesh2 = createStandardGearMesh(gear2, material2, materials);

  // Apply conical taper to gear body vertices (narrower on one end)
  [mesh1, mesh2].forEach((m) => {
    const bodyMesh = m.group.children[0] as THREE.Mesh;
    const geo = bodyMesh.geometry;
    const positions = geo.attributes.position;
    const thickness = m.gear.pitchRadius * 0.25;

    for (let i = 0; i < positions.count; i++) {
      const z = positions.getZ(i);
      // Taper: full size at z=-thickness/2, 70% at z=+thickness/2
      const taper = 1.0 - 0.3 * ((z + thickness / 2) / thickness);
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setXY(i, x * taper, y * taper);
    }

    positions.needsUpdate = true;
    geo.computeVertexNormals();
  });

  // Position gear2 at 90 degrees to gear1
  mesh1.group.position.set(0, 0, 0);
  const centerDist = gear1.pitchRadius + gear2.pitchRadius;
  mesh2.group.position.set(centerDist * 0.7, 0, 0);
  mesh2.group.rotation.set(0, Math.PI / 2, 0);

  group.add(mesh1.group);
  group.add(mesh2.group);

  return { group, gear1Mesh: mesh1.group, gear2Mesh: mesh2.group };
}

// ---- Planetary gear set ---------------------------------------------------

/**
 * Create a planetary gear set: sun + 3 planets + ring gear.
 * Ring teeth = sun teeth + 2 * planet teeth.
 */
export function createPlanetarySet(
  cx: number,
  cy: number,
  mod: number,
  sunTeeth: number,
  materials: GearMaterials,
): PlanetarySet {
  const planetTeeth = Math.round(sunTeeth * 0.75);
  const ringTeeth = sunTeeth + 2 * planetTeeth;

  const group = new THREE.Group();
  const planetCount = 3;
  const pressureAngle = 20 * (Math.PI / 180);

  // --- Sun gear ---
  const sunPitchR = (mod * sunTeeth) / 2;
  const sunGear: PlacedGear = {
    teeth: sunTeeth,
    module: mod,
    cx: 0,
    cy: 0,
    spec: { teeth: sunTeeth, module: mod },
    pitchRadius: sunPitchR,
    outerRadius: sunPitchR + mod,
    innerRadius: Math.max(
      sunPitchR - DEDENDUM_FACTOR * mod,
      sunPitchR * Math.cos(pressureAngle) * 0.95,
    ),
    baseRadius: sunPitchR * Math.cos(pressureAngle),
    parentIndex: null,
    layer: 'mid',
    phaseOffset: 0,
    gearRatio: 1,
    direction: 1,
  };
  const sunResult = createStandardGearMesh(sunGear, materials.brass, materials);
  group.add(sunResult.group);

  // --- Planet carrier (invisible group that orbits) ---
  const planetCarrier = new THREE.Group();
  group.add(planetCarrier);

  // --- Planet gears ---
  const planetPitchR = (mod * planetTeeth) / 2;
  const orbitR = sunPitchR + planetPitchR;
  const planetMeshes: THREE.Group[] = [];

  for (let i = 0; i < planetCount; i++) {
    const angle = (i * 2 * Math.PI) / planetCount;
    const planetGear: PlacedGear = {
      teeth: planetTeeth,
      module: mod,
      cx: 0,
      cy: 0,
      spec: { teeth: planetTeeth, module: mod },
      pitchRadius: planetPitchR,
      outerRadius: planetPitchR + mod,
      innerRadius: Math.max(
        planetPitchR - DEDENDUM_FACTOR * mod,
        planetPitchR * Math.cos(pressureAngle) * 0.95,
      ),
      baseRadius: planetPitchR * Math.cos(pressureAngle),
      parentIndex: 0,
      layer: 'mid',
      phaseOffset: 0,
      gearRatio: sunTeeth / planetTeeth,
      direction: -1,
    };
    const planetResult = createStandardGearMesh(
      planetGear,
      materials.steel,
      materials,
    );
    planetResult.group.position.set(
      orbitR * Math.cos(angle),
      orbitR * Math.sin(angle),
      0,
    );
    planetCarrier.add(planetResult.group);
    planetMeshes.push(planetResult.group);
  }

  // --- Ring gear (hollow cylinder approximation of internal teeth) ---
  const ringPitchR = (mod * ringTeeth) / 2;
  const ringOuterR = ringPitchR + mod * 2;
  const ringInnerR = ringPitchR - mod;

  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, ringOuterR, 0, Math.PI * 2, false);
  const ringHole = new THREE.Path();
  ringHole.absarc(0, 0, ringInnerR, 0, Math.PI * 2, true);
  ringShape.holes.push(ringHole);

  const ringThickness = sunPitchR * 0.2;
  const ringGeo = new THREE.ExtrudeGeometry(ringShape, {
    depth: ringThickness,
    bevelEnabled: true,
    bevelSize: mod * 0.1,
    bevelThickness: mod * 0.1,
    bevelSegments: 1,
    curveSegments: 64,
  });
  ringGeo.translate(0, 0, -ringThickness / 2);
  const ringMeshObj = new THREE.Mesh(ringGeo, materials.darkIron);
  const ringGroup = new THREE.Group();
  ringGroup.add(ringMeshObj);
  group.add(ringGroup);

  // Position the whole set
  group.position.set(cx, cy, 0);

  return {
    group,
    sunMesh: sunResult.group,
    planetMeshes,
    planetCarrier,
    ringMesh: ringGroup,
    sunTeeth,
    planetTeeth,
    ringTeeth,
  };
}

// ---- Disposal -------------------------------------------------------------

/**
 * Dispose geometries and locally-created materials in a gear mesh group.
 */
export function disposeGearMesh(gearMesh: GearMeshGroup): void {
  gearMesh.group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      // Only dispose dark materials that are not shared across gears
      const mat = child.material as THREE.MeshStandardMaterial;
      if (mat && 'color' in mat && mat.color.getHex() === 0x0a0a0f) {
        mat.dispose();
      }
    }
  });
}
