// src/components/Layout.tsx
import React from 'react';
import { AppMode, PracticeType, ThemeMode } from '../types';

interface LayoutProps {
  mode: AppMode;
  practiceType?: PracticeType;
  theme: ThemeMode;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ mode, theme, children }) => {
  const bg =
    theme === 'light'
      ? 'bg-slate-50 text-slate-900'
      : 'bg-slate-950 text-slate-100';

  // Keep any special-case padding logic, but don’t reference PRE_SPLASH
  const isBottomNavMode = mode === AppMode.DASHBOARD || mode === AppMode.LIBRARY || mode === AppMode.PROFILE || mode === AppMode.STATS;

  return (
    <div className={`min-h-screen w-full ${bg}`}>
      <div className={`relative mx-auto min-h-screen w-full max-w-[520px] ${isBottomNavMode ? 'pb-24' : 'pb-0'}`}>
        {children}
      </div>
    </div>
  );
};