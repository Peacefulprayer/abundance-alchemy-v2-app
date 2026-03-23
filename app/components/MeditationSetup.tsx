import React, { useState, useEffect } from 'react';
import { Clock, Music, Loader, PlayCircle } from 'lucide-react';
import { PracticeType, Soundscape, PracticeSessionConfig } from '../types';
import { apiService } from '../services/apiService';
import { audioManager } from '../services/audioManager';
import { buttonSoundService } from '../services/buttonSoundService';
import {
  INNER_PAGE_SHELL,
  INNER_PRIMARY_BUTTON,
  INNER_TITLE_PILL,
  innerBackButton,
  innerHeroCard,
  innerSectionFrame,
  innerSectionKicker,
  innerSecondaryButton,
  innerSurfaceCard,
} from '../styles/sacredInnerScreen';

interface MeditationSetupProps {
  onBack: () => void;
  onBegin: (config: PracticeSessionConfig) => void;
  theme: 'light' | 'dark';
  availableSoundscapes: Soundscape[];
  initialDuration?: number;
}

const DURATIONS = [1, 5, 15, 30, 60];

export const MeditationSetup: React.FC<MeditationSetupProps> = ({
  onBack,
  onBegin,
  theme,
  availableSoundscapes,
  initialDuration = 15,
}) => {
  const [duration, setDuration] = useState(initialDuration);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [selectedSound, setSelectedSound] = useState<Soundscape | null>(null);
  const [meditationTracks, setMeditationTracks] = useState<Soundscape[]>([]);
  const [loading, setLoading] = useState(true);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const pageShell = INNER_PAGE_SHELL;
  const sectionFrame = innerSectionFrame(theme);
  const heroCard = innerHeroCard(theme);
  const surfaceCard = innerSurfaceCard(theme);
  const sectionKicker = innerSectionKicker(theme);
  const backButton = innerBackButton(theme);
  const secondaryButton = innerSecondaryButton(theme);
  const meditationGlassCard =
    'rounded-[22px] border border-white/12 bg-slate-950/78 p-4 text-white shadow-[0_22px_44px_rgba(0,0,0,0.32)] backdrop-blur-xl';
  const meditationGlassButton =
    'rounded-[18px] border border-white/14 bg-white/8 text-white transition-colors hover:bg-white/12';

  useEffect(() => {
    let mounted = true;
    const fetchTracks = async () => {
      try {
        const tracks = await apiService.getMeditationTracks();

        if (mounted) {
          if (tracks && tracks.length > 0) {
            setMeditationTracks(tracks);
            setSelectedSound(tracks[0]);
          } else {
            const fallbacks = availableSoundscapes || [];
            setMeditationTracks(fallbacks);
            setSelectedSound(fallbacks[0] || null);
          }
        }
      } catch (error) {
        console.error('Error loading meditation tracks:', error);
        if (mounted) {
          const fallbacks = availableSoundscapes || [];
          setMeditationTracks(fallbacks);
          setSelectedSound(fallbacks[0] || null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTracks();
    return () => {
      mounted = false;
    };
  }, [availableSoundscapes]);

  const handleSoundSelect = (sound: Soundscape) => {
    buttonSoundService.play('click');
    setSelectedSound(sound);
    audioManager.previewSoundscape(sound);
  };

  const handleBegin = () => {
    if (!selectedSound) return;
    
    buttonSoundService.play('confirm');
    onBegin({
      type: PracticeType.MEDITATION,
      duration,
      soundscape: selectedSound,
      focusAreas: [],
    });
  };

  return (
    <div className={`h-full w-full overflow-y-auto px-4 pt-4 pb-8 custom-scrollbar ${textColor}`}>
      <div className={pageShell}>
        <div className="flex items-center justify-between">
        <button
          onClick={() => {
            buttonSoundService.play('back');
            onBack();
          }}
          className={backButton}
        >
          <span>←</span>
          <span className="font-semibold tracking-wide uppercase">Back</span>
        </button>
          <span className={INNER_TITLE_PILL}>Meditation Setup</span>
        </div>

        <div className={sectionFrame}>
          <div className={heroCard}>
            <p className={sectionKicker}>Sacred Stillness</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/12">
                <Clock className="text-emerald-400" size={18} />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-semibold">Choose Your Duration</h1>
                <p className={`mt-1 text-sm ${subTextColor}`}>
                  Set the rhythm and the atmosphere before you begin.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className={`space-y-4 ${meditationGlassCard}`}>
            <p className={sectionKicker}>Duration</p>
            {!showCustomTime ? (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        buttonSoundService.play('click');
                        setDuration(d);
                      }}
                      className={`h-11 text-xs font-semibold ${
                        duration === d
                          ? 'rounded-[18px] border border-amber-400/80 bg-amber-500/12 text-amber-200'
                          : meditationGlassButton
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    buttonSoundService.play('click');
                    setShowCustomTime(true);
                  }}
                  className="text-left text-[11px] text-white underline transition-colors hover:text-amber-100"
                >
                  Prefer a custom timer? Choose your own meditation length.
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Custom duration</span>
                  <span className="font-bold text-amber-400">{duration} min</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-amber-500"
                  aria-label="Custom meditation duration"
                />
                <button
                  type="button"
                  onClick={() => {
                    buttonSoundService.play('back');
                    setShowCustomTime(false);
                  }}
                  className={`${meditationGlassButton} w-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]`}
                >
                  Back to Quick Times
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={sectionFrame}>
          <div className={`space-y-4 ${meditationGlassCard}`}>
            <div className="flex items-center gap-3">
              <Music className="text-emerald-400" size={18} />
              <div>
                <p className={sectionKicker}>Soundscape</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Choose the Atmosphere</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[140px] flex-col items-center justify-center space-y-2">
                <Loader className="animate-spin text-amber-400" size={24} />
                <p className="text-xs text-white">Loading tracks...</p>
              </div>
            ) : (
              <div className="max-h-[280px] space-y-2 overflow-y-auto custom-scrollbar">
                {meditationTracks.length === 0 ? (
                  <div className="flex min-h-[140px] flex-col items-center justify-center space-y-2 rounded-[18px] border border-dashed border-amber-500/20 text-center">
                    <Music className="text-slate-500" size={32} />
                    <p className="text-sm text-white">No tracks found</p>
                  </div>
                ) : (
                  meditationTracks.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSoundSelect(s)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                        selectedSound?.id === s.id
                          ? 'rounded-[18px] border border-emerald-400/55 bg-emerald-500/12 text-white'
                          : meditationGlassButton
                      }`}
                    >
                      <span className="truncate font-medium">{s.label}</span>
                      {selectedSound?.id === s.id ? <PlayCircle size={14} className="animate-pulse" /> : null}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className={sectionFrame}>
          <div className={`${meditationGlassCard} space-y-3`}>
            <p className="text-center text-[11px] leading-relaxed text-white">
              Set your intention, then breathe with the visual rhythm.
            </p>
            <button
              onClick={handleBegin}
              disabled={!selectedSound || loading}
              className={INNER_PRIMARY_BUTTON}
            >
              Begin {duration} Minute Meditation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
