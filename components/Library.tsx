import React, { useState } from 'react';
import { Soundscape } from '../types';
import { Play, Check, Music } from 'lucide-react';
import { audioManager } from '../services/audioService';
import { buttonSoundService } from '../services/buttonSoundService';

interface LibraryProps {
  theme: 'light' | 'dark';
  soundscapes: Soundscape[];
  activeSoundscapeId: string;
  onSetActiveSoundscape: (id: string) => void;
}

export const Library: React.FC<LibraryProps> = ({
  theme,
  soundscapes,
  activeSoundscapeId,
  onSetActiveSoundscape,
}) => {
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-400';
  const cardBg = theme === 'light'
    ? 'bg-white border-slate-200'
    : 'bg-slate-900/70 border-slate-700';

  const handlePreview = (s: Soundscape) => {
    buttonSoundService.play('click');
    setPreviewingId(s.id);
    audioManager.previewSoundscape(s);
  };

  const getSourceLabel = (s: Soundscape) => {
    const isCloud = !isNaN(Number(s.id)) || s.url?.includes('user_');
    return isCloud ? 'Cloud' : 'System';
  };

  return (
    <div className={`h-full flex flex-col p-4 max-w-md mx-auto pb-24 ${textColor}`}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-serif font-bold">Maktaba</h1>
        <p className={`text-xs ${subTextColor}`}>
          Maktaba means "Library". Choose the sound that supports your practice.
        </p>
      </div>

      {/* Audio List */}
      <div className={`flex-1 rounded-2xl border shadow-lg ${cardBg} overflow-hidden`}>
        <div className="max-h-full overflow-y-auto custom-scrollbar divide-y divide-slate-700/30">
          {soundscapes.map((s) => {
            const isActive = s.id === activeSoundscapeId;

            return (
              <div key={s.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music size={18} className="text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold leading-tight">
                        {s.label}
                      </p>
                      <p className={`text-[10px] uppercase tracking-wide ${subTextColor}`}>
                        {s.category} · {getSourceLabel(s)}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handlePreview(s)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-slate-600/40 hover:bg-slate-700/30 transition"
                  >
                    <Play size={12} />
                    Preview
                  </button>

                  <button
                    onClick={() => {
                      buttonSoundService.play('confirm');
                      onSetActiveSoundscape(s.id);
                    }}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <Check size={12} />
                    Use this audio now
                  </button>
                </div>
              </div>
            );
          })}

          {soundscapes.length === 0 && (
            <div className="p-6 text-center">
              <p className={`text-sm ${subTextColor}`}>
                No soundscapes available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};