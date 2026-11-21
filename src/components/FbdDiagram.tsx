import React from 'react';
import { FbdForce } from '../data/problemsData';
import { toRadians } from '../physics/inclineEngine';

interface FbdDiagramProps {
  inclineAngleDeg: number;
  forces: FbdForce[];
  relevant: boolean;
  note?: string;
}

export const FbdDiagram: React.FC<FbdDiagramProps> = ({
  inclineAngleDeg,
  forces,
  relevant,
  note,
}) => {
  if (!relevant || forces.length === 0) {
    return (
      <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-xl p-5 text-sm text-[#80563F]">
        <p className="font-semibold text-[#3B261E] mb-1">Diagram Analisis Matematis (Non-FBD)</p>
        <p>{note || 'Persoalan ini berfokus pada analisis kurva dan kesimetrian fungsi trigonometri.'}</p>
      </div>
    );
  }

  const width = 440;
  const height = 270;
  const cx = 205;
  const cy = 140;
  const rad = toRadians(inclineAngleDeg);

  // Slope goes down-right at angle inclineAngleDeg below +x
  const slopeDx = Math.cos(rad);
  const slopeDy = Math.sin(rad); // positive y in SVG is down
  const normalDx = Math.sin(rad);
  const normalDy = -Math.cos(rad);

  // Contact point is shifted along inward normal from CM
  const blockHalfH = 18;
  const contactX = cx - normalDx * blockHalfH;
  const contactY = cy - normalDy * blockHalfH;

  return (
    <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold tracking-wide text-[#5B3828]">
          Free Body Diagram (FBD)
        </span>
        <span className="text-xs text-[#80563F] font-mono-num">α = {inclineAngleDeg.toFixed(1).replace('.', ',')}°</span>
      </div>
      {note && <p className="text-xs text-[#80563F] mb-2">{note}</p>}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[440px] mx-auto h-auto select-none"
        role="img"
        aria-label="Free Body Diagram gaya-gaya yang bekerja pada benda di bidang miring"
      >
        <defs>
          {forces.map((f) => (
            <marker
              key={`marker-${f.id}`}
              id={`fbd-arrow-${f.id}`}
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L7,3 z" fill={f.color} />
            </marker>
          ))}
          <marker id="axis-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#80563F" />
          </marker>
        </defs>

        {/* Reference slope line */}
        <line
          x1={contactX - slopeDx * 130}
          y1={contactY - slopeDy * 130}
          x2={contactX + slopeDx * 130}
          y2={contactY + slopeDy * 130}
          stroke="#C49A62"
          strokeWidth="2"
          strokeDasharray="5 4"
        />

        {/* Coordinate axes x' and y' */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + slopeDx * 95}
          y2={cy + slopeDy * 95}
          stroke="#80563F"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          markerEnd="url(#axis-arrow)"
        />
        <text
          x={cx + slopeDx * 104}
          y={cy + slopeDy * 104 + 4}
          fontSize="11"
          fill="#80563F"
          fontStyle="italic"
        >
          +x&apos;
        </text>

        <line
          x1={cx}
          y1={cy}
          x2={cx + normalDx * 88}
          y2={cy + normalDy * 88}
          stroke="#80563F"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          markerEnd="url(#axis-arrow)"
        />
        <text
          x={cx + normalDx * 96}
          y={cy + normalDy * 96}
          fontSize="11"
          fill="#80563F"
          fontStyle="italic"
        >
          +y&apos;
        </text>

        {/* Rotated block centered at (cx, cy) */}
        <g transform={`translate(${cx}, ${cy}) rotate(${inclineAngleDeg})`}>
          <rect
            x={-26}
            y={-blockHalfH}
            width={52}
            height={blockHalfH * 2}
            rx={4}
            fill="#F4EEE7"
            stroke="#5B3828"
            strokeWidth="2"
          />
          <circle cx={0} cy={0} r={3} fill="#3B261E" />
        </g>

        {/* Force vectors */}
        {forces.map((f) => {
          const aRad = toRadians(f.angleFromHorizontalDeg);
          // SVG y points down, so dy = -sin(angle)
          const dx = Math.cos(aRad);
          const dy = -Math.sin(aRad);
          const len = f.id === 'W' ? 76 : f.id === 'N' ? 68 : 58;
          const ox = f.origin === 'cm' ? cx : contactX;
          const oy = f.origin === 'cm' ? cy : contactY;
          const ex = ox + dx * len;
          const ey = oy + dy * len;

          // Position label cleanly slightly past tip
          const lx = ex + dx * 14 + (dx < -0.2 ? -24 : 4);
          const ly = ey + dy * 12 + (dy > 0.3 ? 12 : 0);

          return (
            <g key={f.id}>
              <line
                x1={ox}
                y1={oy}
                x2={ex}
                y2={ey}
                stroke={f.color}
                strokeWidth="2.6"
                markerEnd={`url(#fbd-arrow-${f.id})`}
              />
              <text
                x={Math.max(12, Math.min(width - 80, lx))}
                y={Math.max(16, Math.min(height - 10, ly))}
                fontSize="12"
                fontWeight="600"
                fill={f.color}
              >
                {f.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
