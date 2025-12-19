import React, { useState, useEffect } from 'react';
import { Clock, Music, Loader, PlayCircle } from 'lucide-react';
import { PracticeType, Soundscape, PracticeSessionConfig } from '../types';
import { apiService } from '../services/apiService';
import { audioManager } from '../services/audioService';
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
  const [selectedSound, setSelectedSound] = useState<Soundscape | null>(null);
  const [meditationTracks, setMeditationTracks] = useState<Soundscape[]>([]);
  const [loading, setLoading] = useState(true);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-400';
  const cardBg =
    theme === 'light'
      ? 'bg-white border-slate-200'
      : 'bg-slate-900/70 border-slate-700';

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
   // Line 81-85
onBegin({
  type: PracticeType.MEDITATION,
  duration: duration,  //Changed from selectedDuration
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
          <Clock className="text-indigo-400" size={20} />
          <h2 className="text-lg font-serif">Choose Duration</h2>
        </div>

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
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-105'
                  : theme === 'light'
                  ? 'bg-transparent border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                  : 'bg-transparent border-slate-600/40 hover:border-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
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
            <Loader className="animate-spin text-indigo-400" size={24} />
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
              theme === 'light' ? 'bg-indigo-400/30' : 'bg-indigo-500/30'
            }`}
          />
        </div>

        <p className={`text-[11px] ${subTextColor} text-center leading-relaxed px-2`}>
          Set your intention, then breathe with the visual rhythm.
        </p>

        <button
          onClick={handleBegin}
          disabled={!selectedSound || loading}
          className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Begin {duration} Minute Meditation
        </button>
      </div>
    </div>
  );
};