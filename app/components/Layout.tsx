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

function firstAvailableSlot(
  candidates: BackgroundSlot[],
  backgrounds?: Record<string, { imageUrl?: string } | undefined> | null
): BackgroundSlot | null {
  for (const candidate of candidates) {
    const imageUrl = backgrounds?.[candidate]?.imageUrl;
    if (imageUrl) return candidate;
  }
  return candidates[0] || null;
}

export const Layout: React.FC<LayoutProps> = ({ mode, practiceType, theme, children }) => {
  const { backgrounds } = useBackgrounds();
  const isPreSplashMode = mode === AppMode.PRE_SPLASH;
  const isSplashMode = mode === AppMode.SPLASH;
  const forceBlackBackdrop = isPreSplashMode || isSplashMode;
  const isEntryFlowMode =
    mode === AppMode.PRE_SPLASH ||
    mode === AppMode.SPLASH ||
    mode === AppMode.WELCOME ||
    mode === AppMode.NAMING_CEREMONY ||
    mode === AppMode.AUTH ||
    mode === AppMode.RETURN_PORTAL ||
    mode === AppMode.ONBOARDING ||
    mode === AppMode.TUTORIAL;
  const useGlobalBackgroundLayer = isEntryFlowMode;

  const isBottomNavMode =
    mode === AppMode.DASHBOARD ||
    mode === AppMode.LIBRARY ||
    mode === AppMode.PROFILE ||
    mode === AppMode.STATS ||
    mode === AppMode.SETTINGS;

  const screenSlotCandidates: BackgroundSlot[] = useMemo(() => {
    switch (mode) {
      case AppMode.PRE_SPLASH:
        return ['PRE_SPLASH', 'SPLASH'];
      case AppMode.SPLASH:
        return ['SPLASH', 'SPLASH_WELCOME'];
      case AppMode.WELCOME:
        return ['WELCOME', 'SPLASH_WELCOME'];
      case AppMode.NAMING_CEREMONY:
        return ['NAMING_CEREMONY', 'WELCOME'];
      case AppMode.AUTH:
        return ['AUTH', 'WELCOME'];
      case AppMode.RETURN_PORTAL:
        return ['RETURN_PORTAL', 'PROGRESS'];
      case AppMode.ONBOARDING:
        return ['ONBOARDING', 'WELCOME'];
      case AppMode.TUTORIAL:
        return ['TUTORIAL', 'WELCOME'];
      case AppMode.DASHBOARD:
        return ['DASHBOARD'];
      case AppMode.LIBRARY:
        return ['LIBRARY'];
      case AppMode.SETTINGS:
        return ['SETTINGS'];
      case AppMode.PROFILE:
        return ['PROFILE', 'PROGRESS'];
      case AppMode.STATS:
        return ['STATS', 'PROGRESS'];
      case AppMode.MEDITATION_SETUP:
        return ['MEDITATION_SETUP'];
      case AppMode.PRAYER_SETUP:
        return ['PRAYER_SETUP'];
      case AppMode.PRAYER_GUIDE:
        return ['PRAYER_GUIDE', 'PRAYER_SETUP'];
      case AppMode.PRAYER_SESSION:
        return ['PRAYER_SESSION', 'PRAYER_GUIDE'];
      case AppMode.PRACTICE: {
        if (practiceType === PracticeType.MEDITATION) return ['MEDITATION_PRACTICE'];
        if (practiceType === PracticeType.MORNING_IAM) return ['IAM_PRACTICE'];
        if (practiceType === PracticeType.EVENING_ILOVE) return ['ILOVE_PRACTICE'];
        return [];
      }
      default:
        return [];
    }
  }, [mode, practiceType]);

  const sectionSlot: BackgroundSlot = useMemo(() => {
    switch (mode) {
      case AppMode.PRE_SPLASH:
      case AppMode.SPLASH:
      case AppMode.WELCOME:
      case AppMode.NAMING_CEREMONY:
      case AppMode.AUTH:
      case AppMode.RETURN_PORTAL:
      case AppMode.ONBOARDING:
      case AppMode.TUTORIAL:
        return 'SECTION_ENTRY';
      case AppMode.MEDITATION_SETUP:
        return 'SECTION_MEDITATION';
      case AppMode.PRAYER_SETUP:
      case AppMode.PRAYER_GUIDE:
      case AppMode.PRAYER_SESSION:
        return 'SECTION_PRAYER';
      case AppMode.PRACTICE:
        if (practiceType === PracticeType.MEDITATION) return 'SECTION_MEDITATION';
        if (practiceType === PracticeType.MORNING_IAM) return 'SECTION_AFFIRM_IAM';
        if (practiceType === PracticeType.EVENING_ILOVE) return 'SECTION_AFFIRM_ILOVE';
        return 'SECTION_CORE';
      default:
        return 'SECTION_CORE';
    }
  }, [mode, practiceType]);

  const globalSlotCandidates: BackgroundSlot[] = useMemo(() => {
    const candidates = useGlobalBackgroundLayer
      ? [...screenSlotCandidates, sectionSlot, 'HOME']
      : [sectionSlot, 'HOME'];
    return candidates.filter(
      (slot, index) => candidates.indexOf(slot) === index
    ) as BackgroundSlot[];
  }, [screenSlotCandidates, sectionSlot, useGlobalBackgroundLayer]);

  const stageSlotCandidates: BackgroundSlot[] = useMemo(() => {
    if (useGlobalBackgroundLayer) return [];
    return screenSlotCandidates.filter(
      (slot, index) => screenSlotCandidates.indexOf(slot) === index
    ) as BackgroundSlot[];
  }, [screenSlotCandidates, useGlobalBackgroundLayer]);

  const globalSlot = useMemo(
    () => firstAvailableSlot(globalSlotCandidates, backgrounds),
    [backgrounds, globalSlotCandidates]
  );
  const stageSlot = useMemo(
    () => firstAvailableSlot(stageSlotCandidates, backgrounds),
    [backgrounds, stageSlotCandidates]
  );

  const globalBgEntry = globalSlot ? backgrounds?.[globalSlot] : undefined;
  const stageBgEntry = stageSlot ? backgrounds?.[stageSlot] : undefined;

  const globalBgImageUrl = forceBlackBackdrop
    ? ''
    : (globalBgEntry?.imageUrl ? normalizeImageUrl(globalBgEntry.imageUrl) : '');
  const stageBgImageUrl = stageBgEntry?.imageUrl
    ? normalizeImageUrl(stageBgEntry.imageUrl)
    : '';

  const baseBg = forceBlackBackdrop
    ? 'bg-black'
    : (
      theme === 'light'
        ? 'bg-gradient-to-br from-slate-50 to-slate-100'
        : 'bg-gradient-to-br from-slate-900 via-slate-950 to-black'
    );
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden ${textColor}`}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        {forceBlackBackdrop ? <div className="absolute inset-0 bg-black" /> : null}
        {!forceBlackBackdrop && !globalBgImageUrl ? (
          <div className={`absolute inset-0 ${baseBg}`} />
        ) : null}
        {!forceBlackBackdrop && globalBgImageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${globalBgImageUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ) : null}

        {!forceBlackBackdrop ? (
          <>
            <div
              className={`absolute inset-0 ${
                useGlobalBackgroundLayer
                  ? (
                    theme === 'light'
                      ? 'bg-white/60'
                      : 'bg-gradient-to-b from-black/55 via-black/45 to-black/65'
                  )
                  : (
                    theme === 'light'
                      ? 'bg-white/28'
                      : 'bg-gradient-to-b from-black/18 via-black/12 to-black/26'
                  )
              }`}
            />

            <div
              className={`absolute inset-0 ${
                theme === 'light'
                  ? 'bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_55%)]'
                  : 'bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_55%)]'
              }`}
            />
          </>
        ) : null}
      </div>

      {/* App viewport */}
      <div
        className={[
          'relative z-10 mx-auto min-h-screen w-full',
          // Responsive container: tighter on mobile, roomier on desktop
          'max-w-[430px] md:max-w-[560px]',
          // Floating device feel on desktop
          'shadow-2xl shadow-black/40',
          isBottomNavMode ? 'pb-24' : 'pb-0',
          // Core app screens render their assigned background inside this stage.
          useGlobalBackgroundLayer
            ? ''
            : 'overflow-hidden md:my-4 md:min-h-[calc(100vh-2rem)] md:rounded-[28px] md:border md:border-white/10'
        ].join(' ')}
      >
        {/* Stage-only background for core screens (prevents duplicate full-page image) */}
        {!useGlobalBackgroundLayer ? (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {stageBgImageUrl ? (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("${stageBgImageUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: 0.9
                }}
              />
            ) : null}

            <div
              className={`absolute inset-0 ${
                stageBgImageUrl
                  ? (
                    theme === 'light'
                      ? 'bg-white/56'
                      : 'bg-gradient-to-b from-black/48 via-black/36 to-black/58'
                  )
                  : (
                    theme === 'light'
                      ? 'bg-white/68'
                      : 'bg-gradient-to-b from-slate-950/44 via-black/32 to-black/54'
                  )
              }`}
            />
            <div
              className={`absolute inset-0 ${
                theme === 'light'
                  ? 'bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_55%)]'
                  : 'bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_55%)]'
              }`}
            />
          </div>
        ) : null}

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
