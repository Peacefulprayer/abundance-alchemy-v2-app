export type PrayerPathId = 'christian' | 'muslim' | 'traditional' | 'science_of_mind' | 'universal';

export interface PrayerPath {
  id: PrayerPathId;
  label: string;
  swahili: string;
  description: string;
}

export const PRAYER_PATHS: PrayerPath[] = [
  {
    id: 'christian',
    label: 'Christian',
    swahili: 'Kikristo',
    description: 'Christ-centered prayer language and scripture-style guidance.',
  },
  {
    id: 'muslim',
    label: 'Muslim',
    swahili: 'Kiislamu',
    description: 'Respectful guidance language aligned with Islamic prayer tone.',
  },
  {
    id: 'traditional',
    label: 'Traditional / Ancestral',
    swahili: 'Kimila',
    description: 'Grounded in heritage, gratitude, elders, and ancestral wisdom.',
  },
  {
    id: 'science_of_mind',
    label: 'Science of Mind',
    swahili: 'Akili ya Roho',
    description: 'Built around the classic five-step treatment: recognition, unification, realization, thanksgiving, and release.',
  },
  {
    id: 'universal',
    label: 'Universal / Spiritual',
    swahili: 'Kiroho',
    description: 'Non-denominational spiritual focus on peace, healing, and intention.',
  },
];

export const PRAYER_GUIDE_STEPS: Record<PrayerPathId, string[]> = {
  christian: [
    'Begin with gratitude and recognition of God’s presence.',
    'Confess what needs healing and ask for wisdom clearly.',
    'Pray blessings over your family, work, and purpose today.',
    'Close with trust, thanksgiving, and quiet reflection.',
  ],
  muslim: [
    'Set intention with humility and stillness before Allah.',
    'Open with praise, then ask for guidance and mercy.',
    'Pray for family, community, and righteous action.',
    'Close in gratitude and remain in calm remembrance.',
  ],
  traditional: [
    'Ground yourself and honor the Creator and your ancestors.',
    'Speak your gratitude and name what you seek direction in.',
    'Ask for protection, strength, and upright character.',
    'Close by committing your actions to wisdom and service.',
  ],
  science_of_mind: [
    'Recognition: Acknowledge the Presence, Power, and intelligence of the Divine.',
    'Unification: Remember that the same Divine life lives and moves through you now.',
    'Realization: Speak your desired truth as already active, whole, guided, and unfolding.',
    'Thanksgiving: Give thanks that the prayer is already answered in Spirit.',
    'Release: Let go, trust the law in motion, and rest in calm expectancy.',
  ],
  universal: [
    'Take three slow breaths and center your intention.',
    'Name what you are grateful for right now.',
    'Speak your request for clarity, peace, and guidance.',
    'Close by affirming love, responsibility, and trust.',
  ],
};

export const PRAYER_TEXTS: Record<PrayerPathId, string[]> = {
  christian: [
    'Heavenly Father, thank You for life today. Guide my words, my work, and my heart in wisdom and love. Strengthen me to walk in peace and purpose.',
    'Lord, purify my thoughts and align me with Your will. Help me forgive quickly, lead bravely, and serve faithfully in all I do.',
    'God, bless my home, my relationships, and my calling. Let Your favor rest on my steps, and let my life reflect Your goodness.',
  ],
  muslim: [
    'O Allah, I begin with gratitude for Your mercy and care. Guide me on the straight path and grant me wisdom in every decision today.',
    'O Allah, purify my heart, forgive my shortcomings, and strengthen my character. Let my actions be sincere and beneficial to others.',
    'O Allah, bless my family, protect my livelihood, and increase me in patience, gratitude, and steadfast faith.',
  ],
  traditional: [
    'Creator of life, I give thanks for breath, family, and another day. Ancestors of light, guide my path with wisdom and courage.',
    'May my words be clean, my heart be steady, and my hands be useful. Keep me aligned with truth, dignity, and service.',
    'I pray for protection over my home and strength for my purpose. Let what I build bring healing, honor, and abundance.',
  ],
  science_of_mind: [
    'There is one Life, one Presence, one boundless Intelligence expressing as all things. I recognize that this Divine life is here now.',
    'I am one with this Presence. Its wisdom guides my mind, its peace steadies my heart, and its abundance moves freely through my life.',
    'I speak the word for clarity, healing, love, and right action. What I need is already being revealed, organized, and fulfilled.',
    'I give thanks that the answer is active now, even before I can see every detail. I rest in trust and spiritual certainty.',
    'I release this word into the creative law of life, knowing it is done. And so it is.',
  ],
  universal: [
    'Source of life, thank You for this moment. Fill me with calm, clarity, and compassion as I move through this day.',
    'Guide my thoughts toward truth, my words toward kindness, and my actions toward meaningful service.',
    'I release fear, welcome wisdom, and choose love. May peace guide me, and may my work bless others.',
  ],
};

export const getPrayerPathById = (id: string): PrayerPath | null =>
  PRAYER_PATHS.find((item) => item.id === id) || null;
