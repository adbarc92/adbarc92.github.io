// ---------------------------------------------------------------------------
// Involute gear path generation & multi-chain layout
// ---------------------------------------------------------------------------

// ---- Constants ------------------------------------------------------------

const DEFAULT_PRESSURE_ANGLE = 20; // degrees
const INVOLUTE_SEGMENTS = 8;
const ADDENDUM_FACTOR = 1.0;
const DEDENDUM_FACTOR = 1.25;
const SPOKE_TOOTH_THRESHOLD = 16;

const DEG = Math.PI / 180;

// ---- Type definitions -----------------------------------------------------

/** Specification for a single gear (tooth count + module). */
export interface GearSpec {
  teeth: number;
  module: number;
}

/** A gear placed in the layout with position, phase, and animation info. */
export interface PlacedGear {
  teeth: number;
  module: number;
  cx: number;
  cy: number;
  /** The original GearSpec for this gear. */
  spec: GearSpec;
  /** Pitch radius = module * teeth / 2. */
  pitchRadius: number;
  /** Outer (addendum) radius. */
  outerRadius: number;
  /** Inner (root/dedendum) radius. */
  innerRadius: number;
  /** Base circle radius. */
  baseRadius: number;
  /** Index of the parent gear in the chain, or null for the root gear. */
  parentIndex: number | null;
  /** Depth layer this gear belongs to. */
  layer: 'back' | 'mid' | 'front';
  /** Phase offset in degrees so meshing teeth interleave correctly. */
  phaseOffset: number;
  /** Gear ratio relative to chain root (rootSpeed * ratio = this gear's speed). */
  gearRatio: number;
  /** 1 or -1, alternates at each mesh. */
  direction: 1 | -1;
}

/** Pre-computed SVG path strings for a gear. */
export interface GearPaths {
  /** Outer profile including teeth. */
  profile: string;
  /** Center hole circle. */
  hole: string;
  /** Spoke window cutouts (empty string if teeth < SPOKE_TOOTH_THRESHOLD). */
  spokes: string;
}

/** A chain of meshing gears sharing a common module. */
export interface GearChain {
  gears: PlacedGear[];
  /** Root angular speed in degrees per frame (at 60 fps baseline). */
  rootSpeed: number;
}

/** Full layout: 3 chains at different depth layers. */
export interface GearLayout {
  back: GearChain;
  mid: GearChain;
  front: GearChain;
}

/** A placed gear with its pre-computed paths — ready to render. */
export interface RenderGear extends PlacedGear {
  paths: GearPaths;
}

// ---- Involute math --------------------------------------------------------

/**
 * Point on the involute of a circle with base radius `rb` at roll angle `t`.
 * Returns [x, y] relative to center at origin.
 */
function involutePoint(rb: number, t: number): [number, number] {
  const x = rb * (Math.cos(t) + t * Math.sin(t));
  const y = rb * (Math.sin(t) - t * Math.cos(t));
  return [x, y];
}

/**
 * Roll angle t on the involute at which the radial distance equals `r`.
 * t = sqrt((r/rb)^2 - 1)
 */
function involuteAngleAtRadius(rb: number, r: number): number {
  const ratio = r / rb;
  if (ratio <= 1) return 0;
  return Math.sqrt(ratio * ratio - 1);
}

/**
 * Polar angle (measured from center) of the involute point at roll angle t.
 * theta = t - atan(t)
 * This is the "involute function" inv(alpha).
 */
function involutePolarAngle(t: number): number {
  return t - Math.atan(t);
}

// ---- Gear path generation -------------------------------------------------

/**
 * Generate an SVG path string for an involute spur gear centered at origin.
 *
 * @param teeth - Number of teeth (N)
 * @param mod - Module (m)
 * @param pressureAngleDeg - Pressure angle in degrees (default 20)
 * @returns SVG path data string
 */
