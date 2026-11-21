import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { PROBLEMS, TIER_META } from '../data/problemsData';
import { checkNumericalAnswer, formatIndonesianDecimal } from '../physics/inclineEngine';
import { MathText } from '../components/MathText';
import { StimulusDiagram } from '../components/StimulusDiagram';
import { NarratorBar } from '../components/NarratorBar';
import { FullSolutionCard } from '../components/FullSolutionCard';
import { playFeedbackTone } from '../utils/narrator';

export interface ProblemAttempt {
  status: 'unattempted' | 'correct' | 'wrong';
  lastInput: string;
  attemptsCount: number;
  hintsRevealed: number;
}

interface ProblemsViewProps {
  attempts: Record<number, ProblemAttempt>;
  selectedProblemId: number;
  onSelectProblem: (id: number) => void;
  onRecordAttempt: (problemId: number, attempt: ProblemAttempt) => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({
  attempts,
  selectedProblemId,
  onSelectProblem,
  onRecordAttempt,
}) => {
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');
  const [inputMap, setInputMap] = useState<Record<number, string>>({});
  const [solutionOpenMap, setSolutionOpenMap] = useState<Record<number, boolean>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'correct' | 'wrong';
    text: string;
  } | null>(null);

  const problem = PROBLEMS.find((p) => p.id === selectedProblemId) ?? PROBLEMS[0];
  const currentAttempt = attempts[problem.id] ?? {
    status: 'unattempted',
    lastInput: '',
    attemptsCount: 0,
    hintsRevealed: 0,
  };
  const currentInput = inputMap[problem.id] ?? currentAttempt.lastInput ?? '';
  const isSolutionOpen = Boolean(solutionOpenMap[problem.id]);

  const filteredProblems =
    tierFilter === 'all' ? PROBLEMS : PROBLEMS.filter((p) => p.tier === tierFilter);

  const handleSelectProblem = (id: number) => {
    onSelectProblem(id);
    setValidationError(null);
    setFeedbackMessage(null);
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const check = checkNumericalAnswer(currentInput, problem.exactAnswer);
    if (!check.valid) {
      setValidationError(
        'Masukkan angka yang valid dengan pemisah koma atau titik (contoh: 53,6 atau -3,4).'
      );
      return;
    }

    if (check.isCorrect) {
      playFeedbackTone('correct');
      onRecordAttempt(problem.id, {
        status: 'correct',
        lastInput: currentInput,
        attemptsCount: currentAttempt.attemptsCount + 1,
        hintsRevealed: currentAttempt.hintsRevealed,
      });
      setFeedbackMessage({
        type: 'correct',
        text: `Tepat sekali! Jawaban ${formatIndonesianDecimal(problem.exactAnswer)} ${problem.unit} benar. Kamu dapat membuka pembahasan lengkap untuk melihat pembuktian animasi dan strategi cepat olimpiade.`,
      });
    } else {
      playFeedbackTone('hint');
      const nextHints = Math.min(3, currentAttempt.hintsRevealed + 1);
      onRecordAttempt(problem.id, {
        status: 'wrong',
        lastInput: currentInput,
        attemptsCount: currentAttempt.attemptsCount + 1,
        hintsRevealed: nextHints,
      });
      setFeedbackMessage({
        type: 'wrong',
        text: `Jawaban ${formatIndonesianDecimal(check.roundedUser ?? 0)} ${problem.unit} belum tepat. Gunakan Petunjuk ${nextHints} di bawah ini untuk mengoreksi langkahmu, lalu coba lagi.`,
      });
    }
  };

  const toggleSolution = () => {
    setSolutionOpenMap((prev) => ({ ...prev, [problem.id]: !prev[problem.id] }));
  };

  const solvedCount = Object.values(attempts).filter((a) => a.status === 'correct').length;

