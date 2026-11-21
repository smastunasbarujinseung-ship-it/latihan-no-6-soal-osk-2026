import React, { useEffect, useState } from 'react';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { narrator, NarratorStatus } from '../utils/narrator';

export interface AudioActionItem {
  id: string;
  label: string;
  script: string;
}

interface NarratorBarProps {
  actions: AudioActionItem[];
  title?: string;
}

export const NarratorBar: React.FC<NarratorBarProps> = ({
  actions,
  title = 'Narator Suara Olimpiade (Mister Jo)',
}) => {
  const [status, setStatus] = useState<NarratorStatus>(narrator.getStatus().status);
  const [activeLabel, setActiveLabel] = useState<string | null>(narrator.getStatus().activeLabel);

  useEffect(() => {
    return narrator.subscribe((nextStatus, nextLabel) => {
      setStatus(nextStatus);
      setActiveLabel(nextLabel);
    });
  }, []);

  const isUnsupported = status === 'unsupported';

  return (
    <div className="bg-[#F4EEE7] border border-[#E9DDD1] rounded-xl p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[#3B261E]">
          <Volume2 className="w-4 h-4 text-[#5B3828] shrink-0" aria-hidden="true" />
          <span>{title}</span>
        </div>
        <div className="text-xs text-[#80563F] font-medium">
          {isUnsupported
            ? 'Mode teks aktif (SpeechSynthesis tidak tersedia di peramban ini)'
            : status === 'speaking'
            ? `Sedang membacakan: ${activeLabel}`
            : status === 'paused'
            ? `Dijeda: ${activeLabel}`
            : 'Siap membacakan materi dan rumus dengan pelafalan fisika'}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const isCurrent = activeLabel === action.label && (status === 'speaking' || status === 'paused');
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => narrator.speak(action.script, action.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                isCurrent
                  ? 'bg-[#5B3828] text-[#FFFDF9] border-[#5B3828]'
                  : 'bg-[#FFFDF9] text-[#3B261E] border-[#E9DDD1] hover:bg-[#E9DDD1]/60'
              }`}
            >
              {action.label}
            </button>
          );
        })}

        <div className="flex items-center gap-1.5 ml-auto">
          {status === 'speaking' && (
            <button
              type="button"
              onClick={() => narrator.pause()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FFFDF9] text-[#3B261E] border border-[#E9DDD1] hover:bg-[#E9DDD1]/60 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              Jeda Suara
            </button>
          )}
          {status === 'paused' && (
            <button
              type="button"
              onClick={() => narrator.resume()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5B3828] text-[#FFFDF9] border border-[#5B3828] hover:bg-[#3B261E] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              Lanjutkan Suara
            </button>
          )}
          {(status === 'speaking' || status === 'paused') && (
            <button
              type="button"
              onClick={() => narrator.stop()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#3B261E] text-[#FFFDF9] border border-[#3B261E] hover:bg-[#5B3828] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" aria-hidden="true" />
              Hentikan Suara
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
