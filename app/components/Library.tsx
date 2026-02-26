// src/components/Library.tsx
import React, { useMemo, useState } from 'react';
import { PracticeType } from '../types';
import type { Affirmation, GratitudeLog, Soundscape } from '../types';
import { audioManager } from '../services/audioManager';

interface LibraryProps {
  // accept both prop names (older App.tsx vs newer Library.tsx)
  affirmations?: Affirmation[];
  customAffirmations?: Affirmation[];

  gratitudeLogs?: GratitudeLog[];

  onAdd: (text: string, type: PracticeType) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;

  onAudioUpload: React.Dispatch<React.SetStateAction<File | null>> | ((file: File) => void);
  userAudioFile: File | null;

  theme: 'light' | 'dark';

  // optional props used in some variants
  soundscapes?: Soundscape[];
  activeSoundscapeId?: string;
  onSetActiveSoundscape?: (id: string) => void;
}

export const Library: React.FC<LibraryProps> = (props) => {
  const {
    theme,
    gratitudeLogs = [],
    onAdd,
    onRemove,
    onAudioUpload,
    userAudioFile,
    soundscapes = [],
    onSetActiveSoundscape
  } = props;

  const affirmations = useMemo(
    () => props.affirmations ?? props.customAffirmations ?? [],
    [props.affirmations, props.customAffirmations]
  );

  const [previewingId, setPreviewingId] = useState<string>('');
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [newAffirmationType, setNewAffirmationType] = useState<PracticeType>(PracticeType.MORNING_IAM);
  const [isSavingAffirmation, setIsSavingAffirmation] = useState(false);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const cardBg =
    theme === 'light'
      ? 'bg-gradient-to-br from-white/95 to-amber-50/70 border-slate-200 text-slate-900'
      : 'bg-gradient-to-br from-slate-900/75 to-slate-950/75 border-slate-700 text-slate-100';
  const itemBorder = theme === 'light' ? 'border-slate-200' : 'border-white/10';

  const handleAddAffirmation = async () => {
    const text = newAffirmationText.trim();
    if (!text || isSavingAffirmation) return;

    setIsSavingAffirmation(true);
    try {
      await onAdd(text, newAffirmationType);
      setNewAffirmationText('');
    } finally {
      setIsSavingAffirmation(false);
    }
  };

  return (
    <div className={`p-4 max-w-md mx-auto pb-24 overflow-y-auto custom-scrollbar ${textColor}`}>
      <div className="mb-4">
        <span className={`text-[10px] tracking-[0.22em] uppercase ${subTextColor} opacity-90`}>
          Sacred Archive
        </span>
        <h2 className="text-xl font-bold mt-1">Maktaba (Library)</h2>
      </div>

      {!!soundscapes.length && (
        <div className={`${cardBg} rounded-2xl border p-4 mb-4 shadow-lg`}>
          <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Soundscapes</div>
          <div className="space-y-2">
            {soundscapes.map((s) => {
              const id = String(s.id);
              const previewing = previewingId === id;
              return (
                <div key={id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{s.label}</div>
                    <div className="text-xs opacity-70 truncate">{s.category || ''}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                        theme === 'light'
                          ? 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                          : 'border-white/10 bg-slate-900/50 hover:bg-slate-800/50'
                      }`}
                      onClick={() => {
                        setPreviewingId(id);
                        audioManager.previewSoundscape(s);
                      }}
                    >
                      {previewing ? 'Previewing' : 'Preview'}
                    </button>
                    {onSetActiveSoundscape && (
                      <button
                        className="px-3 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400"
                        onClick={() => onSetActiveSoundscape(id)}
                      >
                        Set
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`${cardBg} rounded-2xl border p-4 mb-4 shadow-lg`}>
        <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Your Audio</div>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (typeof onAudioUpload === 'function') {
              // either setter or callback
              // @ts-ignore
              onAudioUpload((prev: any) => f);
              // if it’s callback style, call directly too
              try {
                // @ts-ignore
                onAudioUpload(f);
              } catch {}
            }
          }}
        />
        {userAudioFile && <div className="text-xs mt-2 opacity-80 truncate">{userAudioFile.name}</div>
        }
      </div>

      <div className={`${cardBg} rounded-2xl border p-4 mb-4 shadow-lg`}>
        <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Affirmations</div>
        <div className="space-y-2 mb-3">
          <textarea
            value={newAffirmationText}
            onChange={(e) => setNewAffirmationText(e.target.value)}
            placeholder="Add your personal affirmation..."
            rows={2}
            className={`w-full rounded-xl border p-2 text-sm ${
              theme === 'light'
                ? 'border-slate-300 bg-slate-50 text-slate-900'
                : 'border-slate-700 bg-slate-800 text-slate-100'
            }`}
          />
          <div className="flex items-center gap-2">
            <select
              value={newAffirmationType}
              onChange={(e) => setNewAffirmationType(e.target.value as PracticeType)}
              className={`rounded-lg border px-2 py-2 text-xs ${
                theme === 'light'
                  ? 'border-slate-300 bg-white text-slate-900'
                  : 'border-slate-700 bg-slate-900 text-slate-100'
              }`}
            >
              <option value={PracticeType.MORNING_IAM}>I Am</option>
              <option value={PracticeType.EVENING_ILOVE}>I Love</option>
            </select>
            <button
              className="px-3 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 disabled:opacity-50"
              onClick={handleAddAffirmation}
              disabled={isSavingAffirmation || !newAffirmationText.trim()}
            >
              {isSavingAffirmation ? 'Saving...' : 'Add'}
            </button>
          </div>
        </div>
        {affirmations.length === 0 ? (
          <div className="text-sm opacity-70">No affirmations yet.</div>
        ) : (
          <div className="space-y-2">
            {affirmations.map((a) => (
              <div key={a.id} className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${itemBorder}`}>
                <div className="text-sm">{a.text}</div>
                <button
                  className="text-xs font-bold text-red-400 hover:text-red-300"
                  onClick={() => onRemove(a.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${cardBg} rounded-2xl border p-4 shadow-lg`}>
        <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Gratitude Logs</div>
        {gratitudeLogs.length === 0 ? (
          <div className="text-sm opacity-70">No gratitude logs yet.</div>
        ) : (
          <div className="space-y-2">
            {gratitudeLogs.slice().reverse().map((g) => (
              <div key={g.id} className={`rounded-xl border p-3 ${itemBorder}`}>
                <div className="text-xs opacity-70">{new Date(g.date).toLocaleDateString()} • {g.focusArea}</div>
                <div className="text-sm italic mt-1">“{g.text}”</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
