import React from 'react';

interface AlchemistAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  mood?: 'calm' | 'active' | 'wise';
  speaking?: boolean;
}

export const AlchemistAvatar: React.FC<AlchemistAvatarProps> = ({ 
  size = 'md', 
  mood = 'calm',
  speaking = false 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const glowColors = {
    calm: 'shadow-indigo-500/50',
    active: 'shadow-amber-500/50',
    wise: 'shadow-purple-500/50'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-amber-600 ${speaking ? 'animate-pulse' : ''} shadow-xl ${glowColors[mood]}`} />
      <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <svg 
          viewBox="0 0 100 100" 
          className="w-3/4 h-3/4"
          fill="none"
        >
          <circle cx="50" cy="50" r="45" fill="url(#avatarGradient)" opacity="0.2" />
          <defs>
            <radialGradient id="avatarGradient">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#a855f7" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      {mood === 'wise' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-ping" />
      )}
    </div>
  );
};