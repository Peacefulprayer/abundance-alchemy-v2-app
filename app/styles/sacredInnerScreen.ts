import type { ThemeMode } from '../types';

export const INNER_PAGE_SHELL = 'mx-auto w-full max-w-[440px] space-y-5 pb-8';

export const INNER_TITLE_PILL =
  'inline-flex items-center rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)] backdrop-blur-sm';

export const innerSectionFrame = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[28px] border border-amber-200/60 bg-white/78 p-3 shadow-sm'
    : 'rounded-[28px] border border-amber-500/18 bg-slate-950/45 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)]';

export const innerHeroCard = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[24px] border border-amber-200/60 bg-gradient-to-br from-white/95 to-amber-50/70 p-5 shadow-lg'
    : 'rounded-[24px] border border-amber-500/20 bg-gradient-to-br from-slate-900/70 to-slate-950/75 p-5 shadow-lg';

export const innerSurfaceCard = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[22px] border border-white/72 bg-gradient-to-br from-white/94 to-amber-50/78 p-4 shadow-[0_16px_34px_rgba(148,163,184,0.16)] backdrop-blur-xl'
    : 'rounded-[22px] border border-white/10 bg-gradient-to-br from-white/8 to-slate-950/82 p-4 shadow-[0_22px_44px_rgba(0,0,0,0.3)] backdrop-blur-xl';

export const innerGlassPanel = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[24px] border border-white/70 bg-white/68 p-4 shadow-[0_14px_28px_rgba(148,163,184,0.16)] backdrop-blur-xl'
    : 'rounded-[24px] border border-white/10 bg-white/6 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.28)] backdrop-blur-xl';

export const innerInputBg = (theme: ThemeMode) =>
  theme === 'light'
    ? 'border-amber-200/70 bg-white/92 text-slate-900'
    : 'border-amber-500/20 bg-slate-950/75 text-slate-100';

export const innerBackButton = (theme: ThemeMode) =>
  `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors ${
    theme === 'light'
      ? 'border-amber-200/70 bg-white/85 text-slate-700 hover:bg-white'
      : 'border-amber-500/20 bg-slate-950/70 text-slate-100 hover:bg-slate-950'
  }`;

export const innerSecondaryButton = (theme: ThemeMode) =>
  `w-full rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
    theme === 'light'
      ? 'border-amber-200/70 bg-white/90 text-slate-900 hover:bg-white'
      : 'border-amber-500/20 bg-slate-950/78 text-slate-100 hover:bg-slate-950'
  }`;

export const INNER_PRIMARY_BUTTON =
  'w-full rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50';

export const innerSectionKicker = (theme: ThemeMode) =>
  theme === 'light'
    ? 'text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-700'
    : 'text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400/90';
