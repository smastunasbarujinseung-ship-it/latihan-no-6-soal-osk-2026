import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { SimConfig } from '../data/problemsData';
import {
  computeInclineAcceleration,
  computeOptimalAngle,
  simulateInclineStep,
  MotionState,
  toRadians,
  computeSphereDescentTime,
} from '../physics/inclineEngine';

interface PhysicsProofCanvasProps {
  config: SimConfig;
  title?: string;
  compact?: boolean;
}

const SPEEDS = [0.25, 0.5, 1, 2];

export const PhysicsProofCanvas: React.FC<PhysicsProofCanvasProps> = ({
  config,
  title = 'Animasi Pembuktian Kejadian Fisika',
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<{
    t: number;
    s: number;
    v: number;
    a: number;
    tCompare: number | null;
    finished: boolean;
  }>({
    t: 0,
    s: 0,
    v: 0,
    a: 0,
    tCompare: null,
    finished: false,
  });

  const simRef = useRef<{
    primary: MotionState;
    compare: MotionState | null;
    floorPhase: boolean;
    floorX: number;
  }>({
    primary: { t: 0, s: 0, v: 0, a: 0, x: 0, y: 0, finished: false },
    compare: null,
    floorPhase: false,
    floorX: 0,
  });

  const getEffectiveParams = () => {
    const g = config.g || 9.8;
    const rad = toRadians(config.angleDeg);
    let aPrimary = computeInclineAcceleration(config.angleDeg, config.mu, g);

    if (config.mode === 'wind-force' && config.kappa !== undefined) {
      aPrimary =
        g *
        ((1 + config.mu * config.kappa) * Math.sin(rad) -
          (config.mu - config.kappa) * Math.cos(rad));
    } else if (config.mode === 'train-frame' && config.kappa !== undefined) {
      aPrimary =
        g *
        ((1 - config.mu * config.kappa) * Math.sin(rad) -
          (config.mu + config.kappa) * Math.cos(rad));
    } else if (config.mode === 'cart-rough-slope' && config.muSecondary !== undefined) {
      const betaRad = toRadians(config.betaDeg ?? 15);
      aPrimary =
        g *
        Math.cos(betaRad) *
        ((1 + config.mu * config.muSecondary) * Math.sin(rad) -
          (config.mu - config.muSecondary) * Math.cos(rad));
    } else if (config.mode === 'sphere-roll-slip') {
      const slipCheck = computeSphereDescentTime(config.baseLength, config.angleDeg, config.mu, g);
      if (!slipCheck.isSlipping) {
        aPrimary = (5 / 7) * g * Math.sin(rad);
      }
    }

    let aCompare: number | undefined;
    if (config.compareAngleDeg !== undefined) {
      const cRad = toRadians(config.compareAngleDeg);
      if (config.mode === 'sphere-roll-slip') {
        const cCheck = computeSphereDescentTime(config.baseLength, config.compareAngleDeg, config.mu, g);
        aCompare = cCheck.isSlipping
          ? computeInclineAcceleration(config.compareAngleDeg, config.mu, g)
          : (5 / 7) * g * Math.sin(cRad);
      } else {
        aCompare = computeInclineAcceleration(config.compareAngleDeg, config.mu, g);
      }
    }

    return { aPrimary, aCompare };
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    const { aPrimary, aCompare } = getEffectiveParams();
    simRef.current = {
      primary: { t: 0, s: 0, v: 0, a: aPrimary, x: 0, y: 0, finished: false },
      compare:
        config.compareAngleDeg !== undefined
          ? { t: 0, s: 0, v: 0, a: aCompare ?? 0, x: 0, y: 0, finished: false }
          : null,
      floorPhase: false,
      floorX: 0,
    };
    setTelemetry({
      t: 0,
      s: 0,
      v: 0,
      a: Math.max(0, aPrimary),
      tCompare: config.compareAngleDeg !== undefined ? 0 : null,
      finished: false,
    });
    drawFrame();
  };

  useEffect(() => {
    resetSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.mode, config.angleDeg, config.compareAngleDeg, config.mu, config.baseLength, config.kappa, config.psiDeg]);

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    label?: string
  ) => {
    const headLen = 7;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.font = '600 11px "DM Sans", sans-serif';
      ctx.fillText(label, x2 + 6, y2 + 4);
    }
    ctx.restore();
  };

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Cream background
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(0, 0, w, h);

    const hasCompare = simRef.current.compare !== null && config.compareAngleDeg !== undefined;
    const yGround = h - 38;
    const xLeft = 65;

    if (config.mode === 'tilted-wall') {
      // Tilted target wall mode (Soal 14)
      const ox = 110;
      const oy = 48;
      const psiRad = toRadians(config.psiDeg ?? 60);
      const alphaRad = toRadians(config.angleDeg);
      const scale = 68;
      const sMax = config.baseLength / Math.sin(alphaRad + psiRad);
      const endX = ox + sMax * Math.cos(alphaRad) * scale;
      const endY = oy + sMax * Math.sin(alphaRad) * scale;

      // Ground
      ctx.strokeStyle = '#80563F';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, yGround);
      ctx.lineTo(w - 40, yGround);
      ctx.stroke();

      // Tilted wall passing through (endX, endY) at angle psiRad
      const wallDx = Math.cos(psiRad);
      const wallDy = -Math.sin(psiRad);
      ctx.strokeStyle = '#3B261E';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(endX - wallDx * 70, endY - wallDy * 70);
      ctx.lineTo(endX + wallDx * 140, endY + wallDy * 140);
      ctx.stroke();

      // Slope line
      ctx.strokeStyle = '#5B3828';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Block position
      const st = simRef.current.primary;
      const bx = ox + st.x * scale;
      const by = oy + st.y * scale;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(alphaRad);
      ctx.fillStyle = '#5B3828';
      ctx.fillRect(-12, -16, 24, 16);
      ctx.restore();

      if (st.v > 0.05) {
        drawArrow(ctx, bx, by - 8, bx + Math.cos(alphaRad) * (18 + st.v * 6), by - 8 + Math.sin(alphaRad) * (18 + st.v * 6), '#0284C7', 'v');
      }
      return;
    }

    // Standard / Compare / Incline-floor wedge layout
    const isFloorMode = config.mode === 'incline-floor';
    const basePx = isFloorMode ? 175 : 265;
    const rad = toRadians(config.angleDeg);
    const maxAllowedH = h - 92;
    const rawH = basePx * Math.tan(rad);
    const scaleFactor = rawH > maxAllowedH ? maxAllowedH / rawH : 1;
    const actualBasePx = basePx * scaleFactor;
    const actualHPx = actualBasePx * Math.tan(rad);
    const pxPerMeter = actualBasePx / config.baseLength;

    const xRight = xLeft + actualBasePx;
    const yTop = yGround - actualHPx;

    // Ground line
    ctx.strokeStyle = '#80563F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, yGround);
    ctx.lineTo(w - 30, yGround);
    ctx.stroke();

    // Comparison ghost wedge if active
    if (hasCompare && config.compareAngleDeg !== undefined) {
      const cRad = toRadians(config.compareAngleDeg);
      const cH = Math.min(h - 72, actualBasePx * Math.tan(cRad));
      const cTopY = yGround - cH;
      ctx.save();
      ctx.strokeStyle = '#C49A62';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(xLeft, cTopY);
      ctx.lineTo(xRight, yGround);
      ctx.stroke();
      ctx.restore();

      // Compare object
      const cSt = simRef.current.compare!;
      const cDistPx = cSt.s * pxPerMeter;
      const cSlopeLen = Math.hypot(actualBasePx, cH);
      const cUx = actualBasePx / cSlopeLen;
      const cUy = cH / cSlopeLen;
      const cx = xLeft + cDistPx * cUx;
      const cy = cTopY + cDistPx * cUy;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(cRad);
      ctx.fillStyle = '#C49A62';
      ctx.strokeStyle = '#80563F';
      ctx.lineWidth = 1.5;
      if (config.mode === 'sphere-roll-slip') {
        ctx.beginPath();
        ctx.arc(0, -11, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(-11, -15, 22, 15);
        ctx.strokeRect(-11, -15, 22, 15);
      }
      ctx.restore();

      ctx.fillStyle = '#80563F';
      ctx.font = '600 11px "DM Sans", sans-serif';
      ctx.fillText(`Pembanding (${config.compareAngleDeg.toFixed(1).replace('.', ',')}°): ${cSt.t.toFixed(2).replace('.', ',')} s`, xRight + 16, 44);
    }

    // Primary wedge fill
    ctx.fillStyle = 'rgba(233, 221, 209, 0.55)';
    ctx.strokeStyle = '#5B3828';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(xLeft, yGround);
    ctx.lineTo(xRight, yGround);
    ctx.lineTo(xLeft, yTop);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Base dimension
    ctx.fillStyle = '#3B261E';
    ctx.font = '600 12px "DM Sans", sans-serif';
    ctx.fillText(`ℓ = ${config.baseLength.toFixed(1).replace('.', ',')} m`, (xLeft + xRight) / 2 - 24, yGround + 20);
    ctx.fillText(`α = ${config.angleDeg.toFixed(1).replace('.', ',')}°`, xRight + 10, yGround - 8);

    // Primary object position
    const st = simRef.current.primary;
    let objX = 0;
    let objY = 0;
    let objRot = rad;

    if (isFloorMode && simRef.current.floorPhase) {
      objX = xRight + simRef.current.floorX * (pxPerMeter * 0.55);
      objY = yGround;
      objRot = 0;
    } else {
      objX = xLeft + st.s * Math.cos(rad) * pxPerMeter;
      objY = yTop + st.s * Math.sin(rad) * pxPerMeter;
    }

    ctx.save();
    ctx.translate(objX, objY);
    ctx.rotate(objRot);
    if (config.mode === 'sphere-roll-slip') {
      ctx.fillStyle = '#5B3828';
      ctx.beginPath();
      ctx.arc(0, -12, 12, 0, Math.PI * 2);
      ctx.fill();
      // Rotation spoke
      const spinAngle = st.s * 3.2;
      ctx.strokeStyle = '#FFFDF9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(10 * Math.cos(spinAngle), -12 + 10 * Math.sin(spinAngle));
      ctx.stroke();
    } else {
      ctx.fillStyle = '#5B3828';
      ctx.fillRect(-13, -17, 26, 17);
      ctx.strokeStyle = '#3B261E';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-13, -17, 26, 17);
    }
    ctx.restore();

    // Live velocity & force arrows on primary block
    const cmX = objX + Math.sin(objRot) * 9;
    const cmY = objY - Math.cos(objRot) * 9;
    drawArrow(ctx, cmX, cmY, cmX, cmY + 34, '#3B261E', 'W');
    if (st.v > 0.05) {
      const vLen = Math.min(60, 12 + st.v * 6);
      drawArrow(ctx, cmX, cmY, cmX + Math.cos(objRot) * vLen, cmY + Math.sin(objRot) * vLen, '#0284C7', 'v');
    }

    if (hasCompare) {
      ctx.fillStyle = '#3B261E';
      ctx.font = '600 11px "DM Sans", sans-serif';
      ctx.fillText(`Utama (${config.angleDeg.toFixed(1).replace('.', ',')}°): ${st.t.toFixed(2).replace('.', ',')} s`, xRight + 16, 26);
    }
  };

  useEffect(() => {
    drawFrame();
    if (!isPlaying) return;

    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const realDt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const simDt = realDt * speed;
      const { aPrimary, aCompare } = getEffectiveParams();
      const g = config.g || 9.8;

      if (config.mode === 'incline-floor') {
        if (!simRef.current.floorPhase) {
          const next = simulateInclineStep(
            simRef.current.primary,
            simDt,
            config.angleDeg,
            config.mu,
            config.baseLength,
            g,
            aPrimary
          );
          simRef.current.primary = next;
          if (next.finished) {
            simRef.current.floorPhase = true;
            simRef.current.primary.finished = false;
          }
        } else {
          // Decelerate on rough floor
          const aFloor = -config.mu * g;
          const st = simRef.current.primary;
          const nextV = st.v + aFloor * simDt;
          if (nextV <= 0) {
            const dtRem = st.v / (config.mu * g);
            simRef.current.floorX += st.v * dtRem + 0.5 * aFloor * dtRem * dtRem;
            simRef.current.primary = { ...st, v: 0, a: aFloor, t: st.t + dtRem, finished: true };
            setIsPlaying(false);
          } else {
            simRef.current.floorX += st.v * simDt + 0.5 * aFloor * simDt * simDt;
            simRef.current.primary = {
              ...st,
              v: nextV,
              a: aFloor,
              t: st.t + simDt,
              s: st.s + st.v * simDt + 0.5 * aFloor * simDt * simDt,
            };
          }
        }
      } else if (config.mode === 'tilted-wall') {
        const st = simRef.current.primary;
        if (!st.finished) {
          const psiRad = toRadians(config.psiDeg ?? 60);
          const alphaRad = toRadians(config.angleDeg);
          const sMax = config.baseLength / Math.sin(alphaRad + psiRad);
          const nextV = st.v + aPrimary * simDt;
          const nextS = st.s + st.v * simDt + 0.5 * aPrimary * simDt * simDt;
          if (nextS >= sMax) {
            const disc = st.v * st.v + 2 * aPrimary * (sMax - st.s);
            const dtExact = (-st.v + Math.sqrt(Math.max(0, disc))) / aPrimary;
            simRef.current.primary = {
              t: st.t + dtExact,
              s: sMax,
              v: st.v + aPrimary * dtExact,
              a: aPrimary,
              x: sMax * Math.cos(alphaRad),
              y: sMax * Math.sin(alphaRad),
              finished: true,
            };
            setIsPlaying(false);
          } else {
            simRef.current.primary = {
              t: st.t + simDt,
              s: nextS,
              v: nextV,
              a: aPrimary,
              x: nextS * Math.cos(alphaRad),
              y: nextS * Math.sin(alphaRad),
              finished: false,
            };
          }
        }
      } else {
        // Standard or compare mode
        if (!simRef.current.primary.finished) {
          simRef.current.primary = simulateInclineStep(
            simRef.current.primary,
            simDt,
            config.angleDeg,
            config.mu,
            config.baseLength,
            g,
            aPrimary
          );
        }
        if (simRef.current.compare && !simRef.current.compare.finished && config.compareAngleDeg !== undefined) {
          simRef.current.compare = simulateInclineStep(
            simRef.current.compare,
            simDt,
            config.compareAngleDeg,
            config.mu,
            config.baseLength,
            g,
            aCompare
          );
        }
        const primaryDone = simRef.current.primary.finished;
        const compareDone = !simRef.current.compare || simRef.current.compare.finished;
        if (primaryDone && compareDone) {
          setIsPlaying(false);
        }
      }

      const p = simRef.current.primary;
      setTelemetry({
        t: p.t,
        s: p.s,
        v: p.v,
        a: p.a,
        tCompare: simRef.current.compare ? simRef.current.compare.t : null,
        finished: p.finished && (!simRef.current.compare || simRef.current.compare.finished),
      });

      drawFrame();
      if (!simRef.current.primary.finished || (simRef.current.compare && !simRef.current.compare.finished)) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, speed, config]);

  const optAngle = computeOptimalAngle(config.mu);

  return (
    <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="font-display font-semibold text-sm sm:text-base text-[#3B261E]">{title}</h4>
          <p className="text-xs text-[#80563F]">
            Simulasi numerik konsisten dengan hukum Newton & kinematika (α_opt ≈ {optAngle.toFixed(1).replace('.', ',')}°)
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F4EEE7] p-1 rounded-lg border border-[#E9DDD1]">
          <span className="text-[11px] font-medium text-[#80563F] px-1.5">Kecepatan:</span>
          {SPEEDS.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setSpeed(sp)}
              className={`px-2 py-1 rounded text-xs font-mono-num transition-colors cursor-pointer ${
                speed === sp
                  ? 'bg-[#5B3828] text-[#FFFDF9]'
                  : 'text-[#3B261E] hover:bg-[#E9DDD1]/70'
              }`}
            >
              {sp}×
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[#E9DDD1] rounded-lg overflow-hidden bg-[#FFFDF9]">
        <canvas
          ref={canvasRef}
          width={560}
          height={compact ? 230 : 270}
          className="w-full h-auto block"
          data-testid="physics-proof-canvas"
        />
      </div>

      {/* Controls + Live Telemetry */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (telemetry.finished) resetSimulation();
              setIsPlaying((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#5B3828] text-[#FFFDF9] hover:bg-[#3B261E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                {telemetry.finished ? 'Putar Ulang' : 'Play'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetSimulation}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#F4EEE7] text-[#3B261E] border border-[#E9DDD1] hover:bg-[#E9DDD1] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#3B261E] font-mono-num tabular-nums">
          <span>
            t = <strong>{telemetry.t.toFixed(2).replace('.', ',')}</strong> s
          </span>
          <span>
            s = <strong>{telemetry.s.toFixed(2).replace('.', ',')}</strong> m
          </span>
          <span>
            v = <strong>{telemetry.v.toFixed(2).replace('.', ',')}</strong> m/s
          </span>
          <span>
            a = <strong>{telemetry.a.toFixed(2).replace('.', ',')}</strong> m/s²
          </span>
        </div>
      </div>
    </div>
  );
};
