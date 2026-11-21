import React from 'react';
import { PhysicsProblem } from '../data/problemsData';
import { MathFormula, MathText } from './MathText';
import { FbdDiagram } from './FbdDiagram';
import { PhysicsProofCanvas } from './PhysicsProofCanvas';

interface FullSolutionCardProps {
  problem: PhysicsProblem;
}

export const FullSolutionCard: React.FC<FullSolutionCardProps> = ({ problem }) => {
  const { solution, fbd, simConfig } = problem;

  return (
    <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9DDD1] pb-4">
        <div>
          <p className="text-xs font-semibold text-[#80563F]">
            PEMBAHASAN LENGKAP SOAL NOMOR {problem.number} · MENTOR: MISTER JO
          </p>
          <h3 className="font-display font-bold text-xl text-[#3B261E] mt-0.5">
            {problem.title}
          </h3>
        </div>
        <span className="text-xs font-semibold text-[#5B3828]">
          {problem.tierLabel}
        </span>
      </div>

      {/* 1. Memahami Permasalahan */}
      <section className="space-y-1.5">
        <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
          1. Memahami Permasalahan
        </h4>
        <div className="text-sm sm:text-base text-[#3B261E]">
          <MathText text={solution.memahamiPermasalahan} />
        </div>
      </section>

      {/* 2 & 3. Identifikasi Data & Besaran Ditanyakan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-4 space-y-2">
          <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
            2. Identifikasi Data
          </h4>
          <ul className="space-y-1 text-sm text-[#3B261E]">
            {solution.identifikasiData.map((d, idx) => (
              <li key={idx}>
                <MathText text={`• ${d}`} />
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-4 space-y-2">
          <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
            3. Besaran yang Ditanyakan
          </h4>
          <div className="text-sm text-[#3B261E]">
            <MathText text={solution.besaranDitanyakan} />
          </div>
        </section>
      </div>

      {/* 4. Analisis Fisika */}
      <section className="space-y-1.5">
        <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
          4. Analisis Fisika
        </h4>
        <div className="text-sm sm:text-base text-[#3B261E]">
          <MathText text={solution.analisisFisika} />
        </div>
      </section>

      {/* 5. Free Body Diagram (FBD) */}
      <section className="space-y-3">
        <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
          5. Free Body Diagram (FBD)
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-6">
            <FbdDiagram
              inclineAngleDeg={fbd.inclineAngleDeg}
              forces={fbd.forces}
              relevant={fbd.relevant}
              note={fbd.note}
            />
          </div>
          <div className="lg:col-span-6 text-sm sm:text-base text-[#3B261E] bg-[#F4EEE7]/70 border border-[#E9DDD1] rounded-xl p-4">
            <MathText text={solution.fbdPenjelasan} />
          </div>
        </div>
      </section>

      {/* 6. Persamaan Dasar */}
      <section className="space-y-2">
        <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
          6. Persamaan Dasar (Hukum & Rumus Kunci)
        </h4>
        <div className="formula-highlight px-4 py-3 text-center text-[#3B261E]">
          <MathFormula latex={solution.persamaanDasar} displayMode />
        </div>
      </section>

      {/* 7 & 8. Substitusi Angka & Perhitungan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="space-y-2">
          <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
            7. Substitusi Angka & Satuan
          </h4>
          <div className="formula-highlight px-4 py-3 text-[#3B261E]">
            <MathFormula latex={solution.substitusiAngka} displayMode />
          </div>
        </section>

        <section className="space-y-2">
          <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
            8. Perhitungan Aljabar Lengkap
          </h4>
          <div className="formula-highlight px-4 py-3 text-[#3B261E]">
            <MathText text={solution.perhitungan} />
          </div>
        </section>
      </div>

      {/* 9. Hasil Akhir */}
      <section className="bg-[#5B3828] text-[#FFFDF9] rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E9DDD1]">
            9. Hasil Akhir (Tepat 1 Angka Desimal)
          </h4>
          <p className="font-display font-bold text-2xl sm:text-3xl mt-1 font-mono-num">
            {solution.hasilAkhir}
          </p>
        </div>
        <div className="text-xs text-[#E9DDD1]">
          Presisi internal dipertahankan sepanjang aljabar, dibulatkan di langkah akhir.
        </div>
      </section>

      {/* 10. Interpretasi Fisika */}
      <section className="space-y-1.5">
        <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
          10. Interpretasi Fisika
        </h4>
        <div className="text-sm sm:text-base text-[#3B261E]">
          <MathText text={solution.interpretasiFisika} />
        </div>
      </section>

      {/* 11. Strategi Cepat Olimpiade */}
      <section className="bg-[#F4EEE7] border border-[#C49A62] rounded-xl p-4 sm:p-5 space-y-1.5">
        <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-[#5B3828]">
          11. Strategi Cepat Olimpiade
        </h4>
        <div className="text-sm sm:text-base text-[#3B261E]">
          <MathText text={solution.strategiCepatOlimpiade} />
        </div>
      </section>

      {/* Mandatory Interactive Physics Proof Animation */}
      <section className="space-y-2 pt-2">
        <PhysicsProofCanvas
          config={simConfig}
          title={`Animasi Pembuktian Fisika — Soal ${problem.number}`}
        />
      </section>
    </div>
  );
};
