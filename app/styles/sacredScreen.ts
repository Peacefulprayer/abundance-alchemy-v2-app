import type { ThemeMode } from '../types'

export const SCREEN_PAGE_SHELL = 'mx-auto w-full max-w-[440px] space-y-5 pb-8'

export const SCREEN_TITLE_PILL =
  'inline-flex items-center rounded-full border border-amber-200/35 bg-slate-950/72 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(255,255,255,0.10)] ring-1 ring-white/5 backdrop-blur-xl'

export const SCREEN_STATUS_PILL =
  'inline-flex items-center rounded-full border border-amber-200/30 bg-slate-950/68 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-100 shadow-[0_0_14px_rgba(245,158,11,0.16),inset_0_1px_0_rgba(255,255,255,0.10)] ring-1 ring-white/5 backdrop-blur-xl'

export const SCREEN_PRIMARY_BUTTON =
  'w-full rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50'

export const screenSectionFrame = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[28px] bg-gradient-to-br from-amber-50/40 to-white/80 border border-amber-200/30 p-3 shadow-[0_8px_24px_rgba(180,140,80,0.12)]'
    : 'p-0'

export const screenHeroCard = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[24px] bg-gradient-to-br from-amber-50/50 to-white/90 border border-amber-200/40 p-5 shadow-[0_12px_32px_rgba(180,140,80,0.15)]'
    : 'w-full rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/88 p-4 shadow-xl'

export const screenSurfaceCard = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[22px] bg-gradient-to-br from-amber-50/30 to-white/85 border border-amber-200/30 p-4 shadow-[0_8px_24px_rgba(180,140,80,0.1)]'
    : 'w-full rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/88 p-4 shadow-xl'

export const screenGlassPanel = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[24px] bg-gradient-to-br from-amber-50/25 to-white/80 border border-amber-200/25 p-4 shadow-[0_8px_24px_rgba(180,140,80,0.1)]'
    : 'w-full rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/88 p-4 shadow-xl'

export const screenItemCard = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[20px] border border-amber-200/55 bg-white/82 p-3 shadow-sm backdrop-blur-xl'
    : 'rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/88 p-3 shadow-xl'

export const screenInputBg = (theme: ThemeMode) =>
  theme === 'light'
    ? 'border-amber-200/50 bg-white/90 text-slate-800 placeholder-slate-400'
    : 'border-white/10 bg-slate-900/70 text-white placeholder-slate-500'

export const screenBackButton = (theme: ThemeMode) =>
  `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors ${
    theme === 'light'
      ? 'border-amber-200/50 bg-white/85 text-slate-700 hover:bg-amber-50/50'
      : 'border-white/10 bg-slate-900/60 text-white hover:bg-slate-800/60'
  }`

export const screenSecondaryButton = (theme: ThemeMode) =>
  `w-full rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
    theme === 'light'
      ? 'border-amber-200/50 bg-white/85 text-slate-800 hover:bg-amber-50/50'
      : 'border-white/10 bg-slate-900/60 text-white hover:bg-slate-800/60'
  }`

export const screenActionRow = (theme: ThemeMode) =>
  theme === 'light'
    ? 'border border-amber-200/60 bg-white/82 text-slate-900 hover:bg-white'
    : 'border border-amber-500/20 bg-slate-950/70 text-white hover:bg-slate-900/80'

export const screenSectionKicker = (theme: ThemeMode) =>
  theme === 'light'
    ? 'text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-700'
    : 'text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-200/95'

export const screenTextColor = (theme: ThemeMode) =>
  theme === 'light' ? 'text-slate-700' : 'text-white'

export const screenHeadingColor = (theme: ThemeMode) =>
  theme === 'light' ? 'text-slate-950' : 'text-white'

export const screenSubTextColor = (theme: ThemeMode) =>
  theme === 'light' ? 'text-slate-600' : 'text-slate-200/90'

export const screenAccentText = (theme: ThemeMode) =>
  theme === 'light' ? 'text-amber-800' : 'text-amber-100'
