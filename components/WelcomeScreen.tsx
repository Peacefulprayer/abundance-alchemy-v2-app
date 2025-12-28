// components/WelcomeScreen.tsx - USING SACREDBACKGROUND
import React, { useEffect, useState } from 'react';
import { AppMode, UserProfile } from '../types';
import { SacredBackground } from './SacredBackground';
import { buttonSoundService } from '../services/buttonSoundService';
import { startAmbience } from '../services/audioService';
import BreathingOrb from './BreathingOrb';

interface WelcomeScreenProps {
  user: UserProfile | null;
  onComplete: (nextMode: AppMode) => void;
  theme?: 'light' | 'dark';
}

const WELCOME_URL = '/abundance-alchemy/assets/audio/voices/welcome.mp3';
const WELCOME_DURATION_MS = 34000;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  user, 
  onComplete,
  theme = 'dark'
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Wait 0.5s, then play welcome.mp3
    const timer = setTimeout(() => {
      const audio = new Audio(WELCOME_URL);
      
      audio.play().catch((err) => {
        console.log('Welcome audio play failed:', err);
      });

      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const pct = Math.min(100, (elapsed / WELCOME_DURATION_MS) * 100);
        setProgress(pct);

        if (elapsed < WELCOME_DURATION_MS) {
          requestAnimationFrame(tick);
        } else {
          // Welcome audio ended, wait 0.5s then go to Auth
          setTimeout(() => {
            const nextMode = user ? AppMode.DASHBOARD : AppMode.AUTH;
            onComplete(nextMode);
            startAmbience('/abundance-alchemy/assets/audio/ambient/default.mp3', 50);
          }, 500);
        }
      };

      requestAnimationFrame(tick);

      return () => {
        audio.pause();
      };
    }, 500);

    return () => clearTimeout(timer);
  }, [user, onComplete]);

  const handleSkip = () => {
    console.log('Skip button clicked');
    buttonSoundService.play('click');
    const nextMode = user ? AppMode.DASHBOARD : AppMode.AUTH;
    onComplete(nextMode);
    startAmbience('/abundance-alchemy/assets/audio/ambient/default.mp3', 50);
  };

  return (
    <SacredBackground theme={theme}>
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-6 py-10 items-center justify-center">
        
        <div className="backdrop-blur-md rounded-2xl border p-8 w-full max-w-xs shadow-xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-white/10">
          
          <div className="mb-2 -mt-4">
            <BreathingOrb 
              size={100}
              breathingSpeed={4000}
            />
          </div>
          
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-xl font-light tracking-[0.2em] text-amber-500">
              Abundance Alchemy
            </h1>
            <p className="text-sm text-slate-300">
              We Are Honored To Welcome You.
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="text-[11px] tracking-[0.2em] uppercase text-slate-400 text-center">
              We Are Praying Now
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-sm text-slate-300 leading-relaxed">
              Take a sacred moment.{"\n"}
              Allow this introduction to hold you.
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleSkip}
            className="w-full px-5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-sm tracking-wider hover:opacity-90 transition-opacity shadow-lg"
          >
            Skip Intro
          </button>
          
          <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
            Listen fully, or skip now and begin your journey.
          </p>
        </div>
      </div>
    </SacredBackground>
  );
};