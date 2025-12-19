import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AlchemistAvatar } from './AlchemistAvatar';

export const SplashScreen: React.FC = () => {
  const [fadeClass, setFadeClass] = useState('opacity-0');

  useEffect(() => {
    const timer = setTimeout(() => setFadeClass('opacity-100'), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden animate-in fade-in duration-700">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`relative z-10 flex flex-col items-center space-y-6 transition-opacity duration-1000 ${fadeClass}`}>
         <img 
            src="/logo.png" 
            alt="Abundant Thought" 
            className="h-20 object-contain mx-auto drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: '300ms' }}>
            <AlchemistAvatar size="lg" mood="active" speaking={false} />
          </div>

          <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-indigo-200 drop-shadow-lg">
            Abundance Alchemy
          </h1>

          <p className="text-slate-400 text-xs tracking-wider uppercase pt-8 animate-pulse">
            Loading your experience...
          </p>
      </div>
    </div>
  );
};
