import React, { useState, useEffect } from 'react';
import { Clock, Music, Loader, PlayCircle } from 'lucide-react';
import { PracticeType, Soundscape, PracticeSessionConfig } from '../types';
import { apiService } from '../services/apiService';
import { audioManager } from '../services/audioManager';
import { buttonSoundService } from '../services/buttonSoundService';

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
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-400';
  const cardBg =
    theme === 'light'
      ? 'bg-gradient-to-br from-white/95 to-amber-50/70 border-slate-200'
      : 'bg-gradient-to-br from-slate-900/75 to-slate-950/75 border-slate-700';

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
    <div
      className={`h-full flex flex-col p-4 max-w-md mx-auto ${textColor} pb-8 overflow-y-auto custom-scrollbar`}
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-6 relative min-h-[32px]">
        <button
          onClick={() => {
            buttonSoundService.play('back');
            onBack();
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-[11px] text-slate-100 hover:bg-black/80 transition-colors absolute left-0 z-10"
        >
          <span className="mr-1">←</span>
          <span className="font-semibold tracking-wide uppercase">Back</span>
        </button>

        <span className={`text-[10px] tracking-[0.25em] uppercase ${subTextColor} opacity-80`}>
          Meditation Setup
        </span>
      </div>

      {/* Duration card */}
      <div className={`rounded-2xl p-5 border shadow-lg mb-5 ${cardBg}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="text-amber-400" size={20} />
          <h2 className="text-lg font-serif">Choose Duration</h2>
        </div>

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
                  className={`h-11 rounded-xl text-xs font-semibold border transition-all ${
                    duration === d
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md scale-105'
                      : theme === 'light'
                      ? 'bg-transparent border-slate-300 hover:border-amber-400 hover:bg-amber-50'
                      : 'bg-transparent border-slate-600/40 hover:border-amber-400 hover:bg-amber-500/10'
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
              className={`mt-4 w-full text-center text-[11px] underline transition-colors ${
                theme === 'light' ? 'text-slate-700 hover:text-amber-700' : 'text-amber-200 hover:text-amber-100'
              }`}
            >
              Prefer a custom timer? Choose your own meditation length.
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className={subTextColor}>Custom duration</span>
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
              className={`w-full text-center text-[11px] underline transition-colors ${
                theme === 'light' ? 'text-slate-700 hover:text-amber-700' : 'text-amber-200 hover:text-amber-100'
              }`}
            >
              Back to quick times
            </button>
          </div>
        )}
      </div>

      {/* Soundscape card */}
      <div
        className={`rounded-2xl p-5 border shadow-lg mb-5 flex-1 flex flex-col overflow-hidden ${cardBg}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Music className="text-emerald-400" size={20} />
          <h2 className="text-lg font-serif">Soundscape</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-2">
            <Loader className="animate-spin text-amber-400" size={24} />
            <p className={`text-xs ${subTextColor}`}>Loading tracks...</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 max-h-56">
            {meditationTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 space-y-2 text-center p-4">
                <Music className="text-slate-500" size={32} />
                <p className={`text-sm ${textColor}`}>No tracks found</p>
              </div>
            ) : (
              meditationTracks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSoundSelect(s)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                    selectedSound?.id === s.id
                      ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-md'
                      : theme === 'light'
                      ? 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
                      : 'border-slate-600/40 hover:border-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <span className="truncate font-medium">{s.label}</span>
                  {selectedSound?.id === s.id && (
                    <PlayCircle size={14} className="animate-pulse" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="mt-auto space-y-3 pt-4">
        <div className="flex items-center justify-center mb-2">
          <div
            className={`w-8 h-8 rounded-full animate-breath ${
              theme === 'light' ? 'bg-amber-400/30' : 'bg-amber-500/30'
            }`}
          />
        </div>

        <p className={`text-[11px] ${subTextColor} text-center leading-relaxed px-2`}>
          Set your intention, then breathe with the visual rhythm.
        </p>

        <button
          onClick={handleBegin}
          disabled={!selectedSound || loading}
          className="w-full py-4 rounded-xl bg-amber-600 text-white font-bold text-base shadow-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Begin {duration} Minute Meditation
        </button>
      </div>
    </div>
  );
};
