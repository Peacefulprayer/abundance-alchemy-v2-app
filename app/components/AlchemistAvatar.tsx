import React from 'react';
import BreathingOrb from './BreathingOrb';

interface AlchemistAvatarProps {
  speaking?: boolean;
  mood?: 'calm' | 'active' | 'gratitude';
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  className?: string;
}

export const AlchemistAvatar: React.FC<AlchemistAvatarProps> = ({
  speaking = false,
  size = 'md',
  className = '',
}) => {
  const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
    sm: 80,
    md: 120,
    lg: 170,
  };

  return (
    <div className={className}>
      <BreathingOrb size={sizeMap[size]} breathingSpeed={4000} isAudioPlaying={speaking} />
    </div>
  );
};
