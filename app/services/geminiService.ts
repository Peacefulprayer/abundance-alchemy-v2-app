import { api } from './api';

const trimGeneratedText = (value: string): string =>
  value.trim().replace(/^["']|["']$/g, '');

export const getAlchemistWisdom = async (): Promise<string> => {
  try {
    const response = await api.generateAiCopy({ type: 'alchemist_wisdom' });
    const text = typeof response?.text === 'string' ? trimGeneratedText(response.text) : '';
    if (text) {
      return text;
    }
  } catch (error) {
    console.error('AI wisdom error:', error);
  }

  const fallbacks = [
    'Your thoughts are the seeds of your reality. Plant them with intention.',
    'What you seek is already within you, waiting to be acknowledged.',
    'Transformation begins the moment you choose to see differently.',
    'You are the alchemist of your own experience.',
    'Abundance flows where gratitude grows.',
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export const getMeditationWisdom = async (focusArea: string): Promise<string> => {
  try {
    const response = await api.generateAiCopy({
      type: 'meditation_wisdom',
      focusArea,
    });
    const text = typeof response?.text === 'string' ? trimGeneratedText(response.text) : '';
    if (text) {
      return text;
    }
  } catch (error) {
    console.error('AI meditation wisdom error:', error);
  }

  const fallbacks = [
    `Breathe into the essence of ${focusArea}.`,
    `Let ${focusArea} fill your entire being.`,
    `Find the stillness where ${focusArea} resides.`,
    'In silence, all answers appear.',
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export const getPersonalizedAffirmation = async (
  practiceType: 'MORNING_IAM' | 'EVENING_ILOVE',
  focusArea: string
): Promise<string> => {
  try {
    const response = await api.generateAiCopy({
      type: 'personalized_affirmation',
      practiceType,
      focusArea,
    });
    const text = typeof response?.text === 'string' ? trimGeneratedText(response.text) : '';
    if (text) {
      return text;
    }
  } catch (error) {
    console.error('AI affirmation error:', error);
  }

  const iAmFallbacks: Record<string, string[]> = {
    'Wealth Abundance': [
      'I am a magnet for prosperity and abundance',
      'I am worthy of unlimited financial success',
    ],
    Peace: ['I am calm, centered, and at peace', 'I am grounded in tranquility'],
    'Love Relationships': [
      'I am deserving of deep, authentic love',
      'I am open to profound connections',
    ],
    'Health Wholeness': [
      'I am vibrant, strong, and full of vitality',
      'I am grateful for my healthy body',
    ],
  };

  const iLoveFallbacks: Record<string, string[]> = {
    'Wealth Abundance': [
      'I love the abundance that flows to me effortlessly',
      'I love creating prosperity',
    ],
    Peace: ['I love the stillness within my soul', 'I love feeling calm and centered'],
    'Love Relationships': [
      'I love giving and receiving love freely',
      'I love the connections I create',
    ],
    'Health Wholeness': [
      'I love honoring my body with care',
      'I love feeling energized and alive',
    ],
  };

  const fallbackSet = practiceType === 'MORNING_IAM' ? iAmFallbacks : iLoveFallbacks;
  const options = fallbackSet[focusArea] || [
    'I am becoming my highest self',
    'I love who I am becoming',
  ];

  return options[Math.floor(Math.random() * options.length)];
};
