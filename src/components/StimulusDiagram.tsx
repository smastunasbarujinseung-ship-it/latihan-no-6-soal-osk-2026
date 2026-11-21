import React from 'react';
import { PhysicsProblem } from '../data/problemsData';
import { computeDescentTime, toRadians } from '../physics/inclineEngine';

interface StimulusDiagramProps {
  problem: PhysicsProblem;
}

export const StimulusDiagram: React.FC<StimulusDiagramProps> = ({ problem }) => {
  const { stimulus } = problem;
  const width = 520;
  const height = 270;

  // Helper to draw a standard right-triangle wedge on horizontal base
  const drawWedgeScene = (opts: {
    angleDeg: number;
    angleLabel: string;
    baseLabel: string;
    heightLabel?: string;
    muLabel?: string;
    extraLabel?: string;
    isSphere?: boolean;
    hasWindArrow?: boolean;
    hasTrainFrame?: boolean;
    hasFlatExtension?: boolean;
  }) => {
    const rad = toRadians(Math.min(68, Math.max(20, opts.angleDeg)));
    const basePx = opts.hasFlatExtension ? 185 : 230;
    const maxH = 150;
    const rawH = basePx * Math.tan(rad);
    const hPx = Math.min(maxH, rawH);
    const actualBase = Math.max(135, hPx / Math.tan(rad));
    const effectiveH = actualBase * Math.tan(rad) > 165 ? 165 : hPx;

    const xLeft = opts.hasTrainFrame ? 115 : 105;
    const yBottom = 215;
    const xRight = xLeft + actualBase;
    const yTop = yBottom - effectiveH;

    // Block or sphere near top of slope
    const slopeLen = Math.hypot(actualBase, effectiveH);
    const ux = actualBase / slopeLen;
    const uy = effectiveH / slopeLen;
    const nx = uy;
    const ny = -ux;

    const distAlong = 36;
    const contactX = xLeft + ux * distAlong;
    const contactY = yTop + uy * distAlong;
    const blockH = 18;
    const cmX = contactX + nx * (opts.isSphere ? 13 : blockH * 0.5);
    const cmY = contactY + ny * (opts.isSphere ? 13 : blockH * 0.5);

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label={stimulus.caption}
      >
        <defs>
          <marker id="stim-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill="#5B3828" />
          </marker>
          <marker id="stim-blue-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill="#0284C7" />
          </marker>
        </defs>

        {/* Train frame outline if accelerating train */}
        {opts.hasTrainFrame && (
          <g>
            <rect
              x={68}
              y={32}
              width={360}
              height={196}
              rx={10}
              fill="#F4EEE7"
              fillOpacity={0.5}
              stroke="#80563F"
              strokeWidth={1.8}
              strokeDasharray="6 4"
            />
            <circle cx={125} cy={238} r={10} fill="#E9DDD1" stroke="#5B3828" strokeWidth={2} />
            <circle cx={370} cy={238} r={10} fill="#E9DDD1" stroke="#5B3828" strokeWidth={2} />
            <line
              x1={320}
              y1={56}
              x2={405}
              y2={56}
              stroke="#0284C7"
              strokeWidth={2.5}
              markerEnd="url(#stim-blue-arrow)"
            />
            <text x={312} y={48} fontSize={12} fontWeight={600} fill="#0284C7">
              {opts.extraLabel}
            </text>
          </g>
        )}

        {/* Ground line */}
        <line
          x1={45}
          y1={yBottom}
          x2={opts.hasFlatExtension ? 475 : xRight + 65}
          y2={yBottom}
          stroke="#80563F"
          strokeWidth={2}
        />

        {/* Rough flat floor ticks for Q15 */}
        {opts.hasFlatExtension && (
          <g>
            {Array.from({ length: 11 }).map((_, i) => (
              <line
                key={i}
                x1={xRight + 10 + i * 16}
                y1={yBottom}
                x2={xRight + 2 + i * 16}
                y2={yBottom + 8}
                stroke="#80563F"
                strokeWidth={1.3}
              />
            ))}
            <text x={xRight + 28} y={yBottom - 12} fontSize={12} fontWeight={600} fill="#5B3828">
              {opts.extraLabel}
            </text>
          </g>
        )}

        {/* Triangular Wedge */}
        <polygon
          points={`${xLeft},${yBottom} ${xRight},${yBottom} ${xLeft},${yTop}`}
          fill="#E9DDD1"
          fillOpacity={0.65}
          stroke="#5B3828"
          strokeWidth={2.2}
        />

        {/* Angle arc at bottom-right corner */}
        <path
          d={`M ${xRight - 30} ${yBottom} A 30 30 0 0 1 ${xRight - 30 * Math.cos(rad)} ${
            yBottom - 30 * Math.sin(rad)
          }`}
          fill="none"
          stroke="#C49A62"
          strokeWidth={2}
        />
        <text
          x={xRight - 36}
          y={yBottom - 9}
          textAnchor="end"
          fontSize={12}
          fontWeight={600}
          fill="#3B261E"
        >
          {opts.angleLabel}
        </text>

        {/* Base length dimension line */}
        <line x1={xLeft} y1={yBottom + 18} x2={xRight} y2={yBottom + 18} stroke="#5B3828" strokeWidth={1.3} />
        <line x1={xLeft} y1={yBottom + 12} x2={xLeft} y2={yBottom + 24} stroke="#5B3828" strokeWidth={1.3} />
        <line x1={xRight} y1={yBottom + 12} x2={xRight} y2={yBottom + 24} stroke="#5B3828" strokeWidth={1.3} />
        <text
          x={(xLeft + xRight) / 2}
          y={yBottom + 34}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={600}
          fill="#3B261E"
        >
          {opts.baseLabel}
        </text>

        {/* Height dimension line if present */}
        {opts.heightLabel && (
          <g>
            <line x1={xLeft - 18} y1={yTop} x2={xLeft - 18} y2={yBottom} stroke="#5B3828" strokeWidth={1.3} />
            <line x1={xLeft - 24} y1={yTop} x2={xLeft - 12} y2={yTop} stroke="#5B3828" strokeWidth={1.3} />
            <line x1={xLeft - 24} y1={yBottom} x2={xLeft - 12} y2={yBottom} stroke="#5B3828" strokeWidth={1.3} />
            <text
              x={xLeft - 26}
              y={(yTop + yBottom) / 2 + 4}
              textAnchor="end"
              fontSize={12.5}
              fontWeight={600}
              fill="#3B261E"
            >
              {opts.heightLabel}
            </text>
          </g>
        )}

        {/* Friction label along slope */}
        {opts.muLabel && (
          <text
            x={(xLeft + xRight) / 2 + nx * 18 + 10}
            y={(yTop + yBottom) / 2 + ny * 18}
            fontSize={12}
            fontWeight={600}
            fill="#80563F"
          >
            {opts.muLabel}
          </text>
        )}

        {/* Block or Solid Sphere */}
        {opts.isSphere ? (
          <g>
            <circle cx={cmX} cy={cmY} r={13} fill="#C49A62" stroke="#3B261E" strokeWidth={2} />
            <line x1={cmX} y1={cmY} x2={cmX + 9} y2={cmY - 6} stroke="#3B261E" strokeWidth={1.5} />
            <text x={cmX + nx * 22} y={cmY + ny * 22} fontSize={12} fontWeight={700} fill="#3B261E">
              Bola ({opts.extraLabel})
            </text>
          </g>
        ) : (
          <g transform={`translate(${cmX}, ${cmY}) rotate(${(rad * 180) / Math.PI})`}>
            <rect
              x={-14}
              y={-blockH / 2}
              width={28}
              height={blockH}
              rx={3}
              fill="#5B3828"
              stroke="#3B261E"
              strokeWidth={1.5}
            />
          </g>
        )}

        {!opts.isSphere && (
          <text x={cmX + nx * 20} y={cmY + ny * 20} fontSize={12.5} fontWeight={700} fill="#3B261E">
            A
          </text>
        )}

        {/* Motion tendency arrow */}
        <line
          x1={cmX + ux * 20 + nx * 10}
          y1={cmY + uy * 20 + ny * 10}
          x2={cmX + ux * 58 + nx * 10}
          y2={cmY + uy * 58 + ny * 10}
          stroke="#5B3828"
          strokeWidth={1.8}
          markerEnd="url(#stim-arrow)"
        />

        {/* Wind horizontal arrow if Q8 */}
        {opts.hasWindArrow && (
          <g>
            <line
              x1={cmX - 65}
              y1={cmY}
              x2={cmX - 20}
              y2={cmY}
              stroke="#0284C7"
              strokeWidth={2.5}
              markerEnd="url(#stim-blue-arrow)"
            />
            <text x={cmX - 95} y={cmY - 8} fontSize={12} fontWeight={600} fill="#0284C7">
              {opts.extraLabel}
            </text>
          </g>
        )}

        {/* Horizontal exit vector for Q12 */}
        {stimulus.type === 'horizontal-exit-vector' && (
          <g>
            <line
              x1={xRight}
              y1={yBottom - 6}
              x2={xRight + 64}
              y2={yBottom - 6}
              stroke="#0284C7"
              strokeWidth={2.4}
              markerEnd="url(#stim-blue-arrow)"
            />
            <text x={xRight + 16} y={yBottom - 16} fontSize={12} fontWeight={700} fill="#0284C7">
              v_x = v cos α
            </text>
          </g>
        )}
      </svg>
    );
  };

  if (stimulus.type === 'time-curve-optimal') {
    const mu = stimulus.muValueForPlot ?? 0.45;
    const minAngle = Math.ceil((Math.atan(mu) * 180) / Math.PI) + 4;
    const pts: Array<{ a: number; t: number }> = [];
    for (let a = minAngle; a <= 82; a += 1) {
      const t = computeDescentTime(4.0, a, mu, 9.8);
      if (Number.isFinite(t) && t < 5) pts.push({ a, t });
    }
    const padL = 56;
    const padR = 26;
    const padT = 26;
    const padB = 46;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;
    const maxT = 3.6;
    const minT = 1.0;

    const toX = (a: number) => padL + ((a - 25) / (85 - 25)) * plotW;
    const toY = (t: number) => padT + ((maxT - Math.min(maxT, t)) / (maxT - minT)) * plotH;

    const pathD = pts
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toX(p.a).toFixed(1)} ${toY(p.t).toFixed(1)}`)
      .join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" role="img" aria-label={stimulus.caption}>
        {/* Grid */}
        {[1.5, 2.0, 2.5, 3.0].map((tVal) => (
          <g key={tVal}>
            <line x1={padL} y1={toY(tVal)} x2={width - padR} y2={toY(tVal)} stroke="#E9DDD1" strokeWidth={1} />
            <text x={padL - 8} y={toY(tVal) + 4} textAnchor="end" fontSize={11} fill="#80563F">
              {tVal.toFixed(1).replace('.', ',')}
            </text>
          </g>
        ))}
        {[30, 45, 60, 75].map((aVal) => (
          <g key={aVal}>
            <line x1={toX(aVal)} y1={padT} x2={toX(aVal)} y2={height - padB} stroke="#E9DDD1" strokeWidth={1} />
            <text x={toX(aVal)} y={height - padB + 16} textAnchor="middle" fontSize={11} fill="#80563F">
              {aVal}°
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={padL} y1={padT} x2={padL} y2={height - padB} stroke="#5B3828" strokeWidth={1.8} />
        <line x1={padL} y1={height - padB} x2={width - padR} y2={height - padB} stroke="#5B3828" strokeWidth={1.8} />
        <text x={padL - 10} y={padT - 8} fontSize={11.5} fontWeight={600} fill="#3B261E">
          t (s)
        </text>
        <text x={width - padR} y={height - 10} textAnchor="end" fontSize={11.5} fontWeight={600} fill="#3B261E">
          Sudut α (°)
        </text>

        {/* Curve */}
        <path d={pathD} fill="none" stroke="#5B3828" strokeWidth={2.6} />

        {/* Question marker near bottom valley without revealing exact numeric answer */}
        <circle cx={toX(57.1)} cy={toY(1.59)} r={5} fill="#C49A62" stroke="#3B261E" strokeWidth={1.5} />
        <text x={toX(57.1)} y={toY(1.59) - 12} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#5B3828">
          t_min = ? (ℓ = 4,0 m, μ = 0,45)
        </text>
      </svg>
    );
  }

  if (stimulus.type === 'dual-angle-symmetry' || stimulus.type === 'two-angle-ratio-table') {
    const a1 = stimulus.angleDeg ?? 38;
    const a2 = stimulus.secondaryAngleDeg ?? 69;
    const basePx = 220;
    const xL = 70;
    const yB = 220;
    const xR = xL + basePx;
    const h1 = Math.min(165, basePx * Math.tan(toRadians(a1)));
    const h2 = Math.min(185, basePx * Math.tan(toRadians(Math.min(62, a2))));

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" role="img" aria-label={stimulus.caption}>
        <line x1={40} y1={yB} x2={xR + 40} y2={yB} stroke="#80563F" strokeWidth={2} />
        <line x1={xL} y1={yB} x2={xL} y2={yB - h2 - 12} stroke="#80563F" strokeWidth={1.5} strokeDasharray="4 4" />

        {/* Steep slope alpha2 */}
        <line x1={xL} y1={yB - h2} x2={xR} y2={yB} stroke="#C49A62" strokeWidth={2.5} />
        {/* Gentle slope alpha1 */}
        <line x1={xL} y1={yB - h1} x2={xR} y2={yB} stroke="#5B3828" strokeWidth={2.5} />

        <text x={xL + 8} y={yB - h1 - 6} fontSize={12} fontWeight={600} fill="#5B3828">
          Lintasan 1 (α₁ = {a1}°)
        </text>
        <text x={xL + 8} y={yB - h2 - 6} fontSize={12} fontWeight={600} fill="#80563F">
          Lintasan 2 (α₂ = {stimulus.type === 'dual-angle-symmetry' ? '?' : `${a2}°`})
        </text>

        {/* Base label */}
        <text x={(xL + xR) / 2} y={yB + 22} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="#3B261E">
          {stimulus.baseLengthLabel}
        </text>

        {/* Info box on right */}
        <rect x={320} y={48} width={175} height={116} rx={10} fill="#F4EEE7" stroke="#E9DDD1" strokeWidth={1.5} />
        <text x={335} y={76} fontSize={12} fontWeight={700} fill="#3B261E">
          Data Perbandingan
        </text>
        <text x={335} y={100} fontSize={12} fill="#5B3828">
          {stimulus.type === 'dual-angle-symmetry' ? 'Syarat: t(α₁) = t(α₂)' : stimulus.extraLabel}
        </text>
        <text x={335} y={122} fontSize={12} fill="#5B3828">
          {stimulus.muLabel ?? 'Alas ℓ identik'}
        </text>
        <text x={335} y={144} fontSize={11.5} fill="#80563F">
          {stimulus.type === 'dual-angle-symmetry' ? 'Cari α₂ > α_opt' : 'Cari nilai μ'}
        </text>
      </svg>
    );
  }

  if (stimulus.type === 'cart-on-rough-slope') {
    const beta = 15;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" role="img" aria-label={stimulus.caption}>
        {/* Outer rough slope at beta = 15 deg */}
        <line x1={40} y1={230} x2={480} y2={230} stroke="#80563F" strokeWidth={1.5} strokeDasharray="4 4" />
        <path d="M 40 110 L 480 230" stroke="#5B3828" strokeWidth={3} />
        <path d="M 380 230 A 70 70 0 0 1 384 204" fill="none" stroke="#C49A62" strokeWidth={2} />
        <text x={342} y={222} fontSize={12} fontWeight={600} fill="#3B261E">
          β = {beta}° (μ_k = 0,20)
        </text>

        {/* Cart rotated by 15 deg */}
        <g transform="translate(230, 145) rotate(15)">
          <rect x={-105} y={-88} width={210} height={80} rx={8} fill="#F4EEE7" stroke="#5B3828" strokeWidth={2} />
          {/* Internal small wedge */}
          <polygon points="-65,-10 55,-10 -65,-72" fill="#E9DDD1" stroke="#3B261E" strokeWidth={1.8} />
          <rect x={-62} y={-82} width={16} height={12} rx={2} fill="#5B3828" transform="rotate(27 -54 -76)" />
          <text x={14} y={-16} fontSize={11.5} fontWeight={600} fill="#3B261E">
            α = ?
          </text>
          <text x={-5} y={2} fontSize={11} fontWeight={600} fill="#80563F">
            ℓ = 2,0 m (μ_A = 0,60)
          </text>
          {/* Wheels */}
          <circle cx={-65} cy={0} r={9} fill="#C49A62" stroke="#3B261E" strokeWidth={1.8} />
          <circle cx={65} cy={0} r={9} fill="#C49A62" stroke="#3B261E" strokeWidth={1.8} />
        </g>
      </svg>
    );
  }

  if (stimulus.type === 'tilted-target-wall') {
    // Point O at top-left (120, 52). Tilted target wall makes psi=60 deg with horizontal.
    const ox = 120;
    const oy = 52;
    const wallTopX = 330;
    const wallTopY = 48;
    const wallBotX = 215;
    const wallBotY = 246;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" role="img" aria-label={stimulus.caption}>
        {/* Horizontal reference from O */}
        <line x1={ox} y1={oy} x2={340} y2={oy} stroke="#80563F" strokeWidth={1.3} strokeDasharray="4 4" />
        {/* Horizontal floor at bottom */}
        <line x1={70} y1={wallBotY} x2={420} y2={wallBotY} stroke="#80563F" strokeWidth={1.8} />

        {/* Tilted target wall */}
        <line x1={wallBotX} y1={wallBotY} x2={wallTopX} y2={wallTopY} stroke="#3B261E" strokeWidth={4} />
        <text x={wallTopX + 8} y={wallTopY + 24} fontSize={12} fontWeight={600} fill="#3B261E">
          Dinding Target
        </text>
        <text x={wallBotX + 26} y={wallBotY - 8} fontSize={12} fontWeight={600} fill="#C49A62">
          ψ = 60°
        </text>

        {/* Perpendicular distance d dashed line */}
        <line x1={ox} y1={oy} x2={252} y2={128} stroke="#0284C7" strokeWidth={1.8} strokeDasharray="5 4" />
        <text x={182} y={82} fontSize={12} fontWeight={600} fill="#0284C7">
          d = 2,5 m (⊥)
        </text>

        {/* Candidate ramp from O to wall */}
        <line x1={ox} y1={oy} x2={238} y2={206} stroke="#5B3828" strokeWidth={3} />
        <circle cx={ox} cy={oy} r={5} fill="#5B3828" />
        <text x={ox - 16} y={oy - 6} fontSize={12.5} fontWeight={700} fill="#3B261E">
          O
        </text>
        <text x={165} y={66} fontSize={12} fontWeight={600} fill="#5B3828">
          α = ? (μ = 0,40)
        </text>
      </svg>
    );
  }

  return drawWedgeScene({
    angleDeg: stimulus.angleDeg ?? 45,
    angleLabel: stimulus.angleLabel ?? 'α',
    baseLabel: stimulus.baseLengthLabel ?? 'ℓ',
    heightLabel: stimulus.heightLabel,
    muLabel: stimulus.muLabel,
    extraLabel: stimulus.extraLabel,
    isSphere: stimulus.type === 'rolling-sphere-incline',
    hasWindArrow: stimulus.type === 'horizontal-force-wind',
    hasTrainFrame: stimulus.type === 'accelerating-train-cart',
    hasFlatExtension: stimulus.type === 'incline-plus-flat-floor',
  });
};
