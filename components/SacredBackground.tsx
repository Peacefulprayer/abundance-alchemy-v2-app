import React from 'react';
import { TempleSpace } from './providers/TempleSpace'; // FIXED PATH

interface SacredBackgroundProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export const SacredBackground: React.FC<SacredBackgroundProps> = ({
  children,
  theme = 'dark',
}) => {
  return (
    <TempleSpace theme={theme}>
      {children}
    </TempleSpace>
  );
};
