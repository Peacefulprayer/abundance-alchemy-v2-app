export type BackgroundMode = 'inherit' | 'image' | 'color' | 'none';

export type BackgroundSlot =
  | 'SECTION_ENTRY'
  | 'SECTION_CORE'
  | 'SECTION_AFFIRM_IAM'
  | 'SECTION_AFFIRM_ILOVE'
  | 'SECTION_MEDITATION'
  | 'SECTION_PRAYER'
  | 'PRE_SPLASH'
  | 'SPLASH'
  | 'SPLASH_WELCOME'
  | 'WELCOME'
  | 'NAMING_CEREMONY'
  | 'AUTH'
  | 'RETURN_PORTAL'
  | 'ONBOARDING'
  | 'TUTORIAL'
  | 'DASHBOARD'
  | 'PRACTICE_PREP'
  | 'LIBRARY'
  | 'IAM_SETUP'
  | 'IAM_PRACTICE'
  | 'ILOVE_SETUP'
  | 'ILOVE_PRACTICE'
  | 'MEDITATION_SETUP'
  | 'MEDITATION_PRACTICE'
  | 'PRAYER_SETUP'
  | 'PRAYER_GUIDE'
  | 'PRAYER_SESSION'
  | 'SETTINGS'
  | 'PROFILE'
  | 'STATS'
  | 'PROGRESS'
  | 'HOME';

export interface BackgroundEntry {
  mode: BackgroundMode;
  imageUrl?: string;
  colorValue?: string;
  creatorName?: string;
}

export type BackgroundConfig = Partial<Record<BackgroundSlot, BackgroundEntry>>;

export interface ResolvedBackground {
  mode: BackgroundMode;
  slot?: BackgroundSlot;
  imageUrl?: string;
  colorValue?: string;
  creatorName?: string;
}

const backgroundModes = new Set<BackgroundMode>(['inherit', 'image', 'color', 'none']);

export const backgroundSlots: BackgroundSlot[] = [
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
  'PRACTICE_PREP',
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
];

const backgroundSlotSet = new Set<BackgroundSlot>(backgroundSlots);

export const isBackgroundSlot = (input: string): input is BackgroundSlot =>
  backgroundSlotSet.has(input as BackgroundSlot);

export const normalizeBackgroundUrl = (url?: string): string | undefined => {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  const base = import.meta.env.BASE_URL || '/';
  return `${base}${trimmed.replace(/^\/+/, '')}`;
};

const normalizeColorValue = (value?: string): string | undefined => {
  const color = (value ?? '').trim();
  if (!color) return undefined;
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)
    ? color
    : undefined;
};

export const normalizeBackgroundEntry = (
  entry?: Partial<BackgroundEntry> | null,
): BackgroundEntry | undefined => {
  if (!entry) return undefined;

  const imageUrl = normalizeBackgroundUrl(entry.imageUrl);
  const colorValue = normalizeColorValue(entry.colorValue);
  const rawMode = typeof entry.mode === 'string' ? entry.mode.toLowerCase() : '';
  const mode = backgroundModes.has(rawMode as BackgroundMode)
    ? (rawMode as BackgroundMode)
    : imageUrl
      ? 'image'
      : 'inherit';

  if (mode === 'image') {
    return imageUrl
      ? { mode, imageUrl, creatorName: entry.creatorName?.trim() || undefined }
      : { mode: 'inherit' };
  }

  if (mode === 'color') {
    return colorValue
      ? { mode, colorValue, creatorName: entry.creatorName?.trim() || undefined }
      : { mode: 'inherit' };
  }

  if (mode === 'none') {
    return { mode };
  }

  return { mode: 'inherit' };
};

export const normalizeBackgroundConfig = (input: unknown): BackgroundConfig => {
  if (!input || typeof input !== 'object') return {};

  return Object.entries(input as Record<string, Partial<BackgroundEntry>>).reduce<BackgroundConfig>(
    (acc, [slot, entry]) => {
      if (!isBackgroundSlot(slot)) return acc;
      const normalized = normalizeBackgroundEntry(entry);
      if (normalized && normalized.mode !== 'inherit') {
        acc[slot] = normalized;
      }
      return acc;
    },
    {},
  );
};

export const resolveBackground = (
  candidates: BackgroundSlot[],
  backgrounds?: BackgroundConfig | null,
): ResolvedBackground => {
  for (const candidate of candidates) {
    const entry = normalizeBackgroundEntry(backgrounds?.[candidate]);
    if (!entry || entry.mode === 'inherit') continue;

    if (entry.mode === 'image' && entry.imageUrl) {
      return { ...entry, slot: candidate };
    }
    if (entry.mode === 'color' && entry.colorValue) {
      return { ...entry, slot: candidate };
    }
    if (entry.mode === 'none') {
      return { mode: 'none', slot: candidate };
    }
  }

  return { mode: 'inherit' };
};
