// src/components/Library.tsx
import React, { useMemo, useState } from 'react';
import type { Affirmation, GratitudeLog, PracticeType, Soundscape } from '../types';
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

  const cardBg = theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/50 border-white/10 text-slate-100';

  return (
    <div className="p-6 max-w-md mx-auto pb-24">
      <h2 className="text-xl font-bold mb-4">Library</h2>

      {!!soundscapes.length && (
        <div className={`${cardBg} rounded-2xl border p-4 mb-4`}>
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
                      className="px-3 py-2 rounded-xl border border-white/10 text-xs font-bold"
                      onClick={() => {
                        setPreviewingId(id);
                        audioManager.previewSoundscape(s);
                      }}
                    >
                      {previewing ? 'Previewing' : 'Preview'}
                    </button>
                    {onSetActiveSoundscape && (
                      <button
                        className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-900 text-xs font-bold"
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

      <div className={`${cardBg} rounded-2xl border p-4 mb-4`}>
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

      <div className={`${cardBg} rounded-2xl border p-4 mb-4`}>
        <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Affirmations</div>
        {affirmations.length === 0 ? (
          <div className="text-sm opacity-70">No affirmations yet.</div>
        ) : (
          <div className="space-y-2">
            {affirmations.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 p-3">
                <div className="text-sm">{a.text}</div>
                <button
                  className="text-xs font-bold text-red-400"
                  onClick={() => onRemove(a.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${cardBg} rounded-2xl border p-4`}>
        <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Gratitude Logs</div>
        {gratitudeLogs.length === 0 ? (
          <div className="text-sm opacity-70">No gratitude logs yet.</div>
        ) : (
          <div className="space-y-2">
            {gratitudeLogs.slice().reverse().map((g) => (
              <div key={g.id} className="rounded-xl border border-white/10 p-3">
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