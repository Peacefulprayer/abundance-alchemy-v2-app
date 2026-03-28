import React, { useEffect, useState } from 'react';
import { HandHeart, ArrowRight } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import { api } from '../services/api';
import { getPrayerPathById, PRAYER_GUIDE_STEPS } from './prayerContent';
import type { PrayerPathId } from './prayerContent';
import type { PrayerProfile } from '../types';
import {
  INNER_PAGE_SHELL,
  INNER_PRIMARY_BUTTON,
  INNER_TITLE_PILL,
  innerBackButton,
  innerHeroCard,
  innerSectionFrame,
  innerSectionKicker,
  innerSecondaryButton,
  innerSurfaceCard,
} from '../styles/sacredInnerScreen';

interface PrayerGuideProps {
  prayerPathId: PrayerPathId | null;
  prayerProfile: PrayerProfile;
  onBack: () => void;
  onStartPrayer: () => void;
  onChangePath: () => void;
  theme: 'light' | 'dark';
}

export const PrayerGuide: React.FC<PrayerGuideProps> = ({
  prayerPathId,
  prayerProfile,
  onBack,
  onStartPrayer,
  onChangePath,
  theme,
}) => {
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const pageShell = INNER_PAGE_SHELL;
  const sectionFrame = innerSectionFrame(theme);
  const heroCard = innerHeroCard(theme);
  const surfaceCard = innerSurfaceCard(theme);
  const sectionKicker = innerSectionKicker(theme);
  const backButton = innerBackButton(theme);
  const secondaryButton = innerSecondaryButton(theme);
  const prayerGuideSectionWrap = theme === 'light' ? 'space-y-3' : sectionFrame;
  const prayerGuideSectionCard =
    theme === 'light'
      ? 'rounded-[24px] border border-amber-200/70 bg-slate-100 p-4 shadow-sm'
      : surfaceCard;
  const formatToken = (value: string) =>
    value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const [steps, setSteps] = useState<string[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!prayerPathId) {
      setSteps([]);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingSteps(true);
    setSteps(PRAYER_GUIDE_STEPS[prayerPathId] || []);

    void api
      .getPrayerContent(prayerPathId)
      .then((content) => {
        if (!isMounted) return;
        if (Array.isArray(content?.guideSteps) && content.guideSteps.length > 0) {
          setSteps(content.guideSteps);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSteps(PRAYER_GUIDE_STEPS[prayerPathId] || []);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSteps(false);
      });

    return () => {
      isMounted = false;
    };
  }, [prayerPathId]);

  if (!prayerPathId) {
    return (
      <div className={`h-full flex flex-col p-6 max-w-md mx-auto items-center justify-center text-center ${textColor}`}>
        <p className="mb-4 text-sm">No prayer path selected yet.</p>
        <button
          onClick={onChangePath}
          className={INNER_PRIMARY_BUTTON}
        >
          Select Prayer Path
        </button>
      </div>
    );
  }

  const path = getPrayerPathById(prayerPathId);

  return (
    <div className={`h-full w-full overflow-y-auto px-4 pt-4 pb-8 custom-scrollbar ${textColor}`}>
      <div className={pageShell}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              buttonSoundService.play('back');
              onBack();
            }}
            className={backButton}
          >
            <span>←</span>
            <span className="font-semibold tracking-wide uppercase">Back</span>
          </button>
          <span className={INNER_TITLE_PILL}>Prayer Guide</span>
        </div>

        <div className={sectionFrame}>
          <div className={heroCard}>
            <p className={sectionKicker}>Prayer Orientation</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/35 bg-amber-500/12">
                <HandHeart size={18} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-semibold">{path?.label || 'Prayer'} Instructions</h1>
                <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400">
                  {path?.swahili || ''}
                </p>
              </div>
            </div>
            <p className={`mt-4 text-sm leading-relaxed ${subTextColor}`}>
              {path?.description || 'Prepare your heart and intention.'}
            </p>
          </div>
        </div>

        <div className={prayerGuideSectionWrap}>
          <div className="px-1">
            <h2 className={INNER_TITLE_PILL}>Prayer Profile</h2>
          </div>
          <div className={`mt-3 space-y-4 ${prayerGuideSectionCard}`}>
            <p className={sectionKicker}>Current Settings</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Intention', formatToken(prayerProfile.intent)],
                ['Tone', formatToken(prayerProfile.tone)],
                ['Language', formatToken(prayerProfile.language)],
                ['Style', formatToken(prayerProfile.style)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={`rounded-[18px] border px-3 py-3 text-xs ${
                    theme === 'light'
                      ? 'border-amber-200/60 bg-white/90 text-slate-700'
                      : 'border-amber-500/18 bg-slate-900/75 text-slate-200'
                  }`}
                >
                  <div className="font-extrabold uppercase tracking-[0.18em] text-amber-400">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-inherit">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={prayerGuideSectionWrap}>
          <div className="px-1">
            <h2 className={INNER_TITLE_PILL}>Guide Steps</h2>
          </div>
          <div className={`mt-3 space-y-3 ${prayerGuideSectionCard}`}>
            <p className={sectionKicker}>How to Pray in This Flow</p>
            {isLoadingSteps ? (
              <p className={`text-sm ${subTextColor}`}>Loading prayer guidance...</p>
            ) : null}
            {steps.map((step, index) => (
              <div
                key={`${prayerPathId}-${index}`}
                className={`flex gap-3 rounded-[18px] border px-4 py-4 ${
                  theme === 'light'
                    ? 'border-amber-200/60 bg-white/88'
                    : 'border-amber-500/18 bg-slate-900/75'
                }`}
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-xs font-extrabold text-amber-300">
                  {index + 1}
                </span>
                <p className={`text-sm leading-relaxed ${subTextColor}`}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={prayerGuideSectionWrap}>
          <div className={`${prayerGuideSectionCard} space-y-3`}>
            <button
              onClick={() => {
                buttonSoundService.play('confirm');
                onStartPrayer();
              }}
              className={`${INNER_PRIMARY_BUTTON} flex items-center justify-center gap-2`}
            >
              Begin Prayer
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onChangePath}
              className={secondaryButton}
            >
              Change Prayer Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
