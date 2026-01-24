// components/FocusIntroduction.tsx
import React from 'react';
import { buttonSoundService } from '../services/buttonSoundService';

interface FocusIntroductionProps {
  userName: string;
  onContinue: () => void;
  theme: 'light' | 'dark';
}

export const FocusIntroduction: React.FC<FocusIntroductionProps> = ({
  userName,
  onContinue,
  theme
}) => {
  const handleContinue = () => {
    buttonSoundService.play();
    onContinue();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Sacred Illustration/Orb Placeholder */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/40 to-orange-400/40 animate-pulse" />
          </div>
        </div>

        {/* Sacred Message */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-light tracking-widest text-amber-400">
            SACRED FOCUS, {userName}
          </h1>
          
          <div className="space-y-3 text-slate-300 leading-relaxed">
            <p>Every journey begins with a single, sacred intention.</p>
            <p>Your focus is the anchor for your practice—a beacon that guides your affirmations, meditations, and growth.</p>
            <p className="text-amber-300 font-medium">Choose the area of your life you wish to transform first.</p>
          </div>
        </div>

        {/* Sacred Principles */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-medium text-center mb-4">Sacred Principles</h3>
          
          <div className="space-y-3">
            {[
              { icon: '🎯', title: 'Intention', desc: 'Your focus directs your energy' },
              { icon: '🌀', title: 'Transformation', desc: 'Small, daily practices create change' },
              { icon: '💫', title: 'Alignment', desc: 'Your focus aligns with your highest self' },
            ].map((principle) => (
              <div key={principle.title} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30">
                <div className="text-xl">{principle.icon}</div>
                <div>
                  <div className="font-medium">{principle.title}</div>
                  <div className="text-sm text-slate-400">{principle.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-medium tracking-wider hover:opacity-90 transition-opacity shadow-lg"
        >
          CHOOSE MY SACRED FOCUS
        </button>
      </div>
    </div>
  );
};