import React from 'react';
import { ArrowRight, BookOpen, FlaskConical, Target } from 'lucide-react';
import { NavTab } from '../components/Navbar';
import { TIER_META } from '../data/problemsData';
import { SOAL_6_ANALYSIS } from '../data/theoryData';
import { MathFormula, MathText } from '../components/MathText';
import { PhysicsProofCanvas } from '../components/PhysicsProofCanvas';
import { NarratorBar } from '../components/NarratorBar';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  solvedCount: number;
}

const INTRO_NARRATION =
  'Selamat datang di Olympiad Physics Lab, program pelatihan Olimpiade Sains Fisika tingkat kota bersama pembina Mister Jo. Aplikasi ini dirancang khusus dari analisis mendalam Soal Nomor 6 OSK Fisika 2026 tentang optimasi waktu luncur pada bidang miring beralas tetap dengan gaya gesek. Mulailah dari Pusat Teori Lima Level sebelum menaklukkan kelima belas soal isian singkat numerik.';

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, solvedCount }) => {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#80563F] mb-3">
              <span>OLYMPIAD PHYSICS LAB</span>
              <span aria-hidden="true">·</span>
              <span>CITY LEVEL TRAINING</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#5B3828]">MENTOR: MISTER JO</span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#3B261E] tracking-tight leading-tight text-balance mb-4">
              Pengembangan Mendalam Soal Nomor 6 OSK Fisika SMA 2026
            </h1>

            <p className="text-base text-[#5B3828] leading-relaxed mb-6">
              Kuasai dinamika bidang miring kasar beralas tetap, hukum Newton, dan prinsip optimasi waktu tempuh tersingkat melalui <strong>15 soal isian singkat numerik</strong> bertahap, Pusat Teori 5 Level, Free Body Diagram akurat, serta animasi pembuktian fisika interaktif.
            </p>
          </div>

          <div className="space-y-5">
            <NarratorBar
              title="Pengantar Pembina: Mister Jo"
              actions={[
                { id: 'intro', label: 'Dengarkan Pengantar Aplikasi', script: INTRO_NARRATION },
              ]}
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('theory')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#5B3828] text-[#FFFDF9] hover:bg-[#3B261E] transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                Mulai Belajar dari Teori
              </button>
              <button
                type="button"
                onClick={() => onNavigate('problems')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#F4EEE7] text-[#3B261E] border border-[#E9DDD1] hover:bg-[#E9DDD1] transition-colors cursor-pointer whitespace-nowrap"
              >
                Buka Bank 15 Soal
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Proof Preview Card */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <PhysicsProofCanvas
            title="Simulasi Inti Soal Nomor 6 (53,6° vs 45,0°)"
            compact
            config={{
              mode: 'compare-optimal',
              baseLength: 2.1,
              angleDeg: 53.61,
              compareAngleDeg: 45,
              mu: 0.31,
              g: 9.8,
            }}
          />

          <div className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#80563F]">Rumus Kunci Soal Nomor 6</p>
              <div className="text-[#3B261E] mt-1">
                <MathFormula latex={SOAL_6_ANALYSIS.rumusUtama} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#80563F]">Progres Soal</p>
              <p className="font-display font-bold text-xl text-[#3B261E] tabular-nums">
                {solvedCount} / 15
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Analysis Strip of Soal 6 */}
      <section className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#3B261E]">
            Bedah Fisika Soal Nomor 6 OSK 2026
          </h2>
          <span className="text-xs font-medium text-[#80563F]">
            Sumber Acuan Utama · Halaman 2 Naskah OSK 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#5B3828]">Pokok Bahasan Utama</h3>
            <p className="text-sm text-[#3B261E] leading-relaxed">{SOAL_6_ANALYSIS.pokokBahasan}</p>
            <p className="text-xs text-[#80563F] pt-1">
              Kunci Soal Asli: <strong className="text-[#3B261E]">{SOAL_6_ANALYSIS.jawabanAsli}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#5B3828]">Submateri & Konsep Terlibat</h3>
            <ul className="space-y-1.5 text-sm text-[#3B261E]">
              {SOAL_6_ANALYSIS.submateri.map((item, idx) => (
                <li key={idx} className="leading-snug flex gap-1.5">
                  <span className="shrink-0">{idx + 1}.</span>
                  <MathText text={item} />
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#5B3828]">Prinsip & Hukum Fisika</h3>
            <ul className="space-y-1.5 text-sm text-[#3B261E]">
              {SOAL_6_ANALYSIS.prinsipHukum.map((item, idx) => (
                <li key={idx} className="leading-snug flex gap-1.5">
                  <span className="shrink-0">{idx + 1}.</span>
                  <MathText text={item} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5-Tier Roadmap */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#3B261E]">
              Peta Kurikulum 15 Soal Bertahap
            </h2>
            <p className="text-sm text-[#80563F]">
              Seluruh 15 soal menggunakan format isian singkat numerik tepat 1 angka desimal (pemisah koma).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('lab')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#F4EEE7] text-[#3B261E] border border-[#E9DDD1] hover:bg-[#E9DDD1] transition-colors cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
            Buka Laboratorium Animasi
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {([1, 2, 3, 4, 5] as const).map((tier) => {
            const meta = TIER_META[tier];
            return (
              <div
                key={tier}
                className="bg-[#FFFDF9] border border-[#E9DDD1] rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#80563F] mb-2">
                    <span>Level {tier}</span>
                    <span>{meta.range}</span>
                  </div>
                  <h3 className="font-display font-semibold text-base text-[#3B261E] mb-2">
                    {meta.name}
                  </h3>
                  <p className="text-xs text-[#5B3828] leading-relaxed">{meta.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('problems')}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B3828] hover:text-[#3B261E] cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" aria-hidden="true" />
                  Kerjakan {meta.range}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
