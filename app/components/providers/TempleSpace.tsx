// components/providers/TempleSpace.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useBackgrounds } from '../../services/useBackgrounds';

interface TempleSpaceProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  backgroundType: string;
  fallbackBackgroundType?: string;
}

function toSlotKey(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return 'HOME';

  // If caller already passed a backend slot key (e.g., "WELCOME"), use it.
  if (raw.toUpperCase() === raw && /^[A-Z0-9_]+$/.test(raw)) return raw;

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
      return (
        backgrounds['SPLASH_WELCOME']?.imageUrl ||
        backgrounds['AUTH']?.imageUrl ||
        backgrounds['HOME']?.imageUrl ||
        backgrounds['WELCOME']?.imageUrl ||
        backgrounds['SPLASH']?.imageUrl
      );
    }

    return backgrounds[targetSlot]?.imageUrl;
  }, [backgrounds, targetSlot]);

  const fallbackUrl = useMemo(() => {
    if (!backgrounds || !fallbackSlot) return undefined;

    if (fallbackSlot === 'DEFAULT') {
      return (
        backgrounds['SPLASH']?.imageUrl ||
        backgrounds['SPLASH_WELCOME']?.imageUrl ||
        backgrounds['WELCOME']?.imageUrl ||
        backgrounds['AUTH']?.imageUrl ||
        backgrounds['HOME']?.imageUrl
      );
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
    <div
      className={`relative min-h-screen w-full overflow-hidden ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      {/* Background layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: activeUrl ? `url(${activeUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
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
