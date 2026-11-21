import React, { useState } from 'react';
import { PROBLEMS } from '../data/problemsData';
import { FullSolutionCard } from '../components/FullSolutionCard';
import { NarratorBar } from '../components/NarratorBar';

interface SolutionsViewProps {
  selectedProblemId: number;
  onSelectProblem: (id: number) => void;
}

export const SolutionsView: React.FC<SolutionsViewProps> = ({
  selectedProblemId,
  onSelectProblem,
}) => {
  const [searchId, setSearchId] = useState<number>(selectedProblemId);
  const activeProblem = PROBLEMS.find((p) => p.id === searchId) ?? PROBLEMS[0];

  const handleSelect = (id: number) => {
    setSearchId(id);
    onSelectProblem(id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-[#80563F]">
            DIREKTORI PEMBAHASAN LENGKAP 15 SOAL · MENTOR: MISTER JO
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#3B261E] mt-0.5">
            Pembahasan Sistematis, Free Body Diagram & Strategi Cepat
          </h1>
          <p className="text-sm text-[#5B3828] mt-1">
            Pilih nomor soal di bawah ini untuk menelaah 11 langkah penyelesaian lengkap, diagram gaya, animasi pembuktian, dan narasi suara.
          </p>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-2">
          {PROBLEMS.map((p) => {
            const active = p.id === activeProblem.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p.id)}
                className={`h-10 rounded-lg border text-xs font-semibold transition-colors cursor-pointer tabular-nums ${
                  active
                    ? 'bg-[#5B3828] text-[#FFFDF9] border-[#3B261E]'
                    : 'bg-[#F4EEE7] text-[#3B261E] border-[#E9DDD1] hover:bg-[#E9DDD1]'
                }`}
              >
                {p.number}
              </button>
            );
          })}
        </div>
      </div>

      <NarratorBar
        title={`Narator Pembahasan Soal ${activeProblem.number} — Mister Jo`}
        actions={[
          { id: 'sol-soal', label: 'Dengarkan Soal', script: activeProblem.narration.soal },
          { id: 'sol-fbd', label: 'Dengarkan FBD', script: activeProblem.narration.fbd },
          { id: 'sol-full', label: 'Dengarkan Pembahasan', script: activeProblem.narration.pembahasan },
        ]}
      />

      <FullSolutionCard problem={activeProblem} />
    </div>
  );
};