export function generateInvoluteGearPath(
  teeth: number,
  mod: number,
  pressureAngleDeg: number = DEFAULT_PRESSURE_ANGLE,
): string {
  const alpha = pressureAngleDeg * DEG;
  const pitchR = (mod * teeth) / 2;
  const baseR = pitchR * Math.cos(alpha);
  const outerR = pitchR + ADDENDUM_FACTOR * mod;
  const rootR = Math.max(pitchR - DEDENDUM_FACTOR * mod, baseR * 0.95);

  // Half-tooth angular width at the pitch circle
  const invAlpha = Math.tan(alpha) - alpha; // inv(pressure angle)
  const halfToothAngle = Math.PI / (2 * teeth) + invAlpha;

  // Roll angle limits
  const tRoot = baseR > rootR ? 0 : involuteAngleAtRadius(baseR, Math.max(rootR, baseR));
  const tOuter = involuteAngleAtRadius(baseR, outerR);

  const toothAngle = (2 * Math.PI) / teeth;
  const effectiveRootR = Math.max(rootR, baseR);
  const segments: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const toothCenterAngle = i * toothAngle;

    // --- Right flank (involute curve going outward) ---
    const rightFlankPoints: [number, number][] = [];
    for (let s = 0; s <= INVOLUTE_SEGMENTS; s++) {
      const t = tRoot + (tOuter - tRoot) * (s / INVOLUTE_SEGMENTS);
      const [ix, iy] = involutePoint(baseR, t);
      // Rotate the involute point to align with tooth center
      const r = Math.sqrt(ix * ix + iy * iy);
      const ptAngle = Math.atan2(iy, ix);
      const finalAngle = ptAngle + toothCenterAngle + halfToothAngle - involutePolarAngle(t);
      rightFlankPoints.push([
        r * Math.cos(finalAngle),
        r * Math.sin(finalAngle),
      ]);
    }

    // --- Left flank (mirror of right, going inward from outer to root) ---
    const leftFlankPoints: [number, number][] = [];
    for (let s = INVOLUTE_SEGMENTS; s >= 0; s--) {
      const t = tRoot + (tOuter - tRoot) * (s / INVOLUTE_SEGMENTS);
      const [ix, iy] = involutePoint(baseR, t);
      const r = Math.sqrt(ix * ix + iy * iy);
      const ptAngle = Math.atan2(iy, ix);
      // Mirror: subtract halfToothAngle + reflect
      const finalAngle = -ptAngle + toothCenterAngle - halfToothAngle + involutePolarAngle(t);
      leftFlankPoints.push([
        r * Math.cos(finalAngle),
        r * Math.sin(finalAngle),
      ]);
    }

    // We use the first point of right flank as root-start, and last of left flank
    // connects to next tooth's root via an arc.

    // Build path segments for this tooth
    const rf = rightFlankPoints;
    const lf = leftFlankPoints;

    if (i === 0) {
      segments.push(`M ${rf[0][0].toFixed(3)} ${rf[0][1].toFixed(3)}`);
    } else {
      // Root arc from previous tooth's left flank end to this tooth's right flank start
      segments.push(
        `A ${effectiveRootR.toFixed(3)} ${effectiveRootR.toFixed(3)} 0 0 0 ${rf[0][0].toFixed(3)} ${rf[0][1].toFixed(3)}`,
      );
    }

    // Right flank (root to tip)
    for (let s = 1; s < rf.length; s++) {
      segments.push(`L ${rf[s][0].toFixed(3)} ${rf[s][1].toFixed(3)}`);
    }

    // Tip arc from right flank top to left flank top
    const tipLeft = lf[0];
    segments.push(
      `A ${outerR.toFixed(3)} ${outerR.toFixed(3)} 0 0 1 ${tipLeft[0].toFixed(3)} ${tipLeft[1].toFixed(3)}`,
    );

    // Left flank (tip to root)
    for (let s = 1; s < lf.length; s++) {
      segments.push(`L ${lf[s][0].toFixed(3)} ${lf[s][1].toFixed(3)}`);
    }
  }

  // Close: root arc from last tooth back to first tooth
  segments.push(
    `A ${effectiveRootR.toFixed(3)} ${effectiveRootR.toFixed(3)} 0 0 0 ${segments[0].slice(2)}`,
  );
  segments.push("Z");

  return segments.join(" ");
}

