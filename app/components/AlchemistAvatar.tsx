// src/components/AlchemistAvatar.tsx
import React from 'react';

interface AlchemistAvatarProps {
  speaking?: boolean;
  mood?: 'calm' | 'active' | 'gratitude';
  size?: 'sm' | 'md' | 'lg';
  progress?: number; // 0 to 1
  className?: string;
}

export const AlchemistAvatar: React.FC<AlchemistAvatarProps> = ({
  speaking = false,
  mood = 'active',
  size = 'md',
  progress = 0,
  className = ''
}) => {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-24 h-24',
    md: 'w-44 h-44',
    lg: 'w-72 h-72'
  };

  const colors = {
    calm: {
      glow: 'shadow-[0_0_60px_rgba(99,102,241,0.7)]',
      core: 'from-indigo-500 via-purple-700 to-indigo-900',
      flare: 'bg-indigo-300',
      progress: 'stroke-indigo-400'
    },
    active: {
      glow: 'shadow-[0_0_80px_rgba(245,158,11,0.7)]',
      core: 'from-amber-400 via-orange-600 to-amber-900',
      flare: 'bg-amber-200',
      progress: 'stroke-amber-400'
    },
    gratitude: {
      glow: 'shadow-[0_0_60px_rgba(16,185,129,0.7)]',
      core: 'from-emerald-400 via-teal-600 to-emerald-900',
      flare: 'bg-emerald-200',
      progress: 'stroke-emerald-400'
    }
  } as const;

  const theme = colors[mood];
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className={`relative flex items-center justify-center ${sizeClasses[size]} mx-auto ${className}`}
    >
      {/* 1. Progress Ring */}
      <svg
        className="absolute inset-0 w-full h-full rotate-[-90deg] z-40 pointer-events-none"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-white/6"
          strokeWidth={0.5}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className={`${theme.progress} transition-all duration-1000 ease-out drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]`}
          strokeWidth={1.5}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* 2. Speaking ping waves */}
      {speaking && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 rounded-full border-2 border-white/18 animate-ping opacity-40" />
          <div
            className="absolute inset-[-20%] rounded-full border border-white/10 animate-ping opacity-20"
            style={{ animationDelay: '500ms' }}
          />
        </div>
      )}

     {/* 3. Living Orb container with breath */}
<div
  className={`relative w-[90%] h-[90%] rounded-full bg-black overflow-hidden border border-transparent z-10 animate-breath`}
>
  {/* Breathing background haze behind the disc */}
  <div className="absolute inset-[-40%] rounded-full bg-gradient-to-br from-black via-slate-900 to-black opacity-90" />
  <div className="absolute inset-[-50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18)_0%,transparent_45%,rgba(0,0,0,1)_100%)] blur-3xl opacity-50" />

  {/* Dark disc */}
  <div className="absolute inset-[14%] rounded-full bg-black" />

  {/* Thin luminous rim */}
  <div className="absolute inset-[14%] rounded-full border border-white/70 shadow-[0_0_25px_rgba(255,255,255,0.7)]" />

  {/* Edge flare – bright, pulsing, illuminating background */}
  <div className="absolute right-[2%] bottom-[6%] w-7 h-7 rounded-full bg-white/90 blur-xl shadow-[0_0_45px_rgba(255,255,255,1)] animate-pulse" />
  <div className="absolute right-[-4%] bottom-[0%] w-16 h-16 rounded-full bg-white/15 blur-3xl" />

  {/* Optional tiny central star, very subtle */}
  <div className="absolute inset-[28%] flex items-center justify-center">
    <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.7)] opacity-60" />
  </div>

  {/* Vignette to keep interior dark */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />
</div>


      {/* 5. Floating embers */}
      <div
        className={`absolute top-4 right-4 w-1 h-1 ${theme.flare} rounded-full blur-[1px] shadow-[0_0_10px_currentColor] animate-pulse z-40`}
      />
      <div
        className={`absolute bottom-8 left-4 w-1.5 h-1.5 ${theme.flare} rounded-full blur-[1px] shadow-[0_0_12px_currentColor] animate-bounce z-40`}
        style={{ animationDelay: '1.2s' }}
      />
    </div>
  );
};
