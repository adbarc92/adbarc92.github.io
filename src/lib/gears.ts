export interface GearConfig {
  cx: number;
  cy: number;
  teeth: number;
  innerRadius: number;
  outerRadius: number;
  toothDepth?: number;
  holeRadius?: number;
}

export interface GearData {
  config: GearConfig;
  path: string;
  holePath: string;
  rotation: number;
  speed: number;
  direction: 1 | -1;
}

export function generateGearPath(config: GearConfig): string {
  const { cx, cy, teeth, innerRadius, outerRadius } = config;
  const toothDepth = config.toothDepth ?? 0.4;

  const baseRadius = innerRadius + (outerRadius - innerRadius) * (1 - toothDepth);
  const tipRadius = outerRadius;
  const anglePerTooth = (2 * Math.PI) / teeth;
  const toothWidthFraction = 0.35;

  const points: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const startAngle = i * anglePerTooth;

    // Valley start
    const valleyStartAngle = startAngle;
    const vsx = cx + baseRadius * Math.cos(valleyStartAngle);
    const vsy = cy + baseRadius * Math.sin(valleyStartAngle);

    // Tooth rise (start of tooth top)
    const toothStartAngle = startAngle + anglePerTooth * (0.5 - toothWidthFraction / 2);
    const tsx = cx + tipRadius * Math.cos(toothStartAngle);
    const tsy = cy + tipRadius * Math.sin(toothStartAngle);

    // Tooth top end
    const toothEndAngle = startAngle + anglePerTooth * (0.5 + toothWidthFraction / 2);
    const tex = cx + tipRadius * Math.cos(toothEndAngle);
    const tey = cy + tipRadius * Math.sin(toothEndAngle);

    // Valley end
    const valleyEndAngle = startAngle + anglePerTooth;
    const vex = cx + baseRadius * Math.cos(valleyEndAngle);
    const vey = cy + baseRadius * Math.sin(valleyEndAngle);

    if (i === 0) {
      points.push(`M ${vsx} ${vsy}`);
    } else {
      points.push(`L ${vsx} ${vsy}`);
    }
    points.push(`L ${tsx} ${tsy}`);
    points.push(`L ${tex} ${tey}`);
    points.push(`L ${vex} ${vey}`);
  }

  points.push("Z");
  return points.join(" ");
}

export function generateHolePath(config: GearConfig): string {
  const { cx, cy, innerRadius } = config;
  const holeRadius = config.holeRadius ?? innerRadius * 0.4;

  // Circle path using two arcs
  return [
    `M ${cx - holeRadius} ${cy}`,
    `A ${holeRadius} ${holeRadius} 0 1 0 ${cx + holeRadius} ${cy}`,
    `A ${holeRadius} ${holeRadius} 0 1 0 ${cx - holeRadius} ${cy}`,
    "Z",
  ].join(" ");
}

export function createGearLayout(
  viewportWidth: number,
  viewportHeight: number,
): GearData[] {
  const scale = Math.min(viewportWidth, viewportHeight);
  const baseSpeed = 0.15;
  const refTeeth = 24;

  const configs: { cx: number; cy: number; teeth: number; rInner: number; rOuter: number }[] = [
    // Large center-left (32 teeth)
    { cx: viewportWidth * 0.3, cy: viewportHeight * 0.5, teeth: 32, rInner: scale * 0.1, rOuter: scale * 0.16 },
    // Medium top-right (20 teeth)
    { cx: viewportWidth * 0.75, cy: viewportHeight * 0.25, teeth: 20, rInner: scale * 0.06, rOuter: scale * 0.1 },
    // Small between (14 teeth)
    { cx: viewportWidth * 0.52, cy: viewportHeight * 0.35, teeth: 14, rInner: scale * 0.04, rOuter: scale * 0.07 },
    // Large bottom-right (28 teeth)
    { cx: viewportWidth * 0.8, cy: viewportHeight * 0.75, teeth: 28, rInner: scale * 0.09, rOuter: scale * 0.14 },
    // Small bottom-left (16 teeth)
    { cx: viewportWidth * 0.15, cy: viewportHeight * 0.8, teeth: 16, rInner: scale * 0.045, rOuter: scale * 0.075 },
    // Medium top-left (22 teeth)
    { cx: viewportWidth * 0.15, cy: viewportHeight * 0.2, teeth: 22, rInner: scale * 0.065, rOuter: scale * 0.105 },
    // Small right-edge (12 teeth)
    { cx: viewportWidth * 0.92, cy: viewportHeight * 0.5, teeth: 12, rInner: scale * 0.035, rOuter: scale * 0.06 },
    // Large bottom-center (36 teeth)
    { cx: viewportWidth * 0.5, cy: viewportHeight * 0.85, teeth: 36, rInner: scale * 0.11, rOuter: scale * 0.18 },
  ];

  return configs.map((c, i) => {
    const gearConfig: GearConfig = {
      cx: c.cx,
      cy: c.cy,
      teeth: c.teeth,
      innerRadius: c.rInner,
      outerRadius: c.rOuter,
    };

    return {
      config: gearConfig,
      path: generateGearPath(gearConfig),
      holePath: generateHolePath(gearConfig),
      rotation: 0,
      speed: (baseSpeed * refTeeth) / c.teeth,
      direction: (i % 2 === 0 ? 1 : -1) as 1 | -1,
    };
  });
}
