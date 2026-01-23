// services/api.ts
import { Affirmation, Soundscape, PracticeType } from '../types'; // Only import what actually exists [file:29]

// Match PHP get-backgrounds.php slot map style (SPLASH/AUTH/WELCOME/etc.) [file:29]
export type BackgroundMap = Record<string, { imageUrl: string }>;

// Match me.php actual output (it returns the object directly, not wrapped) [file:59]
export type MeUser = {
  id: number;
  name: string;
  email: string;
  streak: number;
  level: number;
  focusAreas: string[];
  affirmationsCompleted: number;
};

// Until you formalize a MeditationTrack type, keep this permissive.
// get_meditation_tracks.php returns an array of DB rows [file:54]
export type MeditationTrack = Record<string, any>;

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost/abundance-alchemy-api';

const STORAGE_KEYS = {
  TOKEN: 'abundance_token',
} as const;

// Auth helpers (defined before client() so they are callable safely)
export const setToken = (token: string) =>
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);

export const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  window.dispatchEvent(new Event('auth:logout'));
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// IMPORTANT: This is the fix for your “BodyInit” errors.
// We accept `body?: any` and then serialize it ourselves.
type ClientConfig = Omit<RequestInit, 'body' | 'method' | 'headers'> & {
  body?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
};

async function client<T>(endpoint: string, config: ClientConfig = {}): Promise<T> {
  const { body, method, headers: customHeaders, ...rest } = config;

  const token = getToken();

  // Decide body + headers
  const headers: HeadersInit = {
    ...(customHeaders || {}),
  };

  let finalBody: BodyInit | undefined = undefined;

  if (body !== undefined) {
    // Allow FormData uploads later without breaking
    if (body instanceof FormData) {
      finalBody = body;
      // Do NOT set Content-Type; browser will set multipart boundary.
    } else {
      finalBody = JSON.stringify(body);
      // Only set JSON header when sending JSON
      if (!('Content-Type' in (headers as any))) {
        (headers as any)['Content-Type'] = 'application/json';
      }
    }
  } else {
    // Default Content-Type is not needed for GETs
  }

  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}/${cleanEndpoint}`;

  const response = await fetch(url, {
    method: method ?? (body !== undefined ? 'POST' : 'GET'),
    headers,
    body: finalBody,
    ...rest,
  });

  // Parse response safely (PHP might return empty body sometimes)
  const raw = await response.text();
  let data: any = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (response.status === 401) {
    logout();
    throw new ApiError('Unauthorized', 401);
  }

  if (!response.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      'API Request Failed';
    throw new ApiError(msg, response.status);
  }

  return data as T;
}

export const api = {
  // USER
  me: () => client<MeUser>('me.php'), // me.php returns user object directly [file:59]

  // PROGRESS
  updateProgress: (payload: {
    userId: string | number;
    type: 'meditation' | 'affirmation' | 'journal';
    duration?: number;
    itemId?: string | number;
  }) => client<{ ok?: boolean; message?: string }>('sync-progress.php', { body: payload }),

  // CONTENT
  getSoundscapes: () => client<Soundscape[]>('get-soundscapes.php'),

  getBackgrounds: () => client<BackgroundMap>('get-backgrounds.php'),

  getAffirmations: () => client<Affirmation[]>('get-system-affirmations.php'),

  // Match Affirmation requiring `type: PracticeType` in your types.ts [file:29]
  addUserAffirmation: (affirmationText: string, type: PracticeType) =>
    client<Affirmation>('add-user-affirmation.php', {
      body: { text: affirmationText, type },
    }),

  getMeditationTracks: () => client<MeditationTrack[]>('get_meditation_tracks.php'),

  // GENERIC
  get: <T>(endpoint: string) => client<T>(endpoint),
  post: <T>(endpoint: string, body: any) => client<T>(endpoint, { body }),
};
