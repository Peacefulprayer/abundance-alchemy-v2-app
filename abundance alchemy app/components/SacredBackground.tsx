// components/SacredBackground.tsx
import React from 'react';
import { TempleSpace } from './providers/TempleSpace';

interface SacredBackgroundProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  /**
   * Accepts friendly names like "splash", "welcome", "default"
   * OR direct backend slot keys like "SPLASH", "WELCOME", "AUTH", "HOME", etc.
   */
  backgroundType?: string;
  /**
   * Optional fallback background used until the target image is decoded/ready.
   * Ideal for Welcome inheriting Splash.
   */
  fallbackBackgroundType?: string;
}

export const SacredBackground: React.FC<SacredBackgroundProps> = ({
  children,
  theme = 'dark',
  backgroundType = 'default',
  fallbackBackgroundType,
}) => {
  return (
    <TempleSpace
      theme={theme}
      backgroundType={backgroundType}
      fallbackBackgroundType={fallbackBackgroundType}
    >
      {children}
    </TempleSpace>
  );
};
