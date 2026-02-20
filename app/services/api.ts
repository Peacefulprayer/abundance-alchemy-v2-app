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
type AddAffirmationResponse = { success: boolean; id: string | number };
type DeleteAffirmationResponse = { success: boolean; deleted?: boolean };
type RandomAffirmationResponse = { text?: string };

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/abundance-alchemy-api';

const STORAGE_KEYS = {
  AUTH: 'abundance_auth',
  USER: 'abundance_user',
} as const;

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.USER);
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

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}/${cleanEndpoint}`;

  const response = await fetch(url, {
    method: method ?? (body !== undefined ? 'POST' : 'GET'),
    headers,
    body: finalBody,
    credentials: 'include',
    ...rest,
  });

  const raw = await response.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

  if (response.status === 401) {
    clearAuth();
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
    client<MeUser>('login.php', { body: { email, password } }),

  // CHANGED: signup.php -> register.php to match your file
  register: (name: string, email: string, password?: string) => 
    client<MeUser>('register.php', { body: { name, email, password } }),

  updateProgress: (payload: { userId: string | number; type: string; duration?: number; itemId?: string }) => 
    client<{ ok: boolean }>('sync-progress.php', { body: payload }),

  getSoundscapes: (email?: string) => client<Soundscape[]>('get-soundscapes.php' + (email ? `?email=${encodeURIComponent(email)}` : '')),

  getBackgrounds: () => client<BackgroundMap>('get-backgrounds.php'),

  getAffirmations: () => client<Affirmation[]>('get-system-affirmations.php'),

  getSystemAffirmations: (type: PracticeType) =>
    client<Affirmation[]>(`get-system-affirmations.php?type=${encodeURIComponent(type)}`),

  getRandomAffirmation: async (type: PracticeType, category?: string): Promise<string | null> => {
    const query = new URLSearchParams();
    query.set('type', type);
    if (category?.trim()) {
      query.set('category', category.trim());
    }
    const data = await client<RandomAffirmationResponse>(`get-affirmation.php?${query.toString()}`);
    return typeof data?.text === 'string' && data.text.trim() ? data.text.trim() : null;
  },

  getUserAffirmations: async (): Promise<Affirmation[]> => {
    const rows = await client<any[]>('get-user-affirmations.php');
    return (rows || []).map((item: any) => ({
      id: String(item.id),
      text: String(item.text ?? ''),
      type: item.type as PracticeType,
      category: 'Personal',
      isFavorite: true,
      dateAdded: item.created_at ?? new Date().toISOString(),
    }));
  },

  addUserAffirmation: (email: string, text: string, type: PracticeType) =>
    client<AddAffirmationResponse>('add-user-affirmation.php', { body: { email, text, type } }),

  removeUserAffirmation: (id: string) =>
    client<DeleteAffirmationResponse>('delete-user-affirmation.php', { body: { id }, method: 'POST' }),

  // CHANGED: upload-audio.php -> user-upload-audio.php to match your user-facing script
  uploadUserAudio: (file: File, category: string, email: string) => {
    const formData = new FormData();
    formData.append('audio_file', file);
    formData.append('category', category);
    formData.append('email', email);
    return client<{ url: string }>('user-upload-audio.php', { body: formData });
  },

  syncProgress: (data: any) => client('sync-progress.php', { body: data }),

  logout: () => client<{ success: boolean }>('logout.php', { method: 'POST' }),
};

// ALIAS for backward compatibility with your App.tsx
export const apiService = api;
