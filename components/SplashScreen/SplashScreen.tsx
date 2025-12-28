// components/SplashScreen/SplashScreen.tsx - USING SACREDBACKGROUND
import React, { useEffect, useState } from 'react';
import { SacredBackground } from '../SacredBackground';
import BreathingOrb from '../BreathingOrb';
import { buttonSoundService } from '../../services/buttonSoundService';
import { startAmbience, stopAmbience } from '../../services/audioService';

interface SplashScreenProps {
  onComplete: () => void;
  theme?: 'light' | 'dark';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  theme = 'dark',
}) => {
  const [progress, setProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  const preparationMessages = [
    "Calling upon the Ancestors...",
    "Gathering Spiritual Guides...", 
    "Clearing Sacred Space...",
    "Aligning Energies...",
    "We Are Ready For You"
  ];

  // Start background music when SplashScreen loads
  useEffect(() => {
   startAmbience('/abundance-alchemy/assets/audio/ambient/default.mp3', 50);
    
    return () => {
      stopAmbience();
    };
  }, []);

  // Handle preparation animation
  useEffect(() => {
    if (!isPreparing) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update message based on progress
        if (newProgress < 20) setCurrentMessage(preparationMessages[0]);
        else if (newProgress < 40) setCurrentMessage(preparationMessages[1]);
        else if (newProgress < 60) setCurrentMessage(preparationMessages[2]);
        else if (newProgress < 80) setCurrentMessage(preparationMessages[3]);
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
    }, 60);

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
    stopAmbience();
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  return (
    <SacredBackground theme={theme}>
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-6 py-10 items-center justify-center">
        
        {/* UNIVERSAL ORB */}
        <div className="mb-2 -mt-4">
          <BreathingOrb 
            size={120}
            breathingSpeed={4000}
          />
        </div>

        {/* TITLE CARD */}
        <div className={`backdrop-blur-md rounded-2xl border p-4 mb-3 w-full max-w-xs shadow-xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-amber-500/15' 
            : 'bg-gradient-to-b from-slate-100 to-white border-slate-300/40'
        }`}>
          <h1 className="text-lg font-light tracking-[0.18em] text-amber-500 text-center">
            Abundance Alchemy
          </h1>
        </div>

        {/* CHIPS */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            Affirmations
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            Meditation
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            Gratitude
          </div>
        </div>

        {/* BODY CARD */}
        <div className={`backdrop-blur-md rounded-2xl border p-5 mb-6 w-full max-w-xs shadow-xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-white/10' 
            : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'
        }`}>
          <div className="text-center space-y-2">
            <p className="text-slate-300 text-sm">
              Transformational Change
            </p>
            <p className="text-slate-300 text-sm">
              Always Begins with Us
            </p>
            <p className="text-slate-300 text-sm">
              Conscious Reality Shifting
            </p>
            <p className="text-slate-300 text-sm">
              The Power Of Your I Am
            </p>
          </div>
        </div>

        {/* DYNAMIC SECTION */}
        {!isPreparing ? (
          <button
            onClick={handleStartPreparation}
            className="mt-2 px-5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-sm tracking-wider hover:opacity-90 transition-opacity shadow-lg"
          >
            Enter The Sacred Space
          </button>
        ) : (
          <div className="w-full max-w-xs space-y-4">
            {/* LOADER */}
            <div className="space-y-3">
              <p className="text-slate-300 text-sm text-center min-h-[40px] flex items-center justify-center">
                {currentMessage}
              </p>
              
              <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-xs text-slate-400 text-center">
                {progress}% Prepared
              </p>
            </div>

            {/* "I AM READY" GLOWING LINK */}
            {isReady && (
              <button
                onClick={handleReadyClick}
                className="w-full backdrop-blur-md rounded-2xl border p-4 shadow-xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 group"
              >
                <p className="text-slate-300 text-sm text-center group-hover:text-amber-300 transition-colors duration-300">
                  I Am Ready For Transformation
                </p>
                <div className="mt-2 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent group-hover:via-amber-400/70 transition-all duration-300" />
              </button>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-8 text-center max-w-xs">
          <p className="text-xs text-slate-500 mb-2">
            Based on the book "I Am Practice" by Michael Soaries.
          </p>
          <p className="text-xs text-slate-500">
            By continuing you agree to be a part of<br />
            the Abundant Thought Community and abide by community standards.<br />
            <a href="#" className="text-amber-400 hover:text-amber-300 underline">
              View our privacy policy here.
            </a>
          </p>
        </div>
      </div>
    </SacredBackground>
  );
};