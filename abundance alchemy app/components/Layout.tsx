// src/components/Layout.tsx
import React, { useMemo } from 'react';
import { AppMode, PracticeType, ThemeMode } from '../types';
import { useBackgrounds } from '../services/useBackgrounds';
import type { BackgroundSlot } from '../services/apiService';

interface LayoutProps {
  mode: AppMode;
  practiceType?: PracticeType;
  theme: ThemeMode;
  children: React.ReactNode;
}

function normalizeImageUrl(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return;

  // Already full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Root-relative paths from your API (e.g. "/abundance-alchemy/assets/images/...")
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Fallback: treat as relative under Vite base (if ever used)
  const base = (import.meta as any).env?.BASE_URL || '/';
  return `${base}${trimmed.replace(/^\/+/, '')}`;
}

export const Layout: React.FC<LayoutProps> = ({ mode, practiceType, theme, children }) => {
  const { backgrounds } = useBackgrounds();

  const isBottomNavMode =
    mode === AppMode.DASHBOARD ||
    mode === AppMode.LIBRARY ||
    mode === AppMode.PROFILE ||
    mode === AppMode.STATS;

  const slot: BackgroundSlot | null = useMemo(() => {
    // Map app modes to backend slots WITHOUT introducing new enums/types.
    switch (mode) {
      case AppMode.SPLASH:
        return 'SPLASH';
      case AppMode.AUTH:
        return 'AUTH';
      case AppMode.ONBOARDING:
        return 'WELCOME';
      case AppMode.DASHBOARD:
        return 'HOME';
      case AppMode.LIBRARY:
        return 'HOME';
      case AppMode.SETTINGS:
        return 'SETTINGS';
      case AppMode.PROFILE:
      case AppMode.STATS:
        return 'PROGRESS';
      case AppMode.MEDITATION_SETUP:
        return 'MEDITATION_SETUP';
      case AppMode.PRACTICE: {
        // Use practiceType when available
        if (practiceType === PracticeType.MEDITATION) return 'MEDITATION_PRACTICE';
        if (practiceType === PracticeType.MORNING_IAM) return 'IAM_PRACTICE';
        if (practiceType === PracticeType.EVENING_ILOVE) return 'ILOVE_PRACTICE';
        return 'HOME';
      }
      default:
        return 'HOME';
    }
  }, [mode, practiceType]);

  const bgEntry = slot ? backgrounds?.[slot] : undefined;
  const bgImageUrl = bgEntry?.imageUrl ? normalizeImageUrl(bgEntry.imageUrl) : '';

  const baseBg =
    theme === 'light'
      ? 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900'
      : 'bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100';

  return (
    <div className={`min-h-screen w-full ${baseBg}`}>
      {/* Background image layer */}
      <div className="fixed inset-0 -z-10">
        {bgImageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${bgImageUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ) : null}

        {/* Readability overlay (keeps “glass” looking like glass) */}
        <div
          className={`absolute inset-0 ${
            theme === 'light'
              ? 'bg-white/60'
              : 'bg-gradient-to-b from-black/55 via-black/45 to-black/65'
          }`}
        />

        {/* Subtle ethereal texture */}
        <div
          className={`absolute inset-0 ${
            theme === 'light'
              ? 'bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_55%)]'
              : 'bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_55%)]'
          }`}
        />
      </div>

      {/* App viewport */}
      <div
        className={[
          'relative mx-auto min-h-screen w-full',
          // Tight mobile-first container per your spec (375–420)
          'max-w-[420px]',
          // Floating device feel on desktop
          'shadow-2xl shadow-black/40',
          isBottomNavMode ? 'pb-24' : 'pb-0'
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
};
