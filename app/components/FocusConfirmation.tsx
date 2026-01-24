// components/FocusConfirmation.tsx
import React from 'react';
import { FocusChoice } from '../types';
import { buttonSoundService } from '../services/buttonSoundService';
import { Check } from 'lucide-react';

interface FocusConfirmationProps {
  focus: FocusChoice;
  userName: string;
  onComplete: () => void;
  theme: 'light' | 'dark';
}

export const FocusConfirmation: React.FC<FocusConfirmationProps> = ({
  focus,
  userName,
  onComplete,
  theme
}) => {
  const handleComplete = () => {
    buttonSoundService.play('confirm');
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Celebration Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/40 to-cyan-400/40 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-400 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-amber-400 rounded-full animate-ping"
                style={{
                  top: `${Math.sin(i * 0.785) * 60 + 50}px`,
                  left: `${Math.cos(i * 0.785) * 60 + 50}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Sacred Confirmation */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-light tracking-widest text-emerald-400">
            FOCUS CONFIRMED, {userName.toUpperCase()}
          </h1>
          
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="text-2xl">{focus.icon}</div>
              <div>
                <div className="text-xl font-bold">{focus.label}</div>
                <div className="text-sm text-amber-400 font-medium">{focus.swahili}</div>
              </div>
            </div>
            
            <div className="text-slate-300 leading-relaxed">
              <p className="mb-3">Your sacred focus has been set:</p>
              <p className="text-lg font-medium text-amber-300">"{focus.label}"</p>
              <p className="text-sm text-slate-400 mt-2">({focus.swahili})</p>
            </div>
            
            <div className="pt-4 border-t border-slate-700/50">
              <div className="text-sm text-slate-400 space-y-2">
                <p>This focus will guide your:</p>
                <ul className="list-disc list-inside text-left pl-4 space-y-1">
                  <li>Daily I AM affirmations</li>
                  <li>Evening I LOVE reflections</li>
                  <li>Meditation intentions</li>
                  <li>Sacred journal entries</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Swahili Affirmation Bonus */}
        <div className="glass-panel p-5 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">
            Your Sacred Affirmation
          </div>
          <div className="text-lg font-bold text-amber-300 text-center">
            "{focus.swAffirmation}"
          </div>
          <div className="text-sm text-slate-400 text-center mt-2">
            Repeat this daily to align with your focus
          </div>
        </div>

        {/* Continue to Tutorial */}
        <button
          onClick={handleComplete}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white font-medium tracking-wider hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center space-x-2"
        >
          <span>ENTER SACRED SPACE</span>
          <Check className="w-5 h-5" />
        </button>

        {/* Sacred Note */}
        <div className="text-center text-sm text-slate-500">
          <p>Your focus can be changed anytime in Settings.</p>
          <p className="text-xs mt-1">May this focus bring you transformation and peace.</p>
        </div>
      </div>
    </div>
  );
};