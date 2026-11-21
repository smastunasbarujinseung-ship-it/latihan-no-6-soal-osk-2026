import React, { useMemo, useState } from 'react';
import {
  computeDescentTime,
  computeInclineAcceleration,
  computeMinDescentTime,
  computeOptimalAngle,
  computeSphereDescentTime,
  computeSphereOptimalAngle,
  computeSphereSlipThresholdAngle,
} from '../physics/inclineEngine';
import { PhysicsProofCanvas } from '../components/PhysicsProofCanvas';
import { MathFormula } from '../components/MathText';
import { NarratorBar } from '../components/NarratorBar';

export const LabView: React.FC = () => {
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const [mu, setMu] = useState<number>(0.31);
  const [baseLength, setBaseLength] = useState<number>(2.1);
  const [objectType, setObjectType] = useState<'block' | 'sphere'>('block');
  const [compareOptimal, setCompareOptimal] = useState<boolean>(true);
  const g = 9.8;

  const optData = useMemo(() => {
    if (objectType === 'sphere') {
      const spOpt = computeSphereOptimalAngle(baseLength, mu, g);
      const tOpt = computeSphereDescentTime(baseLength, spOpt.optimalAngleDeg, mu, g).time;
      const tCurr = computeSphereDescentTime(baseLength, angleDeg, mu, g);
      const slipDeg = computeSphereSlipThresholdAngle(mu);
      return {
        optAngle: spOpt.optimalAngleDeg,
        tOpt,
        tCurrent: tCurr.time,
        regime: spOpt.regime,
        currentSlipping: tCurr.isSlipping,
        slipDeg,
      };
    }
    const optAngle = computeOptimalAngle(mu);
    const tOpt = computeMinDescentTime(baseLength, mu, g);
    const tCurrent = computeDescentTime(baseLength, angleDeg, mu, g);
    return {
      optAngle,
      tOpt,
      tCurrent,
      regime: 'sliding' as const,
      currentSlipping: true,
      slipDeg: (Math.atan(mu) * 180) / Math.PI,
    };
  }, [angleDeg, mu, baseLength, objectType]);

  const currentAccel = useMemo(() => {
    if (objectType === 'sphere') {
      const check = computeSphereDescentTime(baseLength, angleDeg, mu, g);
      if (!check.isSlipping) {
        return (5 / 7) * g * Math.sin((angleDeg * Math.PI) / 180);
      }
    }
    return computeInclineAcceleration(angleDeg, mu, g);
  }, [angleDeg, mu, baseLength, objectType]);

  // Build SVG plot of t(alpha) vs alpha
  const curvePoints = useMemo(() => {
    const pts: Array<{ a: number; t: number }> = [];
    for (let a = 10; a <= 84; a += 1) {
      const t =
        objectType === 'sphere'
          ? computeSphereDescentTime(baseLength, a, mu, g).time
          : computeDescentTime(baseLength, a, mu, g);
      if (Number.isFinite(t) && t > 0 && t < 5.5) {
        pts.push({ a, t });
      }
    }
    return pts;
  }, [baseLength, mu, objectType]);

  const w = 480;
  const h = 230;
  const padL = 46;
  const padR = 20;
  const padT = 20;
  const padB = 38;
  const maxT = 4.0;
  const minT = 0.5;
  const toX = (a: number) => padL + ((a - 10) / (85 - 10)) * (w - padL - padR);
  const toY = (t: number) => padT + ((maxT - Math.min(maxT, Math.max(minT, t))) / (maxT - minT)) * (h - padT - padB);

  const pathD = curvePoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toX(p.a).toFixed(1)} ${toY(p.t).toFixed(1)}`)
    .join(' ');

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#80563F]">
              LABORATORIUM ANIMASI INTERAKTIF · MENTOR: MISTER JO
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#3B261E] mt-0.5">
              Eksperimen Sudut Tercepat & Dinamika Bidang Miring Alas Tetap
            </h1>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F4EEE7] rounded-xl border border-[#E9DDD1]">
            <button
              type="button"
              onClick={() => setObjectType('block')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                objectType === 'block' ? 'bg-[#5B3828] text-[#FFFDF9]' : 'text-[#3B261E] hover:bg-[#E9DDD1]'
              }`}
            >
              Balok Partikel
            </button>
            <button
              type="button"
              onClick={() => setObjectType('sphere')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                objectType === 'sphere' ? 'bg-[#5B3828] text-[#FFFDF9]' : 'text-[#3B261E] hover:bg-[#E9DDD1]'
              }`}
            >
              Bola Pejal (2/5 mR²)
            </button>
          </div>
        </div>

        <NarratorBar
          title="Panduan Eksperimen Laboratorium"
          actions={[
            {
              id: 'lab-guide',
              label: 'Dengarkan Penjelasan Lab',
              script:
                'Di Laboratorium Animasi ini kamu dapat menggeser sudut kemiringan alfa, koefisien gesek miu, dan panjang alas el. Amati balapan langsung antara lintasan pilihanmu dengan lintasan sudut optimal, serta perhatikan bagaimana titik lembah pada kurva waktu bergeser saat miu diubah.',
            },
          ]}
        />
      </div>

      {/* Main Sandbox Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Simulation Canvas + Live Curve */}
        <div className="lg:col-span-7 space-y-6">
          <PhysicsProofCanvas
            title={`Simulasi Balapan: α = ${angleDeg.toFixed(1).replace('.', ',')}°${
              compareOptimal ? ` vs α optimal = ${optData.optAngle.toFixed(1).replace('.', ',')}°` : ''
            }`}
            config={{
              mode: objectType === 'sphere' ? 'sphere-roll-slip' : compareOptimal ? 'compare-optimal' : 'standard',
              baseLength,
              angleDeg,
              compareAngleDeg: compareOptimal ? optData.optAngle : undefined,
              mu,
              g,
            }}
          />

          {/* Live t(alpha) Curve */}
          <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display font-semibold text-base text-[#3B261E]">
                Grafik Waktu Tempuh t(α) terhadap Sudut Kemiringan α
              </h3>
              <span className="text-xs font-mono-num text-[#80563F]">
                α optimal = {optData.optAngle.toFixed(1).replace('.', ',')}° (t min = {optData.tOpt.toFixed(2).replace('.', ',')} s)
              </span>
            </div>

            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto select-none">
              {[1, 2, 3].map((tv) => (
                <g key={tv}>
                  <line x1={padL} y1={toY(tv)} x2={w - padR} y2={toY(tv)} stroke="#E9DDD1" strokeWidth={1} />
                  <text x={padL - 8} y={toY(tv) + 4} textAnchor="end" fontSize={10.5} fill="#80563F">
                    {tv},0
                  </text>
                </g>
              ))}
              {[15, 30, 45, 60, 75].map((av) => (
                <g key={av}>
                  <line x1={toX(av)} y1={padT} x2={toX(av)} y2={h - padB} stroke="#E9DDD1" strokeWidth={1} />
                  <text x={toX(av)} y={h - padB + 15} textAnchor="middle" fontSize={10.5} fill="#80563F">
                    {av}°
                  </text>
                </g>
              ))}

              <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="#5B3828" strokeWidth={1.6} />
              <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#5B3828" strokeWidth={1.6} />
              <text x={padL - 8} y={padT - 5} fontSize={11} fontWeight={600} fill="#3B261E">
                t (s)
              </text>
              <text x={w - padR} y={h - 6} textAnchor="end" fontSize={11} fontWeight={600} fill="#3B261E">
                Sudut α (°)
              </text>

              {pathD && <path d={pathD} fill="none" stroke="#5B3828" strokeWidth={2.5} />}

              {/* Optimal Point Marker */}
              <circle
                cx={toX(optData.optAngle)}
                cy={toY(optData.tOpt)}
                r={5.5}
                fill="#C49A62"
                stroke="#3B261E"
                strokeWidth={1.5}
              />

              {/* Current Angle Marker */}
              {Number.isFinite(optData.tCurrent) && optData.tCurrent < 5.5 && (
                <circle
                  cx={toX(angleDeg)}
                  cy={toY(optData.tCurrent)}
                  r={5.5}
                  fill="#0284C7"
                  stroke="#FFFDF9"
                  strokeWidth={1.5}
                />
              )}
            </svg>
            <div className="flex flex-wrap items-center gap-5 text-xs text-[#5B3828]">
              <span>● Titik biru: sudut pilihanmu ({angleDeg.toFixed(1).replace('.', ',')}°)</span>
              <span>● Titik emas: sudut optimal ({optData.optAngle.toFixed(1).replace('.', ',')}°)</span>
            </div>
          </div>
        </div>

        {/* Right: Parameter Controls & Physics Readout */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-lg text-[#3B261E]">
              Kontrol Parameter Eksperimen
            </h2>

            {/* Slider: Angle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="slider-angle" className="font-semibold text-[#3B261E]">
                  Sudut Kemiringan (α)
                </label>
                <span className="font-mono-num font-bold text-[#5B3828]">
                  {angleDeg.toFixed(1).replace('.', ',')}°
                </span>
              </div>
              <input
                id="slider-angle"
                type="range"
                min={15}
                max={82}
                step={0.5}
                value={angleDeg}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
                className="w-full accent-[#5B3828] cursor-pointer"
              />
            </div>

            {/* Slider: mu */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="slider-mu" className="font-semibold text-[#3B261E]">
                  Koefisien Gesek Kinetik (μ)
                </label>
                <span className="font-mono-num font-bold text-[#5B3828]">
                  {mu.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <input
                id="slider-mu"
                type="range"
                min={0}
                max={0.8}
                step={0.01}
                value={mu}
                onChange={(e) => setMu(Number(e.target.value))}
                className="w-full accent-[#5B3828] cursor-pointer"
              />
            </div>

            {/* Slider: baseLength */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="slider-base" className="font-semibold text-[#3B261E]">
                  Panjang Alas Tetap (ℓ)
                </label>
                <span className="font-mono-num font-bold text-[#5B3828]">
                  {baseLength.toFixed(1).replace('.', ',')} m
                </span>
              </div>
              <input
                id="slider-base"
                type="range"
                min={1.0}
                max={5.0}
                step={0.1}
                value={baseLength}
                onChange={(e) => setBaseLength(Number(e.target.value))}
                className="w-full accent-[#5B3828] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E9DDD1]">
              <label htmlFor="toggle-compare" className="text-sm font-medium text-[#3B261E] cursor-pointer">
                Tampilkan lintasan pembanding (sudut optimal)
              </label>
              <input
                id="toggle-compare"
                type="checkbox"
                checked={compareOptimal}
                onChange={(e) => setCompareOptimal(e.target.checked)}
                className="w-4 h-4 accent-[#5B3828] cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAngleDeg(53.6);
                  setMu(0.31);
                  setBaseLength(2.1);
                  setObjectType('block');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F4EEE7] text-[#3B261E] border border-[#E9DDD1] hover:bg-[#E9DDD1] cursor-pointer"
              >
                Preset Soal 6 OSK (α=53,6°, μ=0,31)
              </button>
              <button
                type="button"
                onClick={() => setAngleDeg(Number(optData.optAngle.toFixed(1)))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5B3828] text-[#FFFDF9] hover:bg-[#3B261E] cursor-pointer"
              >
                Atur ke Sudut Optimal
              </button>
            </div>
          </div>

          {/* Live Analytical Calculations */}
          <div className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-2xl p-6 space-y-3">
            <h3 className="font-display font-semibold text-base text-[#3B261E]">
              Hasil Analisis Fisis Real-Time
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm tabular-nums">
              <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-xl p-3">
                <p className="text-xs text-[#80563F]">Percepatan (a)</p>
                <p className="font-mono-num font-bold text-lg text-[#3B261E]">
                  {currentAccel > 0 ? `${currentAccel.toFixed(2).replace('.', ',')} m/s²` : 'Diam (0 m/s²)'}
                </p>
              </div>
              <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-xl p-3">
                <p className="text-xs text-[#80563F]">Waktu Luncur t(α)</p>
                <p className="font-mono-num font-bold text-lg text-[#3B261E]">
                  {Number.isFinite(optData.tCurrent)
                    ? `${optData.tCurrent.toFixed(2).replace('.', ',')} s`
                    : 'Tidak meluncur'}
                </p>
              </div>
              <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-xl p-3">
                <p className="text-xs text-[#80563F]">Sudut Optimal</p>
                <p className="font-mono-num font-bold text-lg text-[#5B3828]">
                  {optData.optAngle.toFixed(1).replace('.', ',')}°
                </p>
              </div>
              <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-xl p-3">
                <p className="text-xs text-[#80563F]">Waktu Minimum</p>
                <p className="font-mono-num font-bold text-lg text-[#5B3828]">
                  {optData.tOpt.toFixed(2).replace('.', ',')} s
                </p>
              </div>
            </div>

            {objectType === 'sphere' && (
              <p className="text-xs text-[#5B3828] pt-1">
                Status Bola Pejal: <strong>{optData.currentSlipping ? 'Menggelinding + Selip' : 'Menggelinding Murni'}</strong>{' '}
                (batas selip α = {optData.slipDeg.toFixed(1).replace('.', ',')}°, rezim tercepat: <strong>{optData.regime === 'slipping' ? 'Selip' : 'Menggelinding Murni'}</strong>).
              </p>
            )}

            <div className="pt-2 text-xs text-[#3B261E]">
              <MathFormula latex={`\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(${mu.toFixed(2)}) = ${optData.optAngle.toFixed(1)}^\\circ`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
