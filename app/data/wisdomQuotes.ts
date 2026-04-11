export interface WisdomQuote {
  text: string
  author: string
  source?: string
  category: FocusCategory
}

export type FocusCategory =
  | 'Peace'
  | 'Purpose'
  | 'Love & Relationships'
  | 'Wealth & Abundance'
  | 'Confidence & Inner Strength'
  | 'Health & Wholeness'
  | 'Self-Love & Worthiness'
  | 'GENERAL'

export const WISDOM_QUOTES: WisdomQuote[] = [
  // PEACE
  {
    text: 'Peace comes from within. Do not seek it without.',
    author: 'Buddha',
    category: 'Peace',
  },
  {
    text: 'A mind at peace, a mind centered and not focused on harming others, is stronger than any physical force in the universe.',
    author: 'Wayne W. Dyer',
    category: 'Peace',
  },
  {
    text: 'The nearer a man comes to a calm mind, the closer he is to strength.',
    author: 'The Bhagavad Gita',
    category: 'Peace',
  },
  {
    text: 'I am at peace with myself and everything that surrounds me.',
    author: 'I Am Practice',
    category: 'Peace',
  },
  {
    text: 'Resolve to live in peace.',
    author: 'Les Brown',
    category: 'Peace',
  },
  {
    text: 'Peace is the result of re-training your mind to process life as it is, rather than as you think it should be.',
    author: 'Wayne W. Dyer',
    category: 'Peace',
  },
  {
    text: 'Peace I leave with you; my peace I give to you. Let not your hearts be troubled, neither let them be afraid.',
    author: 'Jesus Christ',
    source: 'John 14:27',
    category: 'Peace',
  },
  {
    text: 'Peace comes naturally when you know you are in friendly hands.',
    author: 'The Bhagavad Gita',
    category: 'Peace',
  },
  {
    text: 'Shut down the drama in your life.',
    author: 'Les Brown',
    category: 'Peace',
  },
  {
    text: 'If you have anything in your heart that is anything other than love, you have got to get it out.',
    author: 'Wayne W. Dyer',
    category: 'Peace',
  },

  // PURPOSE
  {
    text: 'The purpose of life is growth.',
    author: 'Wallace D. Wattles',
    category: 'Purpose',
  },
  {
    text: 'Intelligence plus character — that is the goal of true education.',
    author: 'Martin Luther King Jr.',
    category: 'Purpose',
  },
  {
    text: 'The world without is a reflection of the world within.',
    author: 'Charles F. Haanel',
    category: 'Purpose',
  },
  {
    text: 'Thought concentrated on a definite purpose becomes power.',
    author: 'Charles F. Haanel',
    category: 'Purpose',
  },
  {
    text: 'I am here to serve a greater good.',
    author: 'I Am Practice',
    category: 'Purpose',
  },
  {
    text: 'The reason we are here is to make a difference.',
    author: 'Oprah Winfrey',
    category: 'Purpose',
  },
  {
    text: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",
    author: 'Martin Luther King Jr.',
    category: 'Purpose',
  },
  {
    text: 'To live is to choose a direction.',
    author: 'Neville Goddard',
    category: 'Purpose',
  },
  {
    text: 'You are never too old to set another goal or to dream a new dream.',
    author: 'C. S. Lewis',
    category: 'Purpose',
  },
  {
    text: 'I believe that every person is born with a purpose.',
    author: 'Les Brown',
    category: 'Purpose',
  },

  // LOVE & RELATIONSHIPS
  {
    text: 'Love one another, but make not a bond of love.',
    author: 'Kahlil Gibran',
    category: 'Love & Relationships',
  },
  {
    text: 'I am love, and love is who I am.',
    author: 'I Am Practice',
    category: 'Love & Relationships',
  },
  {
    text: 'Only the loving find love, and they never have to seek it.',
    author: 'Neville Goddard',
    category: 'Love & Relationships',
  },
  {
    text: 'Love is sufficient unto love.',
    author: 'Kahlil Gibran',
    category: 'Love & Relationships',
  },
  {
    text: 'The chance to love and be loved exists no matter where you are.',
    author: 'Oprah Winfrey',
    category: 'Love & Relationships',
  },
  {
    text: 'My heart is open to give and receive love freely.',
    author: 'I Am Practice',
    category: 'Love & Relationships',
  },
  {
    text: 'Love is the great miracle cure.',
    author: 'Louise Hay',
    category: 'Love & Relationships',
  },
  {
    text: 'If you love somebody, let them go.',
    author: 'Kahlil Gibran',
    category: 'Love & Relationships',
  },
  {
    text: 'Love is our birthright.',
    author: 'Neville Goddard',
    category: 'Love & Relationships',
  },
  {
    text: 'Let there be spaces in your togetherness.',
    author: 'Kahlil Gibran',
    category: 'Love & Relationships',
  },

  // WEALTH & ABUNDANCE
  {
    text: 'I am open and ready to receive abundant good.',
    author: 'I Am Practice',
    category: 'Wealth & Abundance',
  },
  {
    text: 'What the mind of man can conceive and believe, it can achieve.',
    author: 'Napoleon Hill',
    category: 'Wealth & Abundance',
  },
  {
    text: 'Whatever the mind of man can conceive and believe, it can achieve.',
    author: 'Napoleon Hill',
    category: 'Wealth & Abundance',
  },
  {
    text: 'There is an invisible supply that meets every need.',
    author: 'Wallace D. Wattles',
    category: 'Wealth & Abundance',
  },
  {
    text: 'Prosperity is not something you acquire; it is something you tune into.',
    author: 'Wayne W. Dyer',
    category: 'Wealth & Abundance',
  },
  {
    text: 'You must look within for value, but you must look without for abundance.',
    author: 'Charles F. Haanel',
    category: 'Wealth & Abundance',
  },
  {
    text: 'God is the source of my supply, and I lack nothing.',
    author: 'Reverend Ike',
    category: 'Wealth & Abundance',
  },
  {
    text: 'Abundance is not something we acquire. It is something we tune into.',
    author: 'Wayne W. Dyer',
    category: 'Wealth & Abundance',
  },
  {
    text: 'There is enough for everybody.',
    author: 'Abraham Hicks',
    category: 'Wealth & Abundance',
  },
  {
    text: 'The law of circulation guarantees that what I give returns multiplied.',
    author: 'Catherine Ponder',
    category: 'Wealth & Abundance',
  },

  // CONFIDENCE & INNER STRENGTH
  {
    text: 'I am confident, steady, and fully supported by life.',
    author: 'I Am Practice',
    category: 'Confidence & Inner Strength',
  },
  {
    text: 'Courage is an inner resolution to go forward in spite of obstacles and frightening situations.',
    author: 'Martin Luther King Jr.',
    category: 'Confidence & Inner Strength',
  },
  {
    text: 'You are your own limit; when you know your own strength, the world opens.',
    author: 'Nelson Mandela',
    category: 'Confidence & Inner Strength',
  },
  {
    text: 'I am not afraid; I am becoming who I was created to be.',
    author: 'Neville Goddard',
    category: 'Confidence & Inner Strength',
  },
  {
    text: "If you're alive, you have the power to rise again.",
    author: 'Les Brown',
    category: 'Confidence & Inner Strength',
  },
  {
    text: 'I can be changed by what happens to me, but I refuse to be reduced by it.',
    author: 'Maya Angelou',
    category: 'Confidence & Inner Strength',
  },
  {
    text: 'The power to heal, to restore, and to overcome is within you.',
    author: 'Louise Hay',
    category: 'Confidence & Inner Strength',
  },
  {
    text: 'May your choices reflect your hopes, not your fears.',
    author: 'Nelson Mandela',
    category: 'Confidence & Inner Strength',
  },
  {
    text: 'Confidence is born of self-knowledge and right thought.',
    author: 'Charles F. Haanel',
    category: 'Confidence & Inner Strength',
  },
  {
    text: 'Stand firm in your truth and let nothing shake your peace.',
    author: 'The Bible',
    category: 'Confidence & Inner Strength',
  },

  // HEALTH & WHOLENESS
  {
    text: 'I am whole, healthy, and healed in mind, body, and spirit.',
    author: 'I Am Practice',
    category: 'Health & Wholeness',
  },
  {
    text: 'For one who is moderate in eating and recreation, balanced in work, and regulated in sleep, can mitigate all sorrows by practicing Yog.',
    author: 'Lord Krishna',
    source: 'The Bhagavad Gita 6:17',
    category: 'Health & Wholeness',
  },
  {
    text: 'The body is the servant of the soul, and should be treated as such.',
    author: 'The Bhagavad Gita',
    category: 'Health & Wholeness',
  },
  {
    text: 'Love flows through my body, healing all disease.',
    author: 'Louise Hay',
    category: 'Health & Wholeness',
  },
  {
    text: 'We have within us a power greater than anything we shall ever contact in the outer.',
    author: 'Ernest Holmes',
    category: 'Health & Wholeness',
  },
  {
    text: "All joy and strength and good springs up from a Fountain within one's own being.",
    author: 'H. Emilie Cady',
    category: 'Health & Wholeness',
  },
  {
    text: 'The Lord is my shepherd; I shall not want.',
    author: 'King David',
    source: 'Psalm 23:1',
    category: 'Health & Wholeness',
  },
  {
    text: 'And We send down of the Quran that which is healing and mercy for the believers.',
    author: 'Allah',
    source: 'Quran 17:82',
    category: 'Health & Wholeness',
  },
  {
    text: 'Health is harmony, and harmony begins in the mind.',
    author: 'Wayne W. Dyer',
    category: 'Health & Wholeness',
  },
  {
    text: 'The right thought brings the right condition.',
    author: 'Joel S. Goldsmith',
    category: 'Health & Wholeness',
  },

  // SELF-LOVE & WORTHINESS
  {
    text: 'I am worthy of love, respect, and divine good.',
    author: 'I Am Practice',
    category: 'Self-Love & Worthiness',
  },
  {
    text: 'You alone are enough. You have nothing to prove to anybody.',
    author: 'Maya Angelou',
    category: 'Self-Love & Worthiness',
  },
  {
    text: 'I love myself for I am a beloved child of the universe, and the universe lovingly takes care of me now.',
    author: 'Louise Hay',
    category: 'Self-Love & Worthiness',
  },
  {
    text: 'And God said love your enemy, and I obeyed him and loved myself.',
    author: 'Kahlil Gibran',
    category: 'Self-Love & Worthiness',
  },
  {
    text: 'I must undertake to love myself and to respect myself as though my very life depends upon self-love and self-respect.',
    author: 'Maya Angelou',
    category: 'Self-Love & Worthiness',
  },
  {
    text: 'All is yours. Do not go seeking for that which you are. Appropriate it, claim it, assume it.',
    author: 'Neville Goddard',
    category: 'Self-Love & Worthiness',
  },
  {
    text: 'I am enough exactly as I am.',
    author: 'I Am Practice',
    category: 'Self-Love & Worthiness',
  },
  {
    text: 'The more you praise and celebrate your life, the more there is in life to celebrate.',
    author: 'Oprah Winfrey',
    category: 'Self-Love & Worthiness',
  },
  {
    text: 'Love yourself and you can heal your life.',
    author: 'Louise Hay',
    category: 'Self-Love & Worthiness',
  },
  {
    text: "You've been criticizing yourself for years, and it hasn't worked. Try approving of yourself and see what happens.",
    author: 'Louise Hay',
    category: 'Self-Love & Worthiness',
  },
]

export function getQuotesByCategory(category: FocusCategory): WisdomQuote[] {
  if (category === 'GENERAL') {
    return WISDOM_QUOTES
  }
  return WISDOM_QUOTES.filter((q) => q.category === category)
}

export function getRandomQuote(category: FocusCategory): WisdomQuote {
  const quotes = getQuotesByCategory(category)
  return quotes[Math.floor(Math.random() * quotes.length)]
}
