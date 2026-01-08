// components/SacredBackground.tsx
import React from 'react';
import { TempleSpace } from './providers/TempleSpace';

interface SacredBackgroundProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  backgroundType?: 'splash' | 'welcome' | 'default';
}

export const SacredBackground: React.FC<SacredBackgroundProps> = ({
  children,
  theme = 'dark',
  backgroundType = 'default',
}) => {
  return (
    <TempleSpace theme={theme} backgroundType={backgroundType}>
      {children}
    </TempleSpace>
  );
};