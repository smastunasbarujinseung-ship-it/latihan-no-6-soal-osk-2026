import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type NavTab = 'home' | 'theory' | 'problems' | 'lab' | 'solutions' | 'results';

interface NavbarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string }> = [
  { id: 'home', label: 'Beranda' },
  { id: 'theory', label: 'Pusat Teori' },
  { id: 'problems', label: 'Bank 15 Soal' },
  { id: 'lab', label: 'Lab Animasi' },
  { id: 'solutions', label: 'Pembahasan' },
  { id: 'results', label: 'Hasil Belajar' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (tab: NavTab) => {
    onNavigate(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#5B3828] text-[#FFFDF9] border-b border-[#3B261E]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="font-display font-bold text-lg tracking-tight text-[#FFFDF9] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C49A62] rounded"
        >
          Olympiad Physics Lab
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Navigasi Utama">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'text-[#FFFDF9] border-[#C49A62]'
                    : 'text-[#E9DDD1] border-transparent hover:text-[#FFFDF9] hover:border-[#C49A62]/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('problems')}
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-[#C49A62] text-[#3B261E] hover:bg-[#d4ae79] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Mulai Latihan
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-[#FFFDF9] hover:bg-[#3B261E] transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <nav
          className="lg:hidden bg-[#3B261E] border-t border-[#80563F]/40 px-4 py-3 space-y-1"
          aria-label="Navigasi Seluler"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#5B3828] text-[#FFFDF9]'
                    : 'text-[#E9DDD1] hover:bg-[#5B3828]/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};
