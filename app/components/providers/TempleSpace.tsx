// components/providers/TempleSpace.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { BackgroundSlot } from '../../services/apiService';
import {
  isBackgroundSlot,
  resolveBackground,
  type ResolvedBackground,
} from '../../services/backgrounds';
import { useBackgrounds } from '../../services/useBackgrounds';

interface TempleSpaceProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  backgroundType: string;
  fallbackBackgroundType?: string;
}

type TempleSlotKey = BackgroundSlot | 'DEFAULT';

const defaultTargetCandidates: BackgroundSlot[] = [
  'SPLASH_WELCOME',
  'AUTH',
  'HOME',
  'WELCOME',
  'SPLASH',
];

const defaultFallbackCandidates: BackgroundSlot[] = [
  'SPLASH',
  'SPLASH_WELCOME',
  'WELCOME',
  'AUTH',
  'HOME',
];

function toSlotKey(input: string): TempleSlotKey {
  const raw = (input || '').trim();
  if (!raw) return 'HOME';

  // If caller already passed a backend slot key (e.g., "WELCOME"), use it.
  if (raw.toUpperCase() === raw && /^[A-Z0-9_]+$/.test(raw) && isBackgroundSlot(raw)) return raw;

  const key = raw.toLowerCase();

  // Friendly aliases → backend slot keys (matches your admin slot list)
  if (key === 'splash') return 'SPLASH';
  if (key === 'welcome') return 'WELCOME';
  if (key === 'auth' || key === 'login' || key === 'register') return 'AUTH';
  if (key === 'home' || key === 'dashboard') return 'HOME';
  if (key === 'settings') return 'SETTINGS';
  if (key === 'progress' || key === 'journey') return 'PROGRESS';

  // Practice screens (if you choose to use them later)
  if (key === 'iam_setup') return 'IAM_SETUP';
  if (key === 'iam_practice') return 'IAM_PRACTICE';
  if (key === 'ilove_setup') return 'ILOVE_SETUP';
  if (key === 'ilove_practice') return 'ILOVE_PRACTICE';
  if (key === 'meditation_setup') return 'MEDITATION_SETUP';
  if (key === 'meditation_practice') return 'MEDITATION_PRACTICE';
  if (key === 'prayer_setup') return 'PRAYER_SETUP';
  if (key === 'prayer_guide') return 'PRAYER_GUIDE';
  if (key === 'prayer_session') return 'PRAYER_SESSION';

  // "default" is not a backend slot; we resolve it later with best effort.
  return 'DEFAULT';
}

const concreteBackground = (
  background: ResolvedBackground,
): ResolvedBackground | undefined =>
  background.mode === 'inherit' ? undefined : background;

export const TempleSpace: React.FC<TempleSpaceProps> = ({
  children,
  theme,
  backgroundType,
  fallbackBackgroundType,
}) => {
  const { backgrounds } = useBackgrounds();

  const targetSlot = useMemo(() => toSlotKey(backgroundType), [backgroundType]);
  const fallbackSlot = useMemo(
    () => (fallbackBackgroundType ? toSlotKey(fallbackBackgroundType) : undefined),
    [fallbackBackgroundType]
  );

  const targetBackground = useMemo(() => {
    if (targetSlot === 'DEFAULT') {
      return resolveBackground(defaultTargetCandidates, backgrounds);
    }

    return resolveBackground([targetSlot], backgrounds);
  }, [backgrounds, targetSlot]);

  const fallbackBackground = useMemo(() => {
    if (!fallbackSlot) return undefined;
    if (fallbackSlot === 'DEFAULT') {
      return resolveBackground(defaultFallbackCandidates, backgrounds);
    }

    return resolveBackground([fallbackSlot], backgrounds);
  }, [backgrounds, fallbackSlot]);

  const initialBackground = useMemo(
    () => concreteBackground(fallbackBackground ?? { mode: 'inherit' }) ?? concreteBackground(targetBackground),
    [fallbackBackground, targetBackground],
  );

  const [activeBackground, setActiveBackground] = useState<ResolvedBackground | undefined>(initialBackground);
  const [isCrossfading, setIsCrossfading] = useState(false);

  useEffect(() => {
    if (!activeBackground && initialBackground) {
      setActiveBackground(initialBackground);
    }
  }, [activeBackground, initialBackground]);

  useEffect(() => {
    if (targetBackground.mode === 'inherit') return;

    if (targetBackground.mode !== 'image') {
      setActiveBackground(targetBackground);
      return;
    }

    if (!targetBackground.imageUrl) return;
    if (activeBackground?.mode === 'image' && activeBackground.imageUrl === targetBackground.imageUrl) return;

    let cancelled = false;

    const img = new Image();
    img.decoding = 'async';
    img.src = targetBackground.imageUrl;

    img.onload = () => {
      if (cancelled) return;
      setIsCrossfading(true);
      requestAnimationFrame(() => {
        if (cancelled) return;
        setActiveBackground(targetBackground);
        setTimeout(() => {
          if (!cancelled) setIsCrossfading(false);
        }, 220);
      });
    };

    // If image fails, keep fallback (best effort)
    img.onerror = () => {
      /* ignore */
    };

    return () => {
      cancelled = true;
    };
  }, [targetBackground, activeBackground]);

  const activeImageUrl = activeBackground?.mode === 'image' ? activeBackground.imageUrl : undefined;
  const activeColorValue = activeBackground?.mode === 'color' ? activeBackground.colorValue : undefined;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: activeImageUrl ? `url(${activeImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: activeColorValue ?? 'black',
          // Gentle crossfade. (We keep it subtle to feel “Apple-like”.)
          transition: 'opacity 220ms ease-out',
          opacity: 1,
        }}
      />

      {/* Optional subtle veil during crossfade to hide any decode edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transition: 'opacity 220ms ease-out',
          opacity: isCrossfading ? 0.06 : 0,
          background:
            theme === 'dark'
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.35))'
              : 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.25))',
        }}
      />

      {/* Foreground */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
