import React from 'react';
import { AppMode, PracticeType } from '../types';
import { Volume2, VolumeX } from 'lucide-react';
import { useBackgrounds } from '../services/useBackgrounds';
import { BackgroundSlot } from '../services/apiService';
import { buttonSoundService } from '../services/buttonSoundService';

interface LayoutProps {
  mode: AppMode;
  practiceType?: PracticeType;
  theme: 'light' | 'dark';
  children: React.ReactNode;
  volume?: number;
  musicOn?: boolean;
  onUpdateVolume?: (vol: number) => void;
  onToggleMusic?: () => void;
  isWelcomePhase?: boolean;
}

// Decide which background slot to use based on high-level app mode and sub-states
const resolveBackgroundSlot = (
  mode: AppMode,
  practiceType?: PracticeType,
  isWelcomePhase?: boolean
): BackgroundSlot => {
  switch (mode) {
    case AppMode.PRE_SPLASH:
      return 'SPLASH';
    case AppMode.SPLASH:
      // If we are in the welcome phase of the splash screen, return the new slot
      return isWelcomePhase ? 'SPLASH_WELCOME' : 'SPLASH';
    case AppMode.AUTH:
    case AppMode.ONBOARDING:
      return 'AUTH';
    case AppMode.TUTORIAL:
      return 'SPLASH';
    case AppMode.DASHBOARD:
      return 'HOME';
    case AppMode.MEDITATION_SETUP:
      return 'MEDITATION_SETUP';
    case AppMode.SETTINGS:
      return 'SETTINGS';
    case AppMode.LIBRARY:
    case AppMode.PROFILE:
      return 'PROGRESS';
    case AppMode.PRACTICE:
      if (practiceType === PracticeType.MORNING_IAM) return 'IAM_PRACTICE';
      if (practiceType === PracticeType.EVENING_ILOVE) return 'ILOVE_PRACTICE';
      if (practiceType === PracticeType.MEDITATION) return 'MEDITATION_PRACTICE';
      return 'HOME';
    default:
      return 'HOME';
  }
};

export const Layout: React.FC<LayoutProps> = ({
  mode,
  practiceType,
  theme,
  children,
  volume = 35,
  musicOn = true,
  onUpdateVolume,
  onToggleMusic,
  isWelcomePhase
}) => {
  const { backgrounds } = useBackgrounds();

  const getBackgroundImage = (): string => {
    const basePath = './assets/images/backgrounds/';

    const slot = resolveBackgroundSlot(mode, practiceType, isWelcomePhase);
    const entry = backgrounds[slot];

    // Dynamic DB-driven background if configured
    if (entry && entry.imageUrl) {
      return `url('${entry.imageUrl}')`;
    }

    // Fallback to static image logic
    if (mode === AppMode.PRE_SPLASH) {
      return `url('${basePath}splash.jpg')`;
    }

    if (mode === AppMode.SPLASH) {
      if (isWelcomePhase) {
        // Fallback for welcome phase if DB entry missing
        return `url('${basePath}meditation.jpg')`;
      }
      return `url('${basePath}splash.jpg')`;
    }

    if (mode === AppMode.AUTH || mode === AppMode.ONBOARDING) {
      return `url('${basePath}splash.jpg')`;
    }

    if (mode === AppMode.TUTORIAL) {
      return `url('${basePath}journey.jpg')`;
    }

    if (mode === AppMode.MEDITATION_SETUP) {
      return `url('${basePath}meditation.jpg')`;
    }

    if (mode === AppMode.PRACTICE) {
      if (practiceType === PracticeType.MORNING_IAM) return `url('${basePath}morning.jpg')`;
      if (practiceType === PracticeType.EVENING_ILOVE) return `url('${basePath}evening.jpg')`;
      if (practiceType === PracticeType.MEDITATION) return `url('${basePath}meditation.jpg')`;
      return `url('${basePath}splash.jpg')`;
    }

    if (theme === 'light') {
      return `url('${basePath}morning.jpg')`;
    } else {
      return `url('${basePath}evening.jpg')`;
    }
  };

  const getGradientOverlay = () => {
    if (mode === AppMode.PRACTICE) {
      if (practiceType === PracticeType.MORNING_IAM) {
        return 'bg-gradient-to-br from-amber-900/40 via-slate-900/40 to-slate-950/60';
      }
      if (practiceType === PracticeType.EVENING_ILOVE) {
        return 'bg-gradient-to-br from-purple-900/40 via-slate-900/40 to-slate-950/60';
      }
      if (practiceType === PracticeType.MEDITATION) {
        return 'bg-gradient-to-br from-indigo-900/40 via-slate-900/40 to-slate-950/60';
      }
    }

    if (mode === AppMode.MEDITATION_SETUP) {
      return 'bg-gradient-to-br from-indigo-900/40 via-slate-900/40 to-slate-950/60';
    }

    if (mode === AppMode.DASHBOARD || mode === AppMode.LIBRARY || mode === AppMode.PROFILE) {
      return theme === 'light'
        ? 'bg-gradient-to-b from-slate-900/40 via-slate-950/60 to-black/80'
        : 'bg-gradient-to-b from-black/40 via-slate-950/70 to-black/90';
    }

    if (mode === AppMode.AUTH || mode === AppMode.ONBOARDING || mode === AppMode.TUTORIAL) {
      return 'bg-gradient-to-b from-black/50 via-slate-950/70 to-black/90';
    }

    // Splash / default
    return 'bg-gradient-to-b from-black/40 via-slate-950/70 to-black/90';
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    onUpdateVolume?.(newVol);
  };

  const handleToggleMusic = () => {
    buttonSoundService.play('click');
    onToggleMusic?.();
  };

  const bgImage = getBackgroundImage();
  const gradientClass = getGradientOverlay();

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-black text-slate-100">
      {/* Inner phone-frame container locked to viewport height */}
      <div className="relative w-full h-[100dvh] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto overflow-hidden rounded-none sm:rounded-3xl shadow-2xl">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: bgImage }}
        />

        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 ${gradientClass} transition-colors duration-700 pointer-events-none`}
        />

        {/* Global audio controls */}
        {mode !== AppMode.PRE_SPLASH && (
          <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 animate-in fade-in">
            <div className="flex items-center space-x-2 bg-black/40 rounded-full px-2 py-1 border border-white/10 hover:bg-black/60 transition-colors group">
              <button
                onClick={handleToggleMusic}
                className="text-white/70 hover:text-amber-400 transition-colors p-1"
                aria-label="Toggle Music"
              >
                {musicOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <div className="w-0 overflow-hidden group-hover:w-16 transition-all duration-300 ease-out flex items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content container fills the frame */}
        <div className="w-full h-full relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};