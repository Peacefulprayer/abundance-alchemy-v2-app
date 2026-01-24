import { Affirmation, Soundscape, PracticeType } from '../types';

export type BackgroundMap = Record<string, { imageUrl: string }>;

export type MeUser = {
  id: number;
  name: string;
  email: string;
  streak: number;
  level: number;
  focusAreas: string[];
  affirmationsCompleted: number;
};

export type MeditationTrack = Record<string, any>;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/abundance-alchemy-api';

const STORAGE_KEYS = {
  TOKEN: 'abundance_token',
} as const;

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

type ClientConfig = Omit<RequestInit, 'body' | 'method' | 'headers'> & {
  body?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
};

async function client<T>(endpoint: string, config: ClientConfig = {}): Promise<T> {
  const { body, method, headers: customHeaders, ...rest } = config;
  const token = getToken();
  const headers: HeadersInit = { ...(customHeaders || {}) };

  let finalBody: BodyInit | undefined = undefined;
  if (body !== undefined) {
    if (body instanceof FormData) {
      finalBody = body;
    } else {
      finalBody = JSON.stringify(body);
      if (!('Content-Type' in (headers as any))) {
        (headers as any)['Content-Type'] = 'application/json';
      }
    }
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

  const raw = await response.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

  if (response.status === 401) {
    logout();
    throw new ApiError('Unauthorized', 401);
  }

  if (!response.ok) {
    throw new ApiError((data && (data.message || data.error)) || 'API Request Failed', response.status);
  }

  return data as T;
}

export const api = {
  me: () => client<MeUser>('me.php'),

  // Maps to your ACTUAL PHP files
  login: (email: string, password?: string) => 
    client<{ token: string; user: MeUser }>('login.php', { body: { email, password } }),

  // CHANGED: signup.php -> register.php to match your file
  register: (name: string, email: string, password?: string) => 
    client<{ token: string; user: MeUser }>('register.php', { body: { name, email, password } }),

  updateProgress: (payload: { userId: string | number; type: string; duration?: number; itemId?: string }) => 
    client<{ ok: boolean }>('sync-progress.php', { body: payload }),

  getSoundscapes: (email?: string) => client<Soundscape[]>('get-soundscapes.php' + (email ? `?email=${encodeURIComponent(email)}` : '')),

  getBackgrounds: () => client<BackgroundMap>('get-backgrounds.php'),

  getAffirmations: () => client<Affirmation[]>('get-system-affirmations.php'),

  addUserAffirmation: (email: string, text: string, type: PracticeType) =>
    client<Affirmation>('add-user-affirmation.php', { body: { email, text, type } }),

  removeUserAffirmation: (id: string) => client<{ ok: boolean }>(`delete-affirmation.php`, { body: { id }, method: 'POST' }),

  // CHANGED: upload-audio.php -> user-upload-audio.php to match your user-facing script
  uploadUserAudio: (file: File, category: string, email: string) => {
    const formData = new FormData();
    formData.append('audio_file', file);
    formData.append('category', category);
    formData.append('email', email);
    return client<{ url: string }>('user-upload-audio.php', { body: formData });
  },

  syncProgress: (data: any) => client('sync-progress.php', { body: data }),
};

// ALIAS for backward compatibility with your App.tsx
export const apiService = api;
