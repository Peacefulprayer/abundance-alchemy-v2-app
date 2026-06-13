// src/components/Layout.tsx
import React, { useMemo } from 'react';
import { AppMode, PracticeType, ThemeMode } from '../types';
import { useBackgrounds } from '../services/useBackgrounds';
import type { BackgroundSlot } from '../services/apiService';
import { useLoadedBackgroundImage } from '../hooks/useLoadedBackgroundImage';
import { resolveBackground } from '../services/backgrounds';

interface LayoutProps {
  mode: AppMode;
  practiceType?: PracticeType;
  theme: ThemeMode;
  children: React.ReactNode;
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
  const isImmersivePracticeMode = mode === AppMode.PRACTICE;

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

  const globalBackground = useMemo(
    () => resolveBackground(globalSlotCandidates, backgrounds),
    [backgrounds, globalSlotCandidates]
  );
  const stageBackground = useMemo(
    () => resolveBackground(stageSlotCandidates, backgrounds),
    [backgrounds, stageSlotCandidates]
  );

  const globalBgImageUrl = forceBlackBackdrop
    ? ''
    : (globalBackground.mode === 'image' ? globalBackground.imageUrl : '');
  const globalBgColor = !forceBlackBackdrop && globalBackground.mode === 'color'
    ? globalBackground.colorValue
    : undefined;
  const stageBgImageUrl = stageBackground.mode === 'image' ? stageBackground.imageUrl : '';
  const stageBgColor = stageBackground.mode === 'color' ? stageBackground.colorValue : undefined;
  const hasStageOverride = stageBackground.mode !== 'inherit';
  const loadedGlobalBgImageUrl = useLoadedBackgroundImage(globalBgImageUrl || undefined);
  const loadedStageBgImageUrl = useLoadedBackgroundImage(stageBgImageUrl || undefined);
  const isGlobalImageLoading = !forceBlackBackdrop && !!globalBgImageUrl && !loadedGlobalBgImageUrl;
  const isStageImageLoading = !!stageBgImageUrl && !loadedStageBgImageUrl;

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
        <div className="absolute inset-0 bg-black" />
        {!forceBlackBackdrop && !globalBgImageUrl && !globalBgColor ? (
          <div className={`absolute inset-0 ${baseBg}`} />
        ) : null}
        {!forceBlackBackdrop && globalBgColor ? (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: globalBgColor }}
          />
        ) : null}
        {!forceBlackBackdrop && loadedGlobalBgImageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${loadedGlobalBgImageUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ) : null}

        {!forceBlackBackdrop && !isGlobalImageLoading ? (
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
          'relative z-10 min-h-screen',
          // Practice screens can fill the full mobile viewport; other screens keep the app frame.
          isImmersivePracticeMode
            ? 'w-screen max-w-none md:mx-auto md:w-full md:max-w-[560px]'
            : 'mx-auto w-full max-w-[430px] md:max-w-[560px]',
          // Floating device feel on desktop
          isImmersivePracticeMode ? 'shadow-none md:shadow-2xl md:shadow-black/40' : 'shadow-2xl shadow-black/40',
          isBottomNavMode ? 'pb-24' : 'pb-0',
          // Core app screens render their assigned background inside this stage.
          useGlobalBackgroundLayer
            ? ''
            : 'overflow-hidden md:my-4 md:min-h-[calc(100vh-2rem)] md:rounded-[28px] md:border md:border-white/10'
        ].join(' ')}
      >
        {/* Stage-only background for core screens (prevents duplicate full-page image) */}
        {!useGlobalBackgroundLayer && hasStageOverride ? (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-black" />
            {stageBgColor ? (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: stageBgColor }}
              />
            ) : null}
            {loadedStageBgImageUrl ? (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("${loadedStageBgImageUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: 0.9
                }}
              />
            ) : null}

            {!isStageImageLoading ? (
              <>
                <div
                  className={`absolute inset-0 ${
                    loadedStageBgImageUrl
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
              </>
            ) : null}
          </div>
        ) : null}

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
