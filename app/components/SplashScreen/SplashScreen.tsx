// components/SplashScreen/SplashScreen.tsx - NORMALIZED TO UNIVERSAL DESIGN SYSTEM
import React, { useEffect, useRef, useState } from 'react';
import BreathingOrb from '../BreathingOrb';
import { buttonSoundService } from '../../services/buttonSoundService';
import { startAmbience } from '../../services/audioService';
import { SacredBackground } from '../SacredBackground';
import { href } from '../../services/base';

interface SplashScreenProps {
  onComplete: () => void;
  theme?: 'light' | 'dark';
}

type BackgroundMap = Record<string, { imageUrl?: string }>;

const API_BACKGROUND_ENDPOINT = '/abundance-alchemy/api/get-backgrounds.php';

// Best-effort list (covers both new + returning paths) — capped for mobile safety
const PRELOAD_SLOTS: string[] = [
  'WELCOME',
  'SPLASH_WELCOME',
  'AUTH',
  'RETURN_PORTAL',
  'HOME', // Dashboard background slot in admin
  'SETTINGS',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  theme = 'dark',
}) => {
  const [progress, setProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  // keep image objects alive so the browser actually completes downloads
  const preloadImagesRef = useRef<HTMLImageElement[]>([]);
  const didPreloadRef = useRef(false);

  const preparationMessages = [
    'Burning Sage...',
    'Anchoring Sacred Space...',
    'Orishas present...',
    'Ancestors Seated...',
    'We Are Ready For You',
  ];

  // Start background music when SplashScreen loads
  useEffect(() => {
    startAmbience(href('assets/audio/ambient/default.mp3'), 50);
  }, []);

  // Best-effort background preloading during preparation
  useEffect(() => {
    if (!isPreparing) return;
    if (didPreloadRef.current) return; // only once per mount
    didPreloadRef.current = true;

    const preload = async () => {
      try {
        const res = await fetch(API_BACKGROUND_ENDPOINT, { credentials: 'include' });
        if (!res.ok) return;

        const data = (await res.json()) as BackgroundMap;

        const urls: string[] = PRELOAD_SLOTS
          .map((slot) => data?.[slot]?.imageUrl)
          .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
          // cap to avoid memory pressure on iOS Safari
          .slice(0, 6)
          .map((u) => {
            // normalize to absolute to avoid edge cases
            try {
              return new URL(u, window.location.origin).toString();
            } catch {
              return u;
            }
          });

        // fire-and-forget preloads (best effort)
        urls.forEach((src) => {
          const img = new Image();
          img.decoding = 'async';
          img.loading = 'eager';
          img.src = src;
          preloadImagesRef.current.push(img);
        });

        // Optional (debug): console.log('[Splash preload] queued', urls.length, urls);
      } catch {
        // best effort: ignore preload errors
      }
    };

    void preload();
  }, [isPreparing]);

  // Handle preparation animation - SLOWER LOADING
  useEffect(() => {
    if (!isPreparing) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1.5; // 1.5% every 100ms = ~6.7 seconds total

        // Update message based on progress
        if (newProgress < 20) setCurrentMessage(preparationMessages[0]);
        else if (newProgress < 40) setCurrentMessage(preparationMessages[1]);
        else if (newProgress < 55) setCurrentMessage(preparationMessages[2]);
        else if (newProgress < 85) setCurrentMessage(preparationMessages[3]);
        else {
          setCurrentMessage(preparationMessages[4]);
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsReady(true);
            return 100;
          }
        }
        return newProgress;
      });
    }, 100); // Slowed interval from 60ms to 100ms

    return () => clearInterval(interval);
  }, [isPreparing]);

  const handleStartPreparation = () => {
    console.log('Start preparation button clicked');
    buttonSoundService.play('click');
    setIsPreparing(true);
  };

  const handleReadyClick = () => {
    console.log('Ready button clicked');
    buttonSoundService.play('click');
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  // UNIVERSAL TITLE CARD CLASSES
  const titleCardClasses =
    'backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10';

  // UNIVERSAL CONTENT CARD CLASSES
  const contentCardClasses =
    'backdrop-blur-lg rounded-2xl border border-amber-500/20 p-4 md:p-6 w-full max-w-[280px] shadow-2xl bg-slate-900/40';

  return (
    <SacredBackground theme={theme} backgroundType="splash">
      {/* UNIVERSAL CONTAINER: justify-start on mobile, center on medium+ */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start md:justify-center p-4 md:p-6 overflow-y-auto">
        {/* UNIVERSAL ORB - 80PX SIZE (LAW OF THE LAND) */}
        <div className="mt-8 md:mt-12 mb-4 md:mb-6">
          <BreathingOrb size={80} breathingSpeed={4000} />
        </div>

        {/* UNIVERSAL TITLE CARD - "Abundance Alchemy" */}
        <div className={`${titleCardClasses} mb-4 md:mb-6`}>
          <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
            Abundance Alchemy
          </h1>
        </div>

        {/* CHIPS WITH CULTURALLY RELEVANT ICONS & SACRED HOVER */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 group transition-all duration-500 hover:bg-amber-500/15 hover:border-amber-400/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <span
              className="text-sm transition-all duration-500 group-hover:rotate-12 group-hover:scale-125"
              style={{ color: '#D4AF37' }}
            >
              ✩
            </span>
            <span className="text-xs text-amber-300 transition-all duration-500 group-hover:tracking-widest group-hover:font-medium group-hover:text-amber-200">
              Affirmations
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 group transition-all duration-500 hover:bg-amber-500/15 hover:border-amber-400/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <span
              className="text-sm transition-all duration-500 group-hover:rotate-12 group-hover:scale-125"
              style={{ color: '#8A2BE2' }}
            >
              🪷
            </span>
            <span className="text-xs text-amber-300 transition-all duration-500 group-hover:tracking-widest group-hover:font-medium group-hover:text-amber-200">
              Meditation
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 group transition-all duration-500 hover:bg-amber-500/15 hover:border-amber-400/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <span
              className="text-sm transition-all duration-500 group-hover:rotate-12 group-hover:scale-125"
              style={{ color: '#DC2626' }}
            >
              ❤️
            </span>
            <span className="text-xs text-amber-300 transition-all duration-500 group-hover:tracking-widest group-hover:font-medium group-hover:text-amber-200">
              Gratitude
            </span>
          </div>
        </div>

        {/* BODY CARD - USING UNIVERSAL CLASSES */}
        <div className={`${contentCardClasses} mb-3 md:mb-4`}>
          <div className="text-center space-y-2">
            <p className="text-slate-300 text-sm font-extralight">Transformational Change</p>
            <p className="text-slate-300 text-sm font-extralight">Always Begins with Us</p>
            <p className="text-slate-300 text-sm font-extralight">Conscious Reality Shifting</p>
            <p className="text-slate-300 text-sm font-extralight">The Power Of Your I Am</p>
          </div>
        </div>

        {/* DYNAMIC SECTION */}
        {!isPreparing ? (
          <button
            onClick={handleStartPreparation}
            className="mt-2 md:mt-3 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-sm tracking-wider hover:opacity-90 transition-opacity shadow-lg"
          >
            Enter The Sacred Space
          </button>
        ) : (
          <div className="w-full max-w-xs space-y-4">
            {/* LOADER */}
            <div className="space-y-3">
              <p className="text-white text-sm text-center min-h-[40px] flex items-center justify-center">
                {currentMessage}
              </p>

              {/* PLAIN ORANGE LINE - SIMPLE & WORKING */}
              <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-white text-center">{progress}% Prepared</p>
            </div>

            {/* "I AM READY" - UNIVERSAL BUTTON STYLE */}
            {isReady && (
              <div className="flex justify-center w-full">
                <button
                  onClick={handleReadyClick}
                  className="mt-4 md:mt-6 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-sm tracking-wider transition-all duration-300 hover:opacity-95 shadow-[0_0_18px_rgba(245,158,11,0.45)] animate-[aaReadyPulse_1700ms_ease-in-out_infinite] hover:animate-none"
                >
                  I Am Ready For Transformation
                </button>
              </div>
            )}
          </div>
        )}

        {/* FOOTER TEXT - MATCH CARD STYLE */}
        <div className={`${contentCardClasses} mt-3 md:mt-4`}>
          <div className="text-center space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              By continuing you agree to be a part of
              <br />
              the Abundant Thought Community
              <br />
              and abide by community standards.
            </p>

            <p className="text-xs text-slate-300">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline"
              >
                View our privacy policy here.
              </a>
            </p>

            <p className="text-[10px] md:text-xs text-slate-300 whitespace-nowrap">
              © 2024 Abundant Thought - Michael Soaries
            </p>

            <p className="text-xs text-slate-300 leading-relaxed">
              Unless otherwise indicated
              <br />
              all images and music clips
              <br />
              used under Pexels.com Free Use License.
            </p>

            <p className="text-xs text-slate-300 leading-relaxed">
              Based on the book "I Am Practice"
              <br />
              by Michael Soaries.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes aaReadyPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
            box-shadow: 0 0 18px rgba(245, 158, 11, 0.45);
          }
          50% {
            transform: scale(1.045);
            filter: brightness(1.08);
            box-shadow: 0 0 28px rgba(245, 158, 11, 0.72);
          }
        }
      `}</style>
    </SacredBackground>
  );
};