  return (
    <div className="space-y-6">
      {/* Top Progress Bar & Problem Selector */}
      <div className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#80563F]">
              BANK 15 SOAL LATIHAN OSK FISIKA · MENTOR: MISTER JO
            </p>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#3B261E] mt-0.5">
              Latihan Isian Singkat Numerik Berbasis Soal Nomor 6
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#80563F]">Progres Penguasaan</span>
            <p className="font-display font-bold text-lg text-[#3B261E] tabular-nums">
              {solvedCount} / 15 Selesai Benar
            </p>
          </div>
        </div>

        {/* Tier Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F4EEE7] p-1 rounded-xl border border-[#E9DDD1]">
          <button
            type="button"
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              tierFilter === 'all' ? 'bg-[#5B3828] text-[#FFFDF9]' : 'text-[#3B261E] hover:bg-[#E9DDD1]'
            }`}
          >
            Semua (15)
          </button>
          {([1, 2, 3, 4, 5] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                tierFilter === t ? 'bg-[#5B3828] text-[#FFFDF9]' : 'text-[#3B261E] hover:bg-[#E9DDD1]'
              }`}
            >
              {TIER_META[t].range}
            </button>
          ))}
        </div>

        {/* 1-15 Problem Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-2">
          {filteredProblems.map((p) => {
            const st = attempts[p.id]?.status ?? 'unattempted';
            const isSelected = p.id === problem.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProblem(p.id)}
                aria-label={`Soal ${p.number}: ${
                  st === 'correct' ? 'Benar' : st === 'wrong' ? 'Salah' : 'Belum dikerjakan'
                }`}
                className={`h-11 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer tabular-nums ${
                  isSelected
                    ? 'bg-[#5B3828] text-[#FFFDF9] border-[#3B261E]'
                    : st === 'correct'
                    ? 'bg-[#F4EEE7] text-[#3B261E] border-[#C49A62]'
                    : st === 'wrong'
                    ? 'bg-[#FFFDF9] text-[#9A3412] border-[#9A3412]/50'
                    : 'bg-[#FFFDF9] text-[#5B3828] border-[#E9DDD1] hover:bg-[#F4EEE7]'
                }`}
              >
                <span>{p.number}</span>
                {st === 'correct' ? (
                  <CheckCircle2 className="w-3 h-3 text-[#15803D]" aria-hidden="true" />
                ) : st === 'wrong' ? (
                  <XCircle className="w-3 h-3 text-[#B91C1C]" aria-hidden="true" />
                ) : (
                  <Circle className="w-2.5 h-2.5 opacity-40" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Problem Workspace */}
      <article className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-5 sm:p-8 space-y-6">
        {/* Problem Meta Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E9DDD1] pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#80563F] mb-1">
              <span>SOAL NOMOR {problem.number} DARI 15</span>
              <span aria-hidden="true">·</span>
              <span>{problem.tierLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{problem.contextTag}</span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#3B261E]">
              {problem.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            {currentAttempt.status === 'correct' && (
              <span className="inline-flex items-center gap-1 text-[#15803D]">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Sudah Benar
              </span>
            )}
            {currentAttempt.status === 'wrong' && (
              <span className="inline-flex items-center gap-1 text-[#B91C1C]">
                <XCircle className="w-4 h-4" aria-hidden="true" />
                Perlu Perbaikan ({currentAttempt.attemptsCount}x coba)
              </span>
            )}
            {currentAttempt.status === 'unattempted' && (
              <span className="text-[#80563F]">Belum Dikerjakan</span>
            )}
          </div>
        </div>

        {/* Narrator Controls */}
        <NarratorBar
          title={`Narator Soal ${problem.number} — Mister Jo`}
          actions={[
            { id: 'soal', label: 'Dengarkan Soal', script: problem.narration.soal },
            { id: 'stimulus', label: 'Dengarkan Stimulus', script: problem.narration.stimulus },
            { id: 'fbd', label: 'Dengarkan FBD', script: problem.narration.fbd },
            { id: 'pembahasan', label: 'Dengarkan Pembahasan', script: problem.narration.pembahasan },
          ]}
        />

        {/* Stimulus + Question Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Stimulus Visual */}
          <div className="lg:col-span-5 bg-[#F4EEE7]/50 border border-[#E9DDD1] rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-[#5B3828]">Stimulus Visual</p>
            <StimulusDiagram problem={problem} />
            <p className="text-xs text-[#80563F] leading-relaxed">{problem.stimulus.caption}</p>
          </div>

          {/* Question Text + Known Data + Input */}
          <div className="lg:col-span-7 space-y-5">
            <div className="text-base text-[#3B261E] leading-relaxed">
              <MathText text={problem.questionText} />
            </div>

            {/* Known Data & Asked */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#5B3828] mb-2">Data yang Diketahui</p>
                <ul className="space-y-1 text-xs sm:text-sm text-[#3B261E]">
                  {problem.knownData.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2">
                      <span className="text-[#5B3828]">
                        <MathText text={`${item.symbol} (${item.label})`} />
                      </span>
                      <span className="font-mono-num font-semibold whitespace-nowrap">
                        {item.value} {item.unit !== '-' ? item.unit : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#5B3828] mb-2">Besaran yang Ditanyakan</p>
                  <div className="text-sm font-medium text-[#3B261E]">
                    <MathText text={`${problem.askedQuantity.symbol}: ${problem.askedQuantity.label}`} />
                  </div>
                </div>
                <p className="text-xs text-[#80563F] mt-3">
                  Satuan jawaban: <strong className="text-[#3B261E]">{problem.askedQuantity.unit}</strong>
                </p>
              </div>
            </div>

            {/* Numerical Short Answer Form */}
            <form
              onSubmit={handleCheckAnswer}
              className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-4 sm:p-5 space-y-3"
            >
              <label
                htmlFor={`answer-input-${problem.id}`}
                className="block text-sm font-semibold text-[#3B261E]"
              >
                Jawaban Numerik (tepat 1 angka desimal, gunakan koma atau titik, contoh: 12,5):
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-[#FFFDF9] border border-[#80563F]/50 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#5B3828]">
                  <input
                    id={`answer-input-${problem.id}`}
                    type="text"
                    inputMode="decimal"
                    value={currentInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputMap((prev) => ({ ...prev, [problem.id]: val }));
                      setValidationError(null);
                    }}
                    placeholder="Contoh: 53,6"
                    className="w-40 sm:w-48 px-3.5 py-2.5 text-base font-mono-num text-[#3B261E] bg-transparent focus:outline-none"
                  />
                  <span className="px-3 py-2.5 bg-[#E9DDD1]/60 text-xs font-semibold text-[#5B3828] border-l border-[#E9DDD1]">
                    {problem.unit === '-' ? 'tanpa satuan' : problem.unit}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#5B3828] text-[#FFFDF9] hover:bg-[#3B261E] transition-colors cursor-pointer whitespace-nowrap"
                >
                  PERIKSA JAWABAN
                </button>
              </div>

              {validationError && (
                <p className="text-xs font-medium text-[#B91C1C]" role="alert">
                  {validationError}
                </p>
              )}

              {feedbackMessage && (
                <div
                  role="status"
                  className={`p-3.5 rounded-lg border text-sm flex items-start gap-2.5 ${
                    feedbackMessage.type === 'correct'
                      ? 'bg-[#FFFDF9] border-[#15803D]/40 text-[#166534]'
                      : 'bg-[#FFFDF9] border-[#B91C1C]/40 text-[#991B1B]'
                  }`}
                >
                  {feedbackMessage.type === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{feedbackMessage.text}</span>
                </div>
              )}
            </form>

            {/* 3-Tier Progressive Conceptual Hints (Never shows key directly!) */}
            {currentAttempt.hintsRevealed > 0 && (
              <div className="bg-[#FFFDF9] border border-[#C49A62] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#5B3828]">
                  <Lightbulb className="w-4 h-4 text-[#C49A62]" aria-hidden="true" />
                  <span>Petunjuk Bertahap ({currentAttempt.hintsRevealed} / 3)</span>
                </div>
                <div className="space-y-2.5">
                  {problem.hints.slice(0, currentAttempt.hintsRevealed).map((hint, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-[#3B261E] bg-[#F4EEE7] rounded-lg p-3 border border-[#E9DDD1]"
                    >
                      <span className="font-semibold text-[#5B3828] block text-xs mb-1">
                        {idx === 0
                          ? 'Petunjuk 1 — Mengingatkan Konsep'
                          : idx === 1
                          ? 'Petunjuk 2 — Mengarahkan Prinsip'
                          : 'Petunjuk 3 — Mengarahkan Persamaan'}
                      </span>
                      <MathText text={hint} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer: Expand/Collapse Solution + Next/Prev Problem */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E9DDD1]">
          <button
            type="button"
            onClick={toggleSolution}
            aria-expanded={isSolutionOpen}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#3B261E] text-[#FFFDF9] hover:bg-[#5B3828] transition-colors cursor-pointer"
          >
            {isSolutionOpen ? (
              <>
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
                TUTUP PEMBAHASAN
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                BUKA PEMBAHASAN LENGKAP
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={problem.number === 1}
              onClick={() => handleSelectProblem(Math.max(1, problem.number - 1))}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F4EEE7] text-[#3B261E] border border-[#E9DDD1] hover:bg-[#E9DDD1] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Soal Sebelumnya
            </button>
            <button
              type="button"
              disabled={problem.number === 15}
              onClick={() => handleSelectProblem(Math.min(15, problem.number + 1))}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F4EEE7] text-[#3B261E] border border-[#E9DDD1] hover:bg-[#E9DDD1] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Soal Berikutnya
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>

      {/* Expandable Full Solution */}
      {isSolutionOpen && <FullSolutionCard problem={problem} />}
    </div>
  );
};
