// components/providers/TempleSpace.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { BackgroundConfig, BackgroundSlot } from '../../services/apiService';
import { useBackgrounds } from '../../services/useBackgrounds';

interface TempleSpaceProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  backgroundType: string;
  fallbackBackgroundType?: string;
}

type TempleSlotKey = BackgroundSlot | 'DEFAULT';

const backgroundSlots = new Set<BackgroundSlot>([
  'SECTION_ENTRY',
  'SECTION_CORE',
  'SECTION_AFFIRM_IAM',
  'SECTION_AFFIRM_ILOVE',
  'SECTION_MEDITATION',
  'SECTION_PRAYER',
  'PRE_SPLASH',
  'SPLASH',
  'SPLASH_WELCOME',
  'WELCOME',
  'NAMING_CEREMONY',
  'AUTH',
  'RETURN_PORTAL',
  'ONBOARDING',
  'TUTORIAL',
  'DASHBOARD',
  'LIBRARY',
  'IAM_SETUP',
  'IAM_PRACTICE',
  'ILOVE_SETUP',
  'ILOVE_PRACTICE',
  'MEDITATION_SETUP',
  'MEDITATION_PRACTICE',
  'PRAYER_SETUP',
  'PRAYER_GUIDE',
  'PRAYER_SESSION',
  'SETTINGS',
  'PROFILE',
  'STATS',
  'PROGRESS',
  'HOME',
]);

function isBackgroundSlot(input: string): input is BackgroundSlot {
  return backgroundSlots.has(input as BackgroundSlot);
}

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

function firstAvailableBackground(
  backgrounds: BackgroundConfig,
  candidates: BackgroundSlot[]
): string | undefined {
  for (const candidate of candidates) {
    const imageUrl = backgrounds[candidate]?.imageUrl;
    if (imageUrl) return imageUrl;
  }

  return undefined;
}

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

  // Resolve URLs from the backgrounds map
  const targetUrl = useMemo(() => {
    if (!backgrounds) return undefined;

    // Best-effort resolution for "DEFAULT"
    if (targetSlot === 'DEFAULT') {
      return firstAvailableBackground(backgrounds, defaultTargetCandidates);
    }

    return backgrounds[targetSlot]?.imageUrl;
  }, [backgrounds, targetSlot]);

  const fallbackUrl = useMemo(() => {
    if (!backgrounds || !fallbackSlot) return undefined;

    if (fallbackSlot === 'DEFAULT') {
      return firstAvailableBackground(backgrounds, defaultFallbackCandidates);
    }

    return backgrounds[fallbackSlot]?.imageUrl;
  }, [backgrounds, fallbackSlot]);

  // Active background shown immediately (fallback first if provided)
  const [activeUrl, setActiveUrl] = useState<string | undefined>(() => fallbackUrl || targetUrl);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Keep activeUrl in sync if fallback/target changes (without flashing)
  useEffect(() => {
    // If we have no activeUrl yet, choose the best immediate option
    if (!activeUrl) {
      setActiveUrl(fallbackUrl || targetUrl);
      return;
    }

    // If activeUrl equals fallbackUrl and targetUrl changes, we crossfade to target when ready
    // (handled by the preload effect below)
  }, [activeUrl, fallbackUrl, targetUrl]);

  // Option A: inherit fallback until target is decoded, then swap (crossfade)
  useEffect(() => {
    if (!targetUrl) return;

    // If we’re already showing target, nothing to do.
    if (activeUrl === targetUrl) return;

    let cancelled = false;

    const img = new Image();
    img.decoding = 'async';
    img.src = targetUrl;

    img.onload = () => {
      if (cancelled) return;
      // trigger a gentle fade transition
      setIsCrossfading(true);
      // swap background on next tick so opacity transition applies
      requestAnimationFrame(() => {
        if (cancelled) return;
        setActiveUrl(targetUrl);
        // end crossfade after transition duration
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
  }, [targetUrl, activeUrl]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: activeUrl ? `url(${activeUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'black',
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
