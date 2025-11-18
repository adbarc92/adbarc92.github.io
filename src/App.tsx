import React, { useState, useEffect } from 'react';

interface Spark {
  id: number;
  line: number;
  progress: number;
  opacity: number;
}

interface LineContent {
  text: string;
  symbol: string;
  circleText: string;
}

const lineContents: LineContent[] = [
  {
    text: 'KNOWLEDGE',
    symbol: '◈',
    circleText: 'SEEK • LEARN • DISCOVER • GROW',
  },
  {
    text: 'POWER',
    symbol: '⬡',
    circleText: 'STRENGTH • ENERGY • FORCE • WILL',
  },
  {
    text: 'WISDOM',
    symbol: '◇',
    circleText: 'INSIGHT • UNDERSTANDING • CLARITY • TRUTH',
  },
  {
    text: 'HARMONY',
    symbol: '◆',
    circleText: 'BALANCE • PEACE • UNITY • FLOW',
  },
];

const FuturisticGeometric: React.FC = () => {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  const centerX = size / 2;
  const centerY = size / 2;
  const diamondSize = size * 0.08;
  const diamondDiagonal = diamondSize * Math.sqrt(2);
  const circleRadius = diamondDiagonal * 2;

  // Diamond corners (rotated 45 degrees)
  const diamondCorners = [
    { x: centerX, y: centerY - diamondSize }, // top
    { x: centerX + diamondSize, y: centerY }, // right
    { x: centerX, y: centerY + diamondSize }, // bottom
    { x: centerX - diamondSize, y: centerY }, // left
  ];

  // Circle intersection points (perpendicular from diamond corners)
  const circlePoints = diamondCorners.map((corner) => {
    const angle = Math.atan2(corner.y - centerY, corner.x - centerX);
    return {
      x: centerX + circleRadius * Math.cos(angle),
      y: centerY + circleRadius * Math.sin(angle),
    };
  });

  // Outer square corners
  const squareCorners = [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
  ];

  // Lines from square corners to circle
  const outerLines = squareCorners.map((corner) => {
    const angle = Math.atan2(corner.y - centerY, corner.x - centerX);
    const circleX = centerX + circleRadius * Math.cos(angle);
    const circleY = centerY + circleRadius * Math.sin(angle);
    return { start: corner, end: { x: circleX, y: circleY } };
  });

  // Generate sparks
  useEffect(() => {
    const interval = setInterval(() => {
      const newSpark: Spark = {
        id: Date.now() + Math.random(),
        line: Math.floor(Math.random() * 4),
        progress: 0,
        opacity: 1,
      };
      setSparks((prev) => [...prev, newSpark]);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Animate sparks
  useEffect(() => {
    const interval = setInterval(() => {
      setSparks((prev) =>
        prev
          .map((spark) => ({
            ...spark,
            progress: spark.progress + 0.02,
            opacity: spark.opacity - 0.015,
          }))
          .filter((spark) => spark.opacity > 0),
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const handleLineClick = (lineIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Calculate rotation needed to align with outer square
    const targetAngles = [-45, 45, 135, -135]; // angles to corners
    const targetAngle = targetAngles[lineIndex];

    setTimeout(() => {
      setRotationAngle(targetAngle);
    }, 500);

    setTimeout(() => {
      setIsRevealing(true);
    }, 1500);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center overflow-hidden">
      <svg
        width={size}
        height={size}
        className="transition-all duration-1000"
        style={{
          filter: 'drop-shadow(0 0 40px rgba(255, 204, 0, 0.3))',
          transform: `rotate(${rotationAngle}deg)`,
        }}
      >
        <defs>
          <radialGradient id="yellowGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>

          <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer square segments that will pull back */}
        {isRevealing ? (
          <>
            <polygon
              points={`0,0 ${size / 2},${size / 2} 0,${size}`}
              fill="url(#diamondGrad)"
              opacity="0.8"
              className="transition-all duration-1000"
              style={{
                transform: `translate(-${size}px, 0)`,
                transformOrigin: 'center',
              }}
            />
            <polygon
              points={`0,0 ${size / 2},${size / 2} ${size},0`}
              fill="url(#diamondGrad)"
              opacity="0.8"
              className="transition-all duration-1000"
              style={{
                transform: `translate(0, -${size}px)`,
                transformOrigin: 'center',
              }}
            />
            <polygon
              points={`${size},0 ${size / 2},${size / 2} ${size},${size}`}
              fill="url(#diamondGrad)"
              opacity="0.8"
              className="transition-all duration-1000"
              style={{
                transform: `translate(${size}px, 0)`,
                transformOrigin: 'center',
              }}
            />
            <polygon
              points={`0,${size} ${size / 2},${size / 2} ${size},${size}`}
              fill="url(#diamondGrad)"
              opacity="0.8"
              className="transition-all duration-1000"
              style={{
                transform: `translate(0, ${size}px)`,
                transformOrigin: 'center',
              }}
            />
          </>
        ) : null}

        {/* Lines from outer square corners to circle */}
        {outerLines.map((line, i) => (
          <line
            key={`outer-${i}`}
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
            stroke="#4b5563"
            strokeWidth="2"
            opacity="0.6"
          />
        ))}

        {/* Golden pulsing circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={circleRadius}
          fill="none"
          stroke="url(#yellowGlow)"
          strokeWidth="4"
          filter="url(#glow)"
        >
          <animate
            attributeName="r"
            values={`${circleRadius};${circleRadius + 5};${circleRadius}`}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.9;1;0.9"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Rotating text around circle */}
        {hoveredLine !== null && (
          <g>
            <path
              id="circlePath"
              d={`M ${centerX + circleRadius}, ${centerY}
                  a ${circleRadius},${circleRadius} 0 1,1 -${circleRadius * 2},0
                  a ${circleRadius},${circleRadius} 0 1,1 ${
                circleRadius * 2
              },0`}
              fill="none"
            />
            <text
              fill="#fbbf24"
              fontSize="16"
              fontWeight="bold"
              letterSpacing="4"
            >
              <textPath href="#circlePath" startOffset="0%">
                <animate
                  attributeName="startOffset"
                  from="0%"
                  to="100%"
                  dur="10s"
                  repeatCount="indefinite"
                />
                {lineContents[hoveredLine].circleText}
              </textPath>
            </text>
          </g>
        )}

        {/* Lines from diamond corners to circle with sparks */}
        {diamondCorners.map((corner, i) => {
          const circlePoint = circlePoints[i];
          const isHovered = hoveredLine === i;

          return (
            <g key={`line-${i}`}>
              <line
                x1={corner.x}
                y1={corner.y}
                x2={circlePoint.x}
                y2={circlePoint.y}
                stroke="#000000"
                strokeWidth="3"
                opacity="0.8"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredLine(i)}
                onMouseLeave={() => setHoveredLine(null)}
                onClick={() => handleLineClick(i)}
              />

              {/* Sparks on this line */}
              {sparks
                .filter((spark) => spark.line === i)
                .map((spark) => {
                  const x =
                    corner.x + (circlePoint.x - corner.x) * spark.progress;
                  const y =
                    corner.y + (circlePoint.y - corner.y) * spark.progress;
                  return (
                    <circle
                      key={spark.id}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#fbbf24"
                      opacity={spark.opacity}
                      filter="url(#glow)"
                    />
                  );
                })}

              {/* Rising text on hover */}
              {isHovered && (
                <text
                  x={(corner.x + circlePoint.x) / 2}
                  y={(corner.y + circlePoint.y) / 2}
                  fill="#fbbf24"
                  fontSize="20"
                  fontWeight="bold"
                  textAnchor="middle"
                  filter="url(#glow)"
                  opacity="0"
                >
                  <animate
                    attributeName="y"
                    from={(corner.y + circlePoint.y) / 2 + 20}
                    to={(corner.y + circlePoint.y) / 2 - 10}
                    dur="1s"
                    fill="freeze"
                  />
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    dur="0.5s"
                    fill="freeze"
                  />
                  {lineContents[i].text}
                </text>
              )}
            </g>
          );
        })}

        {/* Center diamond */}
        <rect
          x={centerX - diamondSize}
          y={centerY - diamondSize}
          width={diamondSize * 2}
          height={diamondSize * 2}
          transform={`rotate(45 ${centerX} ${centerY})`}
          fill="url(#diamondGrad)"
          stroke="#60a5fa"
          strokeWidth="3"
          filter="url(#glow)"
        />

        {/* Symbol in center diamond */}
        <text
          x={centerX}
          y={centerY + diamondSize * 0.3}
          fill="#ffffff"
          fontSize={diamondSize * 1.2}
          fontWeight="bold"
          textAnchor="middle"
          filter="url(#glow)"
        >
          {hoveredLine !== null ? lineContents[hoveredLine].symbol : '◈'}
        </text>
      </svg>
    </div>
  );
};

export default FuturisticGeometric;
