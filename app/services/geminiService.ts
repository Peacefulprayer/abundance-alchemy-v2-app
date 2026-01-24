import { GoogleGenAI } from "@google/genai";

// Safely retrieve the API key to prevent "Cannot read properties of undefined" crashes
// in environments where import.meta.env might not be fully polyfilled or available immediately.
let rawKey: string | undefined;
try {
  // @ts-ignore - Vite specific
  if (import.meta && import.meta.env) {
    // @ts-ignore
    rawKey = import.meta.env.VITE_API_KEY;
  }
} catch (e) {
  // Ignore error, fallback to offline mode
}

const apiKey = typeof rawKey === "string" && rawKey.trim() !== "" ? rawKey : undefined;

let ai: GoogleGenAI | null = null;

// Only initialize AI if a key is present. 
// If not, the app runs in "Offline Mode" using the fallbacks below.
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn("Gemini Client Error: Running in offline mode.");
  }
} else {
  console.log(
    "No API Key found: AI features disabled. Using built-in wisdom/database content."
  );
}

export const getAlchemistWisdom = async (): Promise<string> => {
  if (ai) {
    try {
      const prompt = `Generate a short, inspiring wisdom quote (maximum 20 words) about personal transformation, abundance mindset, or spiritual growth. Make it mystical and alchemical in tone. Do not use quotation marks.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      if (response.text) {
        return response.text.trim().replace(/^["']|["']$/g, "");
      }
    } catch (error) {
      console.error("Gemini error:", error);
    }
  }

  const fallbacks = [
    "Your thoughts are the seeds of your reality. Plant them with intention.",
    "What you seek is already within you, waiting to be acknowledged.",
    "Transformation begins the moment you choose to see differently.",
    "You are the alchemist of your own experience.",
    "Abundance flows where gratitude grows."
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export const getMeditationWisdom = async (focusArea: string): Promise<string> => {
  if (ai) {
    try {
      const prompt = `Generate a deep, calming wisdom quote (max 15 words) specifically about ${focusArea}. It should serve as a focus point for meditation. Do not use quotation marks.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      if (response.text) {
        return response.text.trim().replace(/^["']|["']$/g, "");
      }
    } catch (error) {
      console.error("Gemini error:", error);
    }
  }

  const fallbacks = [
    `Breathe into the essence of ${focusArea}.`,
    `Let ${focusArea} fill your entire being.`,
    `Find the stillness where ${focusArea} resides.`,
    "In silence, all answers appear."
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export const getPersonalizedAffirmation = async (
  practiceType: "MORNING_IAM" | "EVENING_ILOVE",
  focusArea: string
): Promise<string> => {
  if (ai) {
    const typeContext =
      practiceType === "MORNING_IAM"
        ? 'empowering, present-tense "I am" statement'
        : 'loving, heart-centered "I love" statement';

    const prompt = `Generate one powerful ${typeContext} affirmation focused on ${focusArea}. Maximum 15 words. Use simple, direct language. Do not use quotation marks.`;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      if (response.text) {
        return response.text.trim().replace(/^["']|["']$/g, "");
      }
    } catch (error) {
      console.error("Gemini error:", error);
    }
  }

  const iAmFallbacks: Record<string, string[]> = {
    "Wealth Abundance": [
      "I am a magnet for prosperity and abundance",
      "I am worthy of unlimited financial success"
    ],
    Peace: ["I am calm, centered, and at peace", "I am grounded in tranquility"],
    "Love Relationships": [
      "I am deserving of deep, authentic love",
      "I am open to profound connections"
    ],
    "Health Wholeness": [
      "I am vibrant, strong, and full of vitality",
      "I am grateful for my healthy body"
    ],
  };

  const iLoveFallbacks: Record<string, string[]> = {
    "Wealth Abundance": [
      "I love the abundance that flows to me effortlessly",
      "I love creating prosperity"
    ],
    Peace: ["I love the stillness within my soul", "I love feeling calm and centered"],
    "Love Relationships": [
      "I love giving and receiving love freely",
      "I love the connections I create"
    ],
    "Health Wholeness": [
      "I love honoring my body with care",
      "I love feeling energized and alive"
    ],
  };

  const fallbackSet =
    practiceType === "MORNING_IAM" ? iAmFallbacks : iLoveFallbacks;
  const options =
    fallbackSet[focusArea] || [
      "I am becoming my highest self",
      "I love who I am becoming",
    ];
  
  return options[Math.floor(Math.random() * options.length)];
};