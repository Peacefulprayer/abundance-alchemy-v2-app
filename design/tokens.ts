export const containerWidth = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const clearGlassCard = `
  bg-gradient-to-br from-white/10 to-white/5 
  backdrop-blur-xl 
  rounded-3xl 
  border-2 border-white/30
  shadow-[0_8px_32px_rgba(0,0,0,0.3)]
`;

export const solidGlassCard = `
  bg-gradient-to-br from-slate-900/80 to-slate-800/60
  backdrop-blur-xl
  rounded-3xl
  border-2 border-slate-700/50
  shadow-[0_8px_32px_rgba(0,0,0,0.4)]
`;

export const themeColors = {
  dark: {
    background: 'bg-slate-950',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    accent: 'text-amber-400',
    accentBorder: 'border-amber-400/40',
  },
  light: {
    background: 'bg-amber-50',
    text: 'text-slate-800',
    textMuted: 'text-slate-600',
    accent: 'text-amber-600',
    accentBorder: 'border-amber-500/40',
  },
};