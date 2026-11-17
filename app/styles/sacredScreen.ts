import type { ThemeMode } from '../types'
import { SACRED_CARD_MATERIAL } from './sacredCards'

export const SCREEN_PAGE_SHELL = 'mx-auto w-full max-w-[300px] space-y-3 pb-8 md:max-w-[380px]'

export const SCREEN_TITLE_PILL =
  'inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500'

export const SCREEN_STATUS_PILL =
  'inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-500'

export const SCREEN_PRIMARY_BUTTON =
  'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 shadow-lg disabled:cursor-not-allowed disabled:opacity-50'

export const screenSectionFrame = (_theme: ThemeMode) => 'mt-5'

export const screenHeroCard = (_theme: ThemeMode) =>
  `${SACRED_CARD_MATERIAL} w-full p-5 text-slate-100`

export const screenSurfaceCard = (_theme: ThemeMode) =>
  'rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm w-full p-4 text-slate-100'

export const screenGlassPanel = (_theme: ThemeMode) =>
  'rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm w-full p-4 text-slate-100'

export const screenItemCard = (_theme: ThemeMode) =>
  'rounded-2xl border bg-black/25 border-amber-500/10 shadow-[0_6px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm w-full p-3 text-slate-100'

export const screenInputBg = (_theme: ThemeMode) =>
  'border-amber-500/20 bg-black/40 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none'

export const screenBackButton = (_theme: ThemeMode) =>
  'inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300 transition-colors hover:bg-amber-500/10'

export const screenSecondaryButton = (_theme: ThemeMode) =>
  'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border border-amber-500/30 bg-black/30 text-amber-300 hover:bg-amber-500/10'

export const screenActionRow = (_theme: ThemeMode) =>
  'border border-amber-500/20 bg-black/30 text-slate-100 hover:bg-amber-500/10'

export const screenSectionKicker = (_theme: ThemeMode) =>
  'text-[12px] font-bold uppercase tracking-widest text-amber-400 text-center'

export const screenTextColor = (_theme: ThemeMode) => 'text-slate-100'

export const screenHeadingColor = (_theme: ThemeMode) => 'text-slate-100'

export const screenSubTextColor = (_theme: ThemeMode) => 'text-slate-300'

export const screenAccentText = (_theme: ThemeMode) => 'text-amber-400'
