// Always point explicitly at the app's API directory
const API_BASE = '/abundance-alchemy/api';
const ENABLE_BACKEND = true;

// Generic fetch helper with timeout + abort support
const fetchWithTimeout = async (resource: string, options: RequestInit = {}) => {
  const { timeout = 5000 } = options as any;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// ---------- Dynamic backgrounds ----------

export type BackgroundSlot =
  | 'SPLASH'
  | 'SPLASH_WELCOME'
  | 'AUTH'
  | 'HOME'
  | 'WELCOME'
  | 'IAM_SETUP'
  | 'IAM_PRACTICE'
  | 'ILOVE_SETUP'
  | 'ILOVE_PRACTICE'
  | 'MEDITATION_SETUP'
  | 'MEDITATION_PRACTICE'
  | 'SETTINGS'
  | 'PROGRESS';

export interface BackgroundEntry {
  imageUrl: string;
}

export type BackgroundConfig = Partial<Record<BackgroundSlot, BackgroundEntry>>;

export async function getBackgrounds(): Promise<BackgroundConfig> {
  if (!ENABLE_BACKEND) return {};

  try {
    const res = await fetchWithTimeout(`${API_BASE}/get-backgrounds.php`);

    if (!res.ok) {
      console.error('getBackgrounds HTTP error:', res.status);
      return {};
    }

    const text = await res.text();
    if (!text) {
      console.warn('getBackgrounds: empty response body');
      return {};
    }

    try {
      const data = JSON.parse(text);
      return data as BackgroundConfig;
    } catch (jsonErr) {
      console.error('getBackgrounds JSON parse error:', jsonErr, 'Raw:', text);
      return {};
    }
  } catch (err) {
    console.error('getBackgrounds network error:', err);
    return {};
  }
}

// ---------- Core API service used by the app ----------

export const apiService = {
  // Register a new user account
  async register(name: string, email: string, password: string): Promise<any> {
    if (!ENABLE_BACKEND) return null;
    try {
      const response = await fetchWithTimeout(`${API_BASE}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('API Register: Could not parse JSON', text);
        return { message: `Server Error: ${text.substring(0, 100)}...` };
      }

      if (!response.ok) {
        return {
          message: data?.message || `Registration failed (${response.status})`,
        };
      }

      return data;
    } catch (error: any) {
      console.log('API Register error:', error);
      return { message: error instanceof Error ? error.message : 'Network error' };
    }
  },

  // Login with email + password
  async login(email: string, password: string): Promise<any> {
    if (!ENABLE_BACKEND) return null;
    try {
      const response = await fetchWithTimeout(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('API Login: Could not parse JSON', text);
        return { message: `Server Error: ${text.substring(0, 100)}...` };
      }

      if (!response.ok) {
        return {
          message: data?.message || `Login failed (${response.status})`,
        };
      }

      return data;
    } catch (error: any) {
      console.log('API Login error:', error);
      return { message: error instanceof Error ? error.message : 'Network error' };
    }
  },

  // Request a password reset email
  async requestPasswordReset(email: string): Promise<boolean> {
    if (!ENABLE_BACKEND) return true;
    try {
      const response = await fetchWithTimeout(`${API_BASE}/request-password-reset.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return response.ok;
    } catch (error) {
      console.error('Reset request failed', error);
      return false;
    }
  },

  // Sync basic progress fields back to the backend
  async syncProgress(user: any): Promise<boolean> {
    if (!ENABLE_BACKEND || !user?.email) return false;
    try {
      await fetchWithTimeout(`${API_BASE}/sync-progress.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          streak: user.streak,
          level: user.level,
          affirmationsCompleted: user.affirmationsCompleted,
          focusArea: user.focusArea,
        }),
      });
      return true;
    } catch (error) {
      console.error('Sync progress failed', error);
      return false;
    }
  },

  // Get a wisdom snippet from the DB
  async getWisdom(category: 'MORNING' | 'EVENING' | 'GENERAL'): Promise<string | null> {
    if (!ENABLE_BACKEND) return null;
    try {
      const response = await fetchWithTimeout(`${API_BASE}/get-wisdom.php?category=${category}`);
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return data.text || null;
      } catch {
        return null;
      }
    } catch (error) {
      return null;
    }
  },

  // Single affirmation for a given type + category
  async getAffirmation(type: any, category: string): Promise<string | null> {
    if (!ENABLE_BACKEND) return null;
    try {
      const typeStr = String(type);
      const response = await fetchWithTimeout(
        `${API_BASE}/get-affirmation.php?type=${typeStr}&category=${encodeURIComponent(category)}`
      );
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return data.text || null;
      } catch {
        return null;
      }
    } catch (error) {
      return null;
    }
  },

  // System-provided affirmations for each practice type
  async getSystemAffirmations(type: any): Promise<any[]> {
    if (!ENABLE_BACKEND) return [];
    try {
      const typeStr = String(type);
      const response = await fetchWithTimeout(
        `${API_BASE}/get-system-affirmations.php?type=${typeStr}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        id: 'sys_' + item.id,
        text: item.text,
        type: typeStr,
        category: item.category || 'System',
        isFavorite: false,
        dateAdded: new Date().toISOString(),
      }));
    } catch (e) {
      return [];
    }
  },

  // User-created affirmations
  async getUserAffirmations(email: string): Promise<any[]> {
    if (!ENABLE_BACKEND) return [];
    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/get-user-affirmations.php?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id.toString(),
        text: item.text,
        type: item.type,
        category: 'Personal',
        isFavorite: true,
        dateAdded: item.created_at,
      }));
    } catch (e) {
      return [];
    }
  },

  async addUserAffirmation(email: string, text: string, type: any): Promise<string | null> {
    if (!ENABLE_BACKEND) return Date.now().toString();
    try {
      const response = await fetchWithTimeout(`${API_BASE}/add-user-affirmation.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, text, type }),
      });
      const data = await response.json();
      return data.success ? data.id.toString() : null;
    } catch (e) {
      return null;
    }
  },

  async removeUserAffirmation(id: string): Promise<boolean> {
    if (!ENABLE_BACKEND) return true;
    try {
      await fetchWithTimeout(
        `${API_BASE}/remove-user-affirmation.php?id=${encodeURIComponent(id)}`,
        { method: 'POST' }
      );
      return true;
    } catch (e) {
      return false;
    }
  },

  // Soundscapes from DB or filesystem - FIXED VERSION
  async getSoundscapes(email?: string): Promise<any[]> {
    if (!ENABLE_BACKEND) return [];
    try {
      // Build query with optional filters
      let query = '';
      if (email) {
        query = `?user_email=${encodeURIComponent(email)}`;
      }
      
      const response = await fetchWithTimeout(`${API_BASE}/get-soundscapes.php${query}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      
      // Our API already returns success + data structure
      if (!data.success || !data.data) return [];
      
      // Use the audio_url that our PHP API already provides
      return data.data.map((item: any) => ({
        id: item.id.toString(),
        label: item.name,
        category: item.category || 'CUSTOM',
        usage_purpose: item.usage_purpose || 'meditation',
        duration_formatted: item.duration_formatted || null,
        bpm: item.bpm || null,
        energy_level: item.energy_level || 'medium',
        is_loopable: item.is_loopable || false,
        is_public: item.is_public || true,
        is_user_upload: item.is_user_upload || false,
        is_practice_length: item.is_practice_length || false,
        // CRITICAL FIX: Use the audio_url that PHP already built correctly
        url: item.audio_url,  // This is the correct URL from API
        // Keep original for reference
        original_url: item.url,
      }));
    } catch (e) {
      console.error('getSoundscapes error:', e);
      return [];
    }
  },

  // Dedicated meditation tracks (could be same table or subset)
  async getMeditationTracks(): Promise<any[]> {
    if (!ENABLE_BACKEND) return [];
    try {
      const response = await fetchWithTimeout(`${API_BASE}/get-soundscapes.php?purpose=meditation`);
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.success || !data.data) return [];
      
      return data.data.map((item: any) => ({
        id: item.id.toString(),
        label: item.name,
        category: 'CUSTOM',
        url: item.audio_url, // Use the correct audio_url
      }));
    } catch (e) {
      return [];
    }
  },

  // Upload a custom audio file for the user - UPDATED TO NEW ENDPOINT
  async uploadUserAudio(file: File, category?: string, email?: string): Promise<{ success: boolean; filename?: string; audio_url?: string }> {
    if (!ENABLE_BACKEND || !email) return { success: false };
    
    try {
      const formData = new FormData();
      formData.append('audioFile', file);
      formData.append('email', email);
      if (category) formData.append('category', category);
      formData.append('purpose', 'meditation'); // Default purpose
      
      // Use the NEW endpoint
      const response = await fetch(`${API_BASE}/user-upload-audio.php`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        return { success: false };
      }
      
      const data = await response.json();
      return { 
        success: data.success === true,
        filename: data.filename,
        audio_url: data.audio_url 
      };
    } catch (error) {
      console.error('Audio upload failed:', error);
      return { success: false };
    }
  },
};