import React from 'react';
import { BookOpen, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { PROBLEMS, TIER_META } from '../data/problemsData';
import { THEORY_LEVELS } from '../data/theoryData';
import { ProblemAttempt } from './ProblemsView';
import { NavTab } from '../components/Navbar';

interface ResultsViewProps {
  attempts: Record<number, ProblemAttempt>;
  onResetProgress: () => void;
  onJumpToProblem: (id: number) => void;
  onJumpToTheory: (level: 1 | 2 | 3 | 4 | 5) => void;
  onNavigate: (tab: NavTab) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  attempts,
  onResetProgress,
  onJumpToProblem,
  onJumpToTheory,
}) => {
  const total = PROBLEMS.length;
  const attemptedList = PROBLEMS.filter((p) => (attempts[p.id]?.status ?? 'unattempted') !== 'unattempted');
  const correctList = PROBLEMS.filter((p) => attempts[p.id]?.status === 'correct');
  const wrongList = PROBLEMS.filter((p) => attempts[p.id]?.status === 'wrong');

  const attemptedCount = attemptedList.length;
  const correctCount = correctList.length;
  const wrongCount = wrongList.length;
  const masteryPct = Math.round((correctCount / total) * 100);

  // Recommend theory levels based on missed or unattempted problems
  const recommendedLevelIds = Array.from(
    new Set(
      PROBLEMS.filter((p) => attempts[p.id]?.status !== 'correct').map((p) => p.theoryLevelRef)
    )
  ).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#80563F]">
            LAPORAN HASIL BELAJAR · MENTOR: MISTER JO
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#3B261E] mt-0.5">
            Rekapitulasi Penguasaan 15 Soal Olimpiade Kota
          </h1>
        </div>

        <button
          type="button"
          onClick={onResetProgress}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#F4EEE7] text-[#3B261E] border border-[#E9DDD1] hover:bg-[#E9DDD1] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Reset Progres Latihan
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-5">
          <p className="text-xs font-semibold text-[#80563F]">Soal Dikerjakan</p>
          <p className="font-display font-bold text-3xl text-[#3B261E] mt-1">
            {attemptedCount} <span className="text-base font-medium text-[#80563F]">/ {total}</span>
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-5">
          <p className="text-xs font-semibold text-[#15803D]">Jawaban Benar</p>
          <p className="font-display font-bold text-3xl text-[#15803D] mt-1">{correctCount}</p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-5">
          <p className="text-xs font-semibold text-[#B91C1C]">Jawaban Salah</p>
          <p className="font-display font-bold text-3xl text-[#B91C1C] mt-1">{wrongCount}</p>
        </div>

        <div className="bg-[#5B3828] text-[#FFFDF9] rounded-2xl p-5">
          <p className="text-xs font-semibold text-[#E9DDD1]">Persentase Penguasaan</p>
          <p className="font-display font-bold text-3xl mt-1">{masteryPct}%</p>
        </div>
      </div>

      {/* Tier Breakdown & Theory Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-[#3B261E]">
            Rincian Penguasaan per Tingkat Kesulitan
          </h2>
          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as const).map((tier) => {
              const tierProblems = PROBLEMS.filter((p) => p.tier === tier);
              const tierCorrect = tierProblems.filter(
                (p) => attempts[p.id]?.status === 'correct'
              ).length;
              return (
                <div
                  key={tier}
                  className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#3B261E]">
                      {TIER_META[tier].range} — {TIER_META[tier].name}
                    </span>
                    <span className="font-mono-num font-bold text-[#5B3828]">
                      {tierCorrect} / {tierProblems.length} Benar
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tierProblems.map((p) => {
                      const st = attempts[p.id]?.status ?? 'unattempted';
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => onJumpToProblem(p.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                            st === 'correct'
                              ? 'bg-[#FFFDF9] border-[#15803D]/50 text-[#15803D]'
                              : st === 'wrong'
                              ? 'bg-[#FFFDF9] border-[#B91C1C]/50 text-[#B91C1C]'
                              : 'bg-[#FFFDF9] border-[#E9DDD1] text-[#5B3828]'
                          }`}
                        >
                          {st === 'correct' && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                          {st === 'wrong' && <XCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                          <span>Soal {p.number}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-[#3B261E]">
            Materi yang Perlu Dipelajari Kembali
          </h2>
          {recommendedLevelIds.length === 0 ? (
            <div className="bg-[#F4EEE7] border border-[#C49A62] rounded-xl p-4 text-sm text-[#3B261E]">
              Luar biasa! Seluruh 15 soal telah kamu selesaikan dengan benar. Kamu sudah menguasai topik optimasi bidang miring Soal Nomor 6 secara tuntas.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#5B3828]">
                Berdasarkan soal yang belum terjawab benar, Mister Jo menyarankan untuk meninjau kembali modul teori berikut:
              </p>
              {recommendedLevelIds.map((lvlId) => {
                const lvl = THEORY_LEVELS.find((l) => l.level === lvlId);
                if (!lvl) return null;
                return (
                  <div
                    key={lvl.level}
                    className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-4 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#80563F]">{lvl.badge}</p>
                      <p className="font-semibold text-sm text-[#3B261E]">{lvl.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onJumpToTheory(lvl.level)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5B3828] text-[#FFFDF9] hover:bg-[#3B261E] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      Buka
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
