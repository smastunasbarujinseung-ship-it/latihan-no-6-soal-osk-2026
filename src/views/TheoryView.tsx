import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { THEORY_LEVELS } from '../data/theoryData';
import { MathFormula, MathText } from '../components/MathText';
import { NarratorBar } from '../components/NarratorBar';
import { PhysicsProofCanvas } from '../components/PhysicsProofCanvas';
import { NavTab } from '../components/Navbar';

interface TheoryViewProps {
  selectedLevel: 1 | 2 | 3 | 4 | 5;
  onSelectLevel: (level: 1 | 2 | 3 | 4 | 5) => void;
  onNavigate: (tab: NavTab) => void;
}

export const TheoryView: React.FC<TheoryViewProps> = ({
  selectedLevel,
  onSelectLevel,
  onNavigate,
}) => {
  const current = THEORY_LEVELS.find((l) => l.level === selectedLevel) ?? THEORY_LEVELS[0];
  const [showWorkedSteps, setShowWorkedSteps] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-[#80563F]">
            PUSAT TEORI DAN PENGUASAAN KONSEP · MENTOR: MISTER JO
          </span>
          <button
            type="button"
            onClick={() => onNavigate('problems')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B3828] hover:text-[#3B261E] cursor-pointer"
          >
            Lanjut ke Bank 15 Soal
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#3B261E] mb-4">
          Kurikulum Hierarkis Bidang Miring Kasar & Optimasi Soal Nomor 6
        </h1>

        {/* Level Selector Segmented Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#F4EEE7] rounded-xl border border-[#E9DDD1]">
          {THEORY_LEVELS.map((lvl) => {
            const active = lvl.level === selectedLevel;
            return (
              <button
                key={lvl.level}
                type="button"
                onClick={() => onSelectLevel(lvl.level)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#5B3828] text-[#FFFDF9]'
                    : 'text-[#3B261E] hover:bg-[#E9DDD1]/70'
                }`}
              >
                {lvl.badge}: {lvl.title.split(':')[0].replace(/^Level \d+\s*/, '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Narrator for Active Level */}
      <NarratorBar
        title={`Narator Teori ${current.badge} — Mister Jo`}
        actions={[
          {
            id: `theory-${current.level}`,
            label: 'Dengarkan Teori',
            script: current.narrationScript,
          },
        ]}
      />

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Textbook Prose + Formulas + Table */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 space-y-5">
            <div>
              <p className="text-xs font-semibold text-[#C49A62] mb-1">{current.badge}</p>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#3B261E]">
                {current.title}
              </h2>
              <p className="text-sm text-[#80563F] mt-1">{current.subtitle}</p>
            </div>

            <div className="text-sm sm:text-base text-[#3B261E] border-t border-[#E9DDD1] pt-4">
              <MathText text={current.overview} />
            </div>

            {current.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3 border-t border-[#E9DDD1] pt-4">
                <h3 className="font-display font-semibold text-base sm:text-lg text-[#5B3828]">
                  {sec.heading}
                </h3>
                <div className="text-sm sm:text-base text-[#3B261E]">
                  <MathText text={sec.body} />
                </div>
                {sec.highlightFormula && (
                  <div className="formula-highlight px-4 py-3 text-center text-[#3B261E]">
                    <MathFormula latex={sec.highlightFormula} displayMode />
                  </div>
                )}
                {sec.bulletPoints && (
                  <ul className="space-y-1.5 pl-4 text-sm text-[#5B3828] list-disc">
                    {sec.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx}>
                        <MathText text={bp} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* SI Variables Table */}
          <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6">
            <h3 className="font-display font-semibold text-base text-[#3B261E] mb-3">
              Besaran Fisika, Makna & Satuan SI
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E9DDD1] text-xs text-[#80563F]">
                    <th className="py-2 pr-3 font-semibold">Simbol</th>
                    <th className="py-2 pr-3 font-semibold">Besaran</th>
                    <th className="py-2 pr-3 font-semibold">Makna Fisis</th>
                    <th className="py-2 font-semibold">Satuan SI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDD1]">
                  {current.variables.map((v, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-3 font-semibold text-[#5B3828]">
                        <MathText text={v.symbol} />
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-[#3B261E]">{v.name}</td>
                      <td className="py-2.5 pr-3 text-[#5B3828]">{v.meaning}</td>
                      <td className="py-2.5 font-mono-num text-xs text-[#3B261E]">{v.siUnit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Interactive Simulation + Worked Example */}
        <div className="lg:col-span-5 space-y-6">
          <PhysicsProofCanvas
            title={current.visualPreset.label}
            config={{
              mode: current.visualPreset.showOptimalOverlay ? 'compare-optimal' : 'standard',
              baseLength: current.visualPreset.baseLength,
              angleDeg: current.visualPreset.angleDeg,
              compareAngleDeg: current.visualPreset.showOptimalOverlay ? 45 : undefined,
              mu: current.visualPreset.mu,
              g: 9.8,
            }}
          />

          <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-semibold text-base text-[#3B261E]">
                {current.workedExample.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowWorkedSteps((prev) => !prev)}
                className="text-xs font-semibold text-[#5B3828] hover:text-[#3B261E] cursor-pointer"
              >
                {showWorkedSteps ? 'Sembunyikan Langkah' : 'Lihat Langkah'}
              </button>
            </div>

            <div className="text-sm text-[#3B261E] bg-[#F4EEE7] rounded-xl p-4 border border-[#E9DDD1]">
              <MathText text={current.workedExample.problem} />
            </div>

            {showWorkedSteps && (
              <div className="space-y-2.5">
                {current.workedExample.steps.map((st, idx) => (
                  <div key={idx} className="text-sm text-[#3B261E] flex gap-2">
                    <span className="font-mono-num font-semibold text-[#80563F] shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <MathText text={st} />
                    </div>
                  </div>
                ))}
                <div className="formula-highlight px-4 py-2.5 text-sm font-semibold text-[#3B261E]">
                  Hasil: {current.workedExample.answer}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
