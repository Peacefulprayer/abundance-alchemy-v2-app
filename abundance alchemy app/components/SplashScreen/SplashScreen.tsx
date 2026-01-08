// components/SplashScreen/SplashScreen.tsx - NORMALIZED TO UNIVERSAL DESIGN SYSTEM
import React, { useEffect, useState } from 'react';
import BreathingOrb from '../BreathingOrb';
import { buttonSoundService } from '../../services/buttonSoundService';
import { startAmbience, stopAmbience } from '../../services/audioService';
import { SacredBackground } from '../SacredBackground';

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
    "Burning Sage...",
    "Anchoring Sacred Space...",
    "Ancestors Assembled...",
    "Gathering Spiritual Guides...", 
    "We Are Ready For You"
  ];

  // Start background music when SplashScreen loads
  useEffect(() => {
    startAmbience('/abundance-alchemy/assets/audio/ambient/default.mp3', 50);
    
    return () => {
      stopAmbience();
    };
  }, []);

  // Handle preparation animation - SLOWER LOADING
  useEffect(() => {
    if (!isPreparing) return;

    const interval = setInterval(() => {
      setProgress(prev => {
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
    stopAmbience();
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  // UNIVERSAL TITLE CARD CLASSES
  const titleCardClasses = "backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10";

  // UNIVERSAL CONTENT CARD CLASSES
  const contentCardClasses = "backdrop-blur-lg rounded-2xl border border-amber-500/20 p-4 md:p-6 w-full max-w-[280px] shadow-2xl bg-slate-900/40";

  return (
    <SacredBackground theme={theme} backgroundType="splash">
      {/* UNIVERSAL CONTAINER: justify-start on mobile, center on medium+ */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start md:justify-center p-4 md:p-6 overflow-y-auto">
        
        {/* UNIVERSAL ORB - 80PX SIZE (LAW OF THE LAND) */}
        <div className="mt-8 md:mt-12 mb-4 md:mb-6">
          <BreathingOrb 
            size={80} // CHANGED: from 120 to 80
            breathingSpeed={4000}
          />
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
            <span className="text-sm transition-all duration-500 group-hover:rotate-12 group-hover:scale-125" style={{ color: '#D4AF37' }}>✩</span>
            <span className="text-xs text-amber-300 transition-all duration-500 group-hover:tracking-widest group-hover:font-medium group-hover:text-amber-200">
              Affirmations
            </span>
          </div>
          
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 group transition-all duration-500 hover:bg-amber-500/15 hover:border-amber-400/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <span className="text-sm transition-all duration-500 group-hover:rotate-12 group-hover:scale-125" style={{ color: '#8A2BE2' }}>🪷</span>
            <span className="text-xs text-amber-300 transition-all duration-500 group-hover:tracking-widest group-hover:font-medium group-hover:text-amber-200">
              Meditation
            </span>
          </div>
          
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 group transition-all duration-500 hover:bg-amber-500/15 hover:border-amber-400/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <span className="text-sm transition-all duration-500 group-hover:rotate-12 group-hover:scale-125" style={{ color: '#DC2626' }}>❤️</span>
            <span className="text-xs text-amber-300 transition-all duration-500 group-hover:tracking-widest group-hover:font-medium group-hover:text-amber-200">
              Gratitude
            </span>
          </div>
        </div>

        {/* BODY CARD - USING UNIVERSAL CLASSES */}
        <div className={`${contentCardClasses} mb-6 md:mb-8`}>
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
            className="mt-4 md:mt-6 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-sm tracking-wider hover:opacity-90 transition-opacity shadow-lg"
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
              
              {/* PLAIN ORANGE LINE - SIMPLE & WORKING */}
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

            {/* "I AM READY" - UNIVERSAL BUTTON STYLE */}
            {isReady && (
              <div className="flex justify-center w-full">
                <button
                  onClick={handleReadyClick}
                  className="mt-4 md:mt-6 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-sm tracking-wider hover:opacity-90 transition-opacity shadow-lg animate-[pulse_2s_ease-in-out_infinite] hover:animate-none"
                >
                  I Am Ready For Transformation
                </button>
              </div>
            )}
          </div>
        )}

        {/* FOOTER WITH PROPER SPACING & LIGHTER TEXT */}
        <div className="mt-8 text-center max-w-xs space-y-4">
          <p className="text-xs text-slate-400">
            Based on the book "I Am Practice" by Michael Soaries.
          </p>
          
          <div className="space-y-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              By continuing you agree to be a part of<br />
              the <a href="/community-standards" className="text-amber-400 hover:text-amber-300 underline">Abundant Thought Community</a> and abide by <a href="/community-standards" className="text-amber-400 hover:text-amber-300 underline">community standards</a>.
            </p>
            
            {/* SPACER */}
            <div className="h-4"></div>
            
            <p className="text-xs text-slate-400">
              <a href="/privacy-policy" className="text-amber-400 hover:text-amber-300 underline">
                View our privacy policy here.
              </a>
            </p>
          </div>
        </div>
      </div>
    </SacredBackground>
  );
};