import type { ThemeMode } from '../types'

export const INNER_PAGE_SHELL = 'mx-auto w-full max-w-[440px] space-y-5 pb-8'

export const INNER_TITLE_PILL =
  'inline-flex items-center rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)] backdrop-blur-sm'

export const innerSectionFrame = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[28px] bg-gradient-to-br from-amber-50/40 to-white/80 border border-amber-200/30 p-3 shadow-[0_8px_24px_rgba(180,140,80,0.12)]'
    : 'rounded-[28px] bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-white/10 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)]'

export const innerHeroCard = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[24px] bg-gradient-to-br from-amber-50/50 to-white/90 border border-amber-200/40 p-5 shadow-[0_12px_32px_rgba(180,140,80,0.15)]'
    : 'rounded-[24px] bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-amber-500/20 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.4)]'

export const innerSurfaceCard = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[22px] bg-gradient-to-br from-amber-50/30 to-white/85 border border-amber-200/30 p-4 shadow-[0_8px_24px_rgba(180,140,80,0.1)]'
    : 'rounded-[22px] bg-gradient-to-br from-slate-900/85 to-slate-950/92 border border-white/10 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]'

export const innerGlassPanel = (theme: ThemeMode) =>
  theme === 'light'
    ? 'rounded-[24px] bg-gradient-to-br from-amber-50/25 to-white/80 border border-amber-200/25 p-4 shadow-[0_8px_24px_rgba(180,140,80,0.1)]'
    : 'rounded-[24px] bg-gradient-to-br from-slate-900/85 to-slate-950/92 border border-white/10 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]'

export const innerInputBg = (theme: ThemeMode) =>
  theme === 'light'
    ? 'border-amber-200/50 bg-white/90 text-slate-800'
    : 'border-white/10 bg-slate-900/70 text-white'

export const innerBackButton = (theme: ThemeMode) =>
  `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors ${
    theme === 'light'
      ? 'border-amber-200/50 bg-white/85 text-slate-700 hover:bg-amber-50/50'
      : 'border-white/10 bg-slate-900/60 text-white hover:bg-slate-800/60'
  }`

export const innerSecondaryButton = (theme: ThemeMode) =>
  `w-full rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
    theme === 'light'
      ? 'border-amber-200/50 bg-white/85 text-slate-800 hover:bg-amber-50/50'
      : 'border-white/10 bg-slate-900/60 text-white hover:bg-slate-800/60'
  }`

export const INNER_PRIMARY_BUTTON =
  'w-full rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-300/95 to-orange-300/92 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.22)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50'

export const innerSectionKicker = (theme: ThemeMode) =>
  theme === 'light'
    ? 'text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-700'
    : 'text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-400/90'

export const innerTextColor = (theme: ThemeMode) =>
  theme === 'light' ? 'text-slate-700' : 'text-white'

export const innerSubTextColor = (theme: ThemeMode) =>
  theme === 'light' ? 'text-slate-600' : 'text-slate-300'
