import React, { useEffect, useMemo, useState } from 'react';
import { HandHeart, ChevronRight } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import { PRAYER_PATHS } from './prayerContent';
import type { PrayerPathId } from './prayerContent';
import type { PrayerProfile, Soundscape } from '../types';

interface PrayerSetupProps {
  onBack: () => void;
  onContinue: (pathId: PrayerPathId, profile: PrayerProfile) => void;
  initialProfile: PrayerProfile;
  availableSoundscapes: Soundscape[];
  selectedSoundscapeId: string;
  prayerVolume: number;
  onChangeSoundscape: (id: string) => void;
  onChangePrayerVolume: (volume: number) => void;
  theme: 'light' | 'dark';
}

export const PrayerSetup: React.FC<PrayerSetupProps> = ({
  onBack,
  onContinue,
  initialProfile,
  availableSoundscapes,
  selectedSoundscapeId,
  prayerVolume,
  onChangeSoundscape,
  onChangePrayerVolume,
  theme,
}) => {
  const [selectedPathId, setSelectedPathId] = useState<PrayerPathId | ''>(() => {
    try {
      const value = localStorage.getItem('abundance_prayer_path') || '';
      return (PRAYER_PATHS.find((item) => item.id === value)?.id ?? '') as PrayerPathId | '';
    } catch {
      return '';
    }
  });
  const [profile, setProfile] = useState<PrayerProfile>(initialProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const selectedPath = useMemo(
    () => PRAYER_PATHS.find((item) => item.id === selectedPathId) || null,
    [selectedPathId]
  );
  const prayerTracks = useMemo(
    () =>
      (availableSoundscapes || []).filter((s) => {
        const cat = String(s.category || '').toUpperCase();
        return !['MORNING_IAM', 'EVENING_ILOVE'].includes(cat);
      }),
    [availableSoundscapes]
  );

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const titlePill =
    'inline-flex items-center rounded-full border border-amber-300/45 bg-gradient-to-r from-slate-950/78 to-slate-900/72 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] backdrop-blur-sm';
  const infoPill =
    'w-full rounded-2xl border border-amber-300/30 bg-gradient-to-r from-slate-950/72 to-slate-900/68 px-4 py-3 text-xs text-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.28)] backdrop-blur-sm';
  const cardBg =
    theme === 'light'
      ? 'bg-gradient-to-br from-white/95 to-amber-50/70 border-slate-200'
      : 'bg-gradient-to-br from-slate-900/75 to-slate-950/75 border-slate-700';

  const intentOptions: Array<{ value: PrayerProfile['intent']; label: string }> = [
    { value: 'guidance', label: 'Guidance' },
    { value: 'gratitude', label: 'Gratitude' },
    { value: 'healing', label: 'Healing' },
    { value: 'protection', label: 'Protection' },
    { value: 'provision', label: 'Provision' },
    { value: 'forgiveness', label: 'Forgiveness' },
  ];
  const toneOptions: Array<{ value: PrayerProfile['tone']; label: string }> = [
    { value: 'gentle', label: 'Gentle' },
    { value: 'contemplative', label: 'Contemplative' },
    { value: 'joyful', label: 'Joyful' },
    { value: 'bold', label: 'Bold' },
  ];
  const languageOptions: Array<{ value: PrayerProfile['language']; label: string }> = [
    { value: 'english', label: 'English' },
    { value: 'swahili', label: 'Swahili' },
    { value: 'bilingual', label: 'Bilingual (EN + SW)' },
  ];
  const styleOptions: Array<{ value: PrayerProfile['style']; label: string }> = [
    { value: 'short', label: 'Short' },
    { value: 'standard', label: 'Standard' },
    { value: 'extended', label: 'Extended' },
  ];

  const handleSavePath = () => {
    if (!selectedPathId) return;
    try {
      localStorage.setItem('abundance_prayer_path', selectedPathId);
      localStorage.setItem('abundance_prayer_profile', JSON.stringify(profile));
    } catch {
      // ignore storage errors
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    onContinue(selectedPathId, profile);
  };

  return (
    <div className={`h-full flex flex-col p-4 max-w-md mx-auto pb-8 overflow-y-auto custom-scrollbar ${textColor}`}>
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => {
            buttonSoundService.play('back');
            onBack();
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-[11px] text-slate-100 hover:bg-black/80 transition-colors"
        >
          <span className="mr-1">←</span>
          <span className="font-semibold tracking-wide uppercase">Back</span>
        </button>
        <span className={titlePill}>Omba / Pray</span>
      </div>

      <div className={`rounded-2xl border p-5 shadow-lg mb-4 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-2">
          <HandHeart size={18} className="text-amber-400" />
          <h2 className="text-lg font-bold">Prayer Setup</h2>
        </div>
        <p className={`text-sm ${subTextColor}`}>
          Select your prayer path and profile. Your preferences will be saved and reused for your next prayer session.
        </p>
      </div>

      <div className="grid gap-2 mb-4">
        {PRAYER_PATHS.map((path) => {
          const active = path.id === selectedPathId;
          return (
            <button
              key={path.id}
              onClick={() => {
                buttonSoundService.play('click');
                setSelectedPathId(path.id);
              }}
              className={`w-full text-left rounded-xl border p-3 transition-all ${
                active
                  ? 'bg-amber-500/20 border-amber-400/70'
                  : theme === 'light'
                  ? 'bg-white/80 border-slate-300 hover:border-amber-300'
                  : 'bg-slate-900/50 border-slate-700 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold">{path.label}</div>
                  <div className="text-xs text-amber-400 uppercase tracking-wide">{path.swahili}</div>
                </div>
                {active ? <ChevronRight size={16} className="text-amber-400" /> : null}
              </div>
              <div className={`text-xs mt-1 ${subTextColor}`}>{path.description}</div>
            </button>
          );
        })}
      </div>

      <div className={`rounded-2xl border p-4 mb-4 ${cardBg}`}>
        <div className="text-xs uppercase tracking-wide opacity-80 mb-3">Prayer Profile</div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={`text-xs block mb-1 ${subTextColor}`}>Intent</label>
            <select
              value={profile.intent}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, intent: e.target.value as PrayerProfile['intent'] }))
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                theme === 'light'
                  ? 'border-slate-300 bg-white text-slate-900'
                  : 'border-slate-700 bg-slate-900 text-slate-100'
              }`}
            >
              {intentOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`text-xs block mb-1 ${subTextColor}`}>Tone</label>
            <select
              value={profile.tone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, tone: e.target.value as PrayerProfile['tone'] }))
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                theme === 'light'
                  ? 'border-slate-300 bg-white text-slate-900'
                  : 'border-slate-700 bg-slate-900 text-slate-100'
              }`}
            >
              {toneOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`text-xs block mb-1 ${subTextColor}`}>Language</label>
            <select
              value={profile.language}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, language: e.target.value as PrayerProfile['language'] }))
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                theme === 'light'
                  ? 'border-slate-300 bg-white text-slate-900'
                  : 'border-slate-700 bg-slate-900 text-slate-100'
              }`}
            >
              {languageOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`text-xs block mb-1 ${subTextColor}`}>Style</label>
            <select
              value={profile.style}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, style: e.target.value as PrayerProfile['style'] }))
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                theme === 'light'
                  ? 'border-slate-300 bg-white text-slate-900'
                  : 'border-slate-700 bg-slate-900 text-slate-100'
              }`}
            >
              {styleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 mb-4 ${cardBg}`}>
        <div className="text-xs uppercase tracking-wide opacity-80 mb-3">Prayer Ambience</div>
        <div className="space-y-3">
          <div>
            <label className={`text-xs block mb-1 ${subTextColor}`}>Prayer Sound</label>
            <select
              value={selectedSoundscapeId}
              onChange={(e) => {
                buttonSoundService.play('click');
                onChangeSoundscape(e.target.value);
              }}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                theme === 'light'
                  ? 'border-slate-300 bg-white text-slate-900'
                  : 'border-slate-700 bg-slate-900 text-slate-100'
              }`}
            >
              {prayerTracks.length === 0 ? (
                <option value="">Default Prayer Ambience</option>
              ) : (
                prayerTracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.label}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs ${subTextColor}`}>Prayer Volume</label>
              <span className="text-xs text-amber-400 font-bold">{prayerVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={prayerVolume}
              onChange={(e) => onChangePrayerVolume(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSavePath}
        disabled={!selectedPath}
        className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save & Continue
      </button>

      <div
        className={`${infoPill} mt-3 text-center ${
          saved ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : ''
        }`}
      >
        {saved
          ? `Saved: ${selectedPath?.label || 'Prayer Path'} | ${profile.intent} | ${profile.tone}`
          : 'Your path and profile will be used in the prayer guide and session.'}
      </div>
    </div>
  );
};
