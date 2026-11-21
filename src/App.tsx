import { useEffect, useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { TheoryView } from './views/TheoryView';
import { ProblemsView, ProblemAttempt } from './views/ProblemsView';
import { LabView } from './views/LabView';
import { SolutionsView } from './views/SolutionsView';
import { ResultsView } from './views/ResultsView';
import { narrator } from './utils/narrator';

const STORAGE_KEY = 'olympiad_physics_lab_soal6_attempts_v1';

function loadInitialAttempts(): Record<number, ProblemAttempt> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Record<number, ProblemAttempt>;
    }
  } catch {
    // Ignore storage errors
  }
  return {};
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'problems';
      }
    }
    return 'home';
  });

  const [selectedProblemId, setSelectedProblemId] = useState<number>(1);
  const [selectedTheoryLevel, setSelectedTheoryLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [attempts, setAttempts] = useState<Record<number, ProblemAttempt>>(loadInitialAttempts);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch {
      // Ignore storage quota errors
    }
  }, [attempts]);

  const handleNavigate = (tab: NavTab) => {
    narrator.stop();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecordAttempt = (problemId: number, attempt: ProblemAttempt) => {
    setAttempts((prev) => ({
      ...prev,
      [problemId]: attempt,
    }));
  };

  const handleResetProgress = () => {
    setAttempts({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const solvedCount = Object.values(attempts).filter((a) => a.status === 'correct').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#3B261E]">
      <Navbar activeTab={activeTab} onNavigate={handleNavigate} />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomeView onNavigate={handleNavigate} solvedCount={solvedCount} />
        )}
        {activeTab === 'theory' && (
          <TheoryView
            selectedLevel={selectedTheoryLevel}
            onSelectLevel={setSelectedTheoryLevel}
            onNavigate={handleNavigate}
          />
        )}
        {activeTab === 'problems' && (
          <ProblemsView
            attempts={attempts}
            selectedProblemId={selectedProblemId}
            onSelectProblem={setSelectedProblemId}
            onRecordAttempt={handleRecordAttempt}
          />
        )}
        {activeTab === 'lab' && <LabView />}
        {activeTab === 'solutions' && (
          <SolutionsView
            selectedProblemId={selectedProblemId}
            onSelectProblem={setSelectedProblemId}
          />
        )}
        {activeTab === 'results' && (
          <ResultsView
            attempts={attempts}
            onResetProgress={handleResetProgress}
            onJumpToProblem={(id) => {
              setSelectedProblemId(id);
              handleNavigate('problems');
            }}
            onJumpToTheory={(level) => {
              setSelectedTheoryLevel(level);
              handleNavigate('theory');
            }}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <footer className="border-t border-[#E9DDD1] bg-[#F4EEE7] py-5 px-4 sm:px-6 text-xs text-[#5B3828]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-[#3B261E]">
            OLYMPIAD PHYSICS LAB · CITY LEVEL TRAINING · MENTOR: MISTER JO
          </span>
          <span>
            Pengembangan Soal Nomor 6 OSK Fisika SMA 2026 (15 Soal Isian Singkat Numerik)
          </span>
        </div>
      </footer>
    </div>
  );
}