// ---- Profile points for Three.js ------------------------------------------

/**
 * Interpolate points along a circular arc from angle a0 to a1 at radius r.
 * Returns `steps` intermediate points (excluding endpoints).
 */
function arcPoints(
  r: number,
  a0: number,
  a1: number,
  steps: number,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let s = 1; s <= steps; s++) {
    const a = a0 + (a1 - a0) * (s / (steps + 1));
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

/**
 * Return the gear involute profile as an array of [x, y] coordinate pairs
 * forming a closed polygon suitable for `new THREE.Shape()`.
 *
 * The points trace the full gear outline at origin (0, 0), going around the
 * gear in order with interpolated tip-arc and root-arc segments for smoothness.
 *
 * @param teeth - Number of teeth (N)
 * @param mod - Module (m)
 * @param pressureAngleDeg - Pressure angle in degrees (default 20)
 */
export function getInvoluteProfilePoints(
  teeth: number,
  mod: number,
  pressureAngleDeg: number = DEFAULT_PRESSURE_ANGLE,
): [number, number][] {
  const alpha = pressureAngleDeg * DEG;
  const pitchR = (mod * teeth) / 2;
  const baseR = pitchR * Math.cos(alpha);
  const outerR = pitchR + ADDENDUM_FACTOR * mod;
  const rootR = Math.max(pitchR - DEDENDUM_FACTOR * mod, baseR * 0.95);

  // Half-tooth angular width at the pitch circle
  const invAlpha = Math.tan(alpha) - alpha; // inv(pressure angle)
  const halfToothAngle = Math.PI / (2 * teeth) + invAlpha;

  // Roll angle limits
  const tRoot =
    baseR > rootR ? 0 : involuteAngleAtRadius(baseR, Math.max(rootR, baseR));
  const tOuter = involuteAngleAtRadius(baseR, outerR);

  const toothAngle = (2 * Math.PI) / teeth;
  const effectiveRootR = Math.max(rootR, baseR);

  const TIP_ARC_STEPS = 2; // interpolation points per tip arc
  const ROOT_ARC_STEPS = 1; // interpolation points per root arc

  const points: [number, number][] = [];

  for (let i = 0; i < teeth; i++) {
    const toothCenterAngle = i * toothAngle;

    // --- Right flank (involute curve going outward) ---
    const rightFlankPoints: [number, number][] = [];
    for (let s = 0; s <= INVOLUTE_SEGMENTS; s++) {
      const t = tRoot + (tOuter - tRoot) * (s / INVOLUTE_SEGMENTS);
      const [ix, iy] = involutePoint(baseR, t);
      const r = Math.sqrt(ix * ix + iy * iy);
      const ptAngle = Math.atan2(iy, ix);
      const finalAngle =
        ptAngle + toothCenterAngle + halfToothAngle - involutePolarAngle(t);
      rightFlankPoints.push([r * Math.cos(finalAngle), r * Math.sin(finalAngle)]);
    }

    // --- Left flank (mirror of right, going inward from outer to root) ---
    const leftFlankPoints: [number, number][] = [];
    for (let s = INVOLUTE_SEGMENTS; s >= 0; s--) {
      const t = tRoot + (tOuter - tRoot) * (s / INVOLUTE_SEGMENTS);
      const [ix, iy] = involutePoint(baseR, t);
      const r = Math.sqrt(ix * ix + iy * iy);
      const ptAngle = Math.atan2(iy, ix);
      const finalAngle =
        -ptAngle + toothCenterAngle - halfToothAngle + involutePolarAngle(t);
      leftFlankPoints.push([r * Math.cos(finalAngle), r * Math.sin(finalAngle)]);
    }

    // Root arc from previous tooth's left-flank end to this tooth's right-flank start
    if (i > 0) {
      const prev = points[points.length - 1];
      const next = rightFlankPoints[0];
      const a0 = Math.atan2(prev[1], prev[0]);
      const a1 = Math.atan2(next[1], next[0]);
      // Ensure we sweep the short way around (clockwise for standard winding)
      let da = a1 - a0;
      if (da > Math.PI) da -= 2 * Math.PI;
      if (da < -Math.PI) da += 2 * Math.PI;
      const interpPts = arcPoints(effectiveRootR, a0, a0 + da, ROOT_ARC_STEPS);
      points.push(...interpPts);
    }

    // Right flank points
    points.push(...rightFlankPoints);

    // Tip arc from right-flank top to left-flank top
    const tipRight = rightFlankPoints[rightFlankPoints.length - 1];
    const tipLeft = leftFlankPoints[0];
    const tipA0 = Math.atan2(tipRight[1], tipRight[0]);
    const tipA1 = Math.atan2(tipLeft[1], tipLeft[0]);
    let tipDa = tipA1 - tipA0;
    if (tipDa > Math.PI) tipDa -= 2 * Math.PI;
    if (tipDa < -Math.PI) tipDa += 2 * Math.PI;
    const tipInterp = arcPoints(outerR, tipA0, tipA0 + tipDa, TIP_ARC_STEPS);
    points.push(...tipInterp);

    // Left flank points
    points.push(...leftFlankPoints);
  }

  // Closing root arc: from last tooth's left-flank end back to first point
  const last = points[points.length - 1];
  const first = points[0];
  const ca0 = Math.atan2(last[1], last[0]);
  const ca1 = Math.atan2(first[1], first[0]);
  let cda = ca1 - ca0;
  if (cda > Math.PI) cda -= 2 * Math.PI;
  if (cda < -Math.PI) cda += 2 * Math.PI;
  const closingArc = arcPoints(effectiveRootR, ca0, ca0 + cda, ROOT_ARC_STEPS);
  points.push(...closingArc);

  return points;
}

// ---- Hole path ------------------------------------------------------------

/**
 * Generate an SVG circle path at origin with given radius.
 */
export function generateHolePath(holeRadius: number): string {
  const r = holeRadius;
  return [
    `M ${(-r).toFixed(3)} 0`,
    `A ${r.toFixed(3)} ${r.toFixed(3)} 0 1 0 ${r.toFixed(3)} 0`,
    `A ${r.toFixed(3)} ${r.toFixed(3)} 0 1 0 ${(-r).toFixed(3)} 0`,
    "Z",
  ].join(" ");
}

// ---- Spoke paths ----------------------------------------------------------

/**
 * Generate spoke window cutout paths for gears with >= SPOKE_TOOTH_THRESHOLD teeth.
 * Returns a single SVG path string containing all window cutouts,
 * or an empty string for small gears.
 */
export function generateSpokePaths(
  teeth: number,
  mod: number,
  spokeCount?: number,
): string {
  if (teeth < SPOKE_TOOTH_THRESHOLD) return '';

  const pitchR = (mod * teeth) / 2;
  const rootR = pitchR - DEDENDUM_FACTOR * mod;
  const holeRadius = rootR * 0.3;

  const hubR = holeRadius + (rootR - holeRadius) * 0.25;
  const rimR = rootR - mod * 0.5;

  if (rimR <= hubR + mod * 0.5) return ''; // Not enough room

  const count = spokeCount ?? Math.min(Math.max(Math.floor(teeth / 5), 4), 6);
  const windowAngle = (2 * Math.PI) / count;
  const spokeHalfWidth = windowAngle * 0.15; // spoke takes 30% of sector
  const windowHalfAngle = windowAngle / 2 - spokeHalfWidth;

  const paths: string[] = [];

  for (let i = 0; i < count; i++) {
    const centerAngle = i * windowAngle;
    const a0 = centerAngle - windowHalfAngle;
    const a1 = centerAngle + windowHalfAngle;

    // Window: inner arc (hub) -> radial line -> outer arc (rim) -> radial line -> close
    const p1x = hubR * Math.cos(a0);
    const p1y = hubR * Math.sin(a0);
    const p2x = rimR * Math.cos(a0);
    const p2y = rimR * Math.sin(a0);
    const p3x = rimR * Math.cos(a1);
    const p3y = rimR * Math.sin(a1);
    const p4x = hubR * Math.cos(a1);
    const p4y = hubR * Math.sin(a1);

    paths.push(
      [
        `M ${p1x.toFixed(3)} ${p1y.toFixed(3)}`,
        `L ${p2x.toFixed(3)} ${p2y.toFixed(3)}`,
        `A ${rimR.toFixed(3)} ${rimR.toFixed(3)} 0 0 1 ${p3x.toFixed(3)} ${p3y.toFixed(3)}`,
        `L ${p4x.toFixed(3)} ${p4y.toFixed(3)}`,
        `A ${hubR.toFixed(3)} ${hubR.toFixed(3)} 0 0 0 ${p1x.toFixed(3)} ${p1y.toFixed(3)}`,
        "Z",
      ].join(" "),
    );
  }

  return paths.join(' ');
}

// ---- Chain layout ---------------------------------------------------------

interface ChainDef {
  teethArray: number[];
  snakeAngles: number[]; // angles in degrees for each successive gear
  rootX: number; // root gear center x
  rootY: number; // root gear center y
  rootSpeed: number; // deg/frame
  moduleFactor: number; // outerR of largest gear = scale * moduleFactor
  layer: 'back' | 'mid' | 'front';
}

/**
 * Build a chain of meshing gears from a definition.
 */
function buildChain(def: ChainDef): GearChain {
  const { teethArray, snakeAngles, rootX, rootY, rootSpeed, moduleFactor, layer } = def;

  // Compute module: largest gear's outer radius = scale * moduleFactor
  // outerR = pitchR + m = m*N/2 + m = m*(N/2 + 1)
  // => m = (scale * moduleFactor) / (maxTeeth/2 + 1)
  // But moduleFactor is already baked with scale, so we receive it as target outer radius
  const maxTeeth = Math.max(...teethArray);
  const mod = moduleFactor / (maxTeeth / 2 + ADDENDUM_FACTOR);

  const alpha = DEFAULT_PRESSURE_ANGLE * DEG;

  const gears: PlacedGear[] = [];

  for (let i = 0; i < teethArray.length; i++) {
    const teeth = teethArray[i];
    const pitchRadius = (mod * teeth) / 2;
    const outerRadius = pitchRadius + ADDENDUM_FACTOR * mod;
    const innerRadius = Math.max(pitchRadius - DEDENDUM_FACTOR * mod, pitchRadius * Math.cos(alpha) * 0.95);
    const baseRadius = pitchRadius * Math.cos(alpha);

    if (i === 0) {
      // Root gear
      gears.push({
        teeth,
        module: mod,
        cx: rootX,
        cy: rootY,
        spec: { teeth, module: mod },
        pitchRadius,
        outerRadius,
        innerRadius,
        baseRadius,
        parentIndex: null,
        layer,
        phaseOffset: 0,
        gearRatio: 1,
        direction: 1,
      });
      continue;
    }

    const parent = gears[i - 1];
    const parentPitchR = (mod * parent.teeth) / 2;
    const childPitchR = pitchRadius;
    const centerDist = parentPitchR + childPitchR;

    // Place child at snake angle from parent
    const angleDeg = snakeAngles[i - 1];
    const angleRad = angleDeg * DEG;
    const cx = parent.cx + centerDist * Math.cos(angleRad);
    const cy = parent.cy + centerDist * Math.sin(angleRad);

    // Gear ratio: root teeth / this teeth (cumulative)
    const gearRatio = parent.gearRatio * (parent.teeth / teeth);
    const direction: 1 | -1 = parent.direction === 1 ? -1 : 1;

    // Phase offset for proper meshing
    // At mesh contact, parent tooth and child space must align.
    // Contact angle from parent center to child center
    const contactAngle = Math.atan2(cy - parent.cy, cx - parent.cx);
    const parentAngleAtContact = contactAngle * (180 / Math.PI);
    const childAngleAtContact = (contactAngle + Math.PI) * (180 / Math.PI);

    // For proper meshing: when parent has a tooth at the contact point,
    // child must have a gap. The angular pitch is 360/N degrees.
    const parentAngularPitch = 360 / parent.teeth;
    const childAngularPitch = 360 / teeth;

    // Parent tooth index at contact
    const parentPhaseAtContact =
      ((parentAngleAtContact - parent.phaseOffset) % parentAngularPitch + parentAngularPitch) % parentAngularPitch;

    // Child must have a gap center at the contact point
    // Gap center is offset by half a tooth pitch from a tooth center
    const childPhaseOffset =
      childAngleAtContact + childAngularPitch / 2 -
      (parentPhaseAtContact / parentAngularPitch) * childAngularPitch;

    gears.push({
      teeth,
      module: mod,
      cx,
      cy,
      spec: { teeth, module: mod },
      pitchRadius,
      outerRadius,
      innerRadius,
      baseRadius,
      parentIndex: i - 1,
      layer,
      phaseOffset: childPhaseOffset % 360,
      gearRatio,
      direction,
    });
  }

  return { gears, rootSpeed };
}

// ---- Public layout function -----------------------------------------------

/**
 * Create the full 3-chain gear layout for the viewport.
 */
export function createGearLayout(
  viewportWidth: number,
  viewportHeight: number,
): GearLayout {
  const scale = Math.min(viewportWidth, viewportHeight);

  const back = buildChain({
    teethArray: [32, 28, 36, 24, 32, 28, 24, 36, 20],
    snakeAngles: [-30, 25, -40, 50, -20, 35, -45, 30],
    rootX: viewportWidth * 0.08,
    rootY: viewportHeight * 0.75,
    rootSpeed: 0.08,
    moduleFactor: scale * 0.14,
    layer: 'back',
  });

  const mid = buildChain({
    teethArray: [24, 16, 28, 12, 20, 24, 14, 22, 16, 28, 18],
    snakeAngles: [-20, 40, -35, 55, -15, 30, -50, 25, -30, 45],
    rootX: viewportWidth * 0.12,
    rootY: viewportHeight * 0.18,
    rootSpeed: 0.12,
    moduleFactor: scale * 0.10,
    layer: 'mid',
  });

  const front = buildChain({
    teethArray: [14, 10, 18, 12, 16, 10, 14],
    snakeAngles: [40, -30, 55, -45, 35, -25],
    rootX: viewportWidth * 0.7,
    rootY: viewportHeight * 0.65,
    rootSpeed: 0.15,
    moduleFactor: scale * 0.06,
    layer: 'front',
  });

  return { back, mid, front };
}

// ---- Pre-compute helper ---------------------------------------------------

/**
 * Compute all SVG paths for a placed gear, returning a RenderGear.
 */
export function computeGearPaths(gear: PlacedGear): RenderGear {
  const { teeth, module: mod } = gear;
  const pitchR = (mod * teeth) / 2;
  const rootR = pitchR - DEDENDUM_FACTOR * mod;
  const holeRadius = Math.max(rootR * 0.3, mod);

  return {
    ...gear,
    paths: {
      profile: generateInvoluteGearPath(teeth, mod),
      hole: generateHolePath(holeRadius),
      spokes: generateSpokePaths(teeth, mod),
    },
  };
}
