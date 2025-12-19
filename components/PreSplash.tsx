import React from 'react';
import { Sparkles } from 'lucide-react';

interface PreSplashProps {
  onContinue: () => void;
  theme?: 'light' | 'dark';
}

export const PreSplash: React.FC<PreSplashProps> = ({ onContinue, theme = 'dark' }) => {
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden animate-in fade-in duration-1000">
      {/* Background Ambience Visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 text-center max-w-sm">
        <div className="relative group cursor-pointer" onClick={onContinue}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
          <img 
            src="/logo.png" 
            alt="Abundant Thought" 
            className="h-24 w-auto relative z-10 drop-shadow-2xl transform transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
        </div>

        <div className="space-y-4">
          <h1 className={`text-3xl font-serif font-bold ${textColor} tracking-tight`}>
            Abundance Alchemy
          </h1>
          <p className={`text-sm ${subTextColor} leading-relaxed max-w-xs mx-auto`}>
            Tap below to begin your journey into I Am & I Love consciousness.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="absolute inset-0 border border-white/20 rounded-full" />
          
          <div className="relative flex items-center space-x-2">
            <span className={`text-sm font-bold uppercase tracking-[0.2em] ${textColor}`}>
              Enter
            </span>
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
          </div>
        </button>

        <p className="text-[10px] text-slate-500 uppercase tracking-widest pt-8 opacity-60">
          Audio Experience Enabled
        </p>
      </div>
    </div>
  );
};
