// src/App.tsx
import React, { useState, useEffect } from 'react';

import {
  AppMode,
  UserProfile,
  PracticeType,
  PracticeSessionConfig,
  Affirmation,
  UserAccount,
  AppSettings,
  Soundscape,
  GratitudeLog,
  CycleType
} from './types';

// Components
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PracticeSession } from './components/PracticeSession';
import { Stats } from './components/Stats';
import { Library } from './components/Library';
import { Settings } from './components/Settings';
import { Layout } from './components/Layout';
import { TutorialOverlay } from './components/TutorialOverlay';
import { SplashScreen } from './components/SplashScreen';
import { MeditationSetup } from './components/MeditationSetup';
import { PreSplash } from './components/PreSplash';
import { WelcomeScreen } from './components/WelcomeScreen';

// Services
import {
  setAudioSettings,
  startAmbience,
  stopAmbience,
  startSessionAudio,
  stopSessionAudio
} from './services/audioService';
import { apiService } from './services/apiService';

// Icons
import { Home, BarChart2, BookOpen, Sparkles, Settings as SettingsNavIcon } from 'lucide-react';

const DEFAULT_SOUNDSCAPES: Soundscape[] = [
  { id: 'OM', label: 'Deep Om', category: 'OM' },
  { id: 'RAIN', label: 'Rainfall', category: 'RAIN' },
  { id: 'FOREST', label: 'Forest', category: 'FOREST' },
  { id: 'CELESTIAL', label: 'Celestial', category: 'CELESTIAL' }
];

export const App: React.FC = () => {
  // State: Interaction (Audio Gate)
  const [hasInteracted, setHasInteracted] = useState(false);

  // State: Core App
  const [mode, setMode] = useState<AppMode>(AppMode.SPLASH);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeSession, setActiveSession] = useState<PracticeSessionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State: Settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    soundEffectsOn: true,
    musicOn: true,
    soundscapeId: 'OM',
    iAmSoundscapeId: 'OM',
    iLoveSoundscapeId: 'OM',
    meditationSoundscapeId: 'OM',
    ambienceVolume: 50,
    voiceId: 'Fenrir',
    reminders: {
      enabled: false,
      mode: 'INTERVAL',
      intervalMinutes: 60,
      specificTimes: ['08:00']
    }
  });

  const [userAudioFile, setUserAudioFile] = useState<File | null>(null);
  const [tempRegName, setTempRegName] = useState('');
  const [availableSoundscapes, setAvailableSoundscapes] =
    useState<Soundscape[]>(DEFAULT_SOUNDSCAPES);

  // --- Effects ---

  // 1. Sync Audio Settings

useEffect(() => {
  setAudioSettings(settings.soundEffectsOn, settings.musicOn);
}, [settings.soundEffectsOn, settings.musicOn]);


  // 2. Load Remote Soundscapes
  useEffect(() => {
    apiService
      .getSoundscapes()
      .then((remoteSounds) => {
        setAvailableSoundscapes([...DEFAULT_SOUNDSCAPES, ...remoteSounds]);
      })
      .catch(() => {
        console.warn('Could not load remote soundscapes');
      });
  }, []);

  // 3. Load Persisted Data
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const savedUser = localStorage.getItem('abundance_user');
        const savedSettings = localStorage.getItem('abundance_settings');

        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings((prev) => ({
            ...prev,
            ...parsed,
            reminders: { ...prev.reminders, ...(parsed.reminders || {}) }
          }));
        }

        if (savedUser) {
          const u: UserProfile = JSON.parse(savedUser);
          if (!u.gratitudeLogs) u.gratitudeLogs = [];
          setUser(u);

          if (u.email) {
            apiService.getUserAffirmations(u.email).then((affs) => {
              if (affs.length > 0) {
                setUser((prev) => (prev ? { ...prev, customAffirmations: affs } : null));
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppData();
  }, []);

  // 4. PreSplash Transition Logic
  const handlePreSplashContinue = () => {
    setHasInteracted(true);
    startAmbience(settings.soundscapeId, settings.ambienceVolume);
    setMode(AppMode.SPLASH);
  };

  // --- Handlers: Auth ---
  const handleRegister = (account: UserAccount) => {
    const name = account.name || '';
    setTempRegName(name);

    const newProfile: UserProfile = {
      name,
      email: account.email,
      focusAreas: [],
      cyclePreference: CycleType.DAILY,
      streak: 0,
      lastPracticeDate: null,
      affirmationsCompleted: 0,
      level: 1,
      customAffirmations: [],
      gratitudeLogs: []
    };

    setUser(newProfile);
    localStorage.setItem('abundance_user', JSON.stringify(newProfile));
    setMode(AppMode.ONBOARDING);
  };

  const handleLogin = (account: UserAccount) => {
    const savedUser = localStorage.getItem('abundance_user');
    if (savedUser) {
      const u: UserProfile = JSON.parse(savedUser);
      setUser(u);
      setMode(AppMode.DASHBOARD);
      startAmbience(settings.soundscapeId, settings.ambienceVolume);
    } else {
      handleRegister(account);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('abundance_user');
    localStorage.removeItem('abundance_auth');
    stopAmbience();
    setUser(null);
    setMode(AppMode.AUTH);
  };

  // --- Handlers: Practice & Sessions ---
  const startPractice = (type: PracticeType, duration: number) => {
    stopAmbience();
    const config: PracticeSessionConfig = { type, duration };
    setActiveSession(config);
    setMode(AppMode.PRACTICE);
  };

  const handleMeditationBegin = (config: PracticeSessionConfig) => {
    stopAmbience();

    if (config.soundscape) {
      const url = typeof config.soundscape === 'string' ? config.soundscape : config.soundscape.url;
      if (url) {
        startSessionAudio(url);
      }
    }

    setActiveSession(config);
    setMode(AppMode.PRACTICE);
  };

  const handleSessionComplete = (newLog?: GratitudeLog) => {
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        affirmationsCompleted: user.affirmationsCompleted + 1,
        streak: user.streak + 1,
        lastPracticeDate: new Date().toISOString(),
        gratitudeLogs: newLog ? [...user.gratitudeLogs, newLog] : user.gratitudeLogs
      };

      setUser(updatedUser);
      localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
      apiService.syncProgress(updatedUser);
    }

    stopSessionAudio();
    startAmbience(settings.soundscapeId, settings.ambienceVolume);
    setMode(AppMode.DASHBOARD);
    setActiveSession(null);
  };

  const handleSessionExit = () => {
    stopSessionAudio();
    startAmbience(settings.soundscapeId, settings.ambienceVolume);
    setMode(AppMode.DASHBOARD);
    setActiveSession(null);
  };

  // --- Handlers: Data ---
  const addAffirmation = async (text: string, type: PracticeType) => {
    if (!user) return;

    const auth = JSON.parse(localStorage.getItem('abundance_auth') || '{}');
    const email = auth.email || 'guest';

    const newId = await apiService.addUserAffirmation(email, text, type);
    if (newId) {
      const newAff: Affirmation = {
        id: newId,
        text,
        category: 'Custom',
        isFavorite: true,
        type,
        dateAdded: new Date().toISOString()
      };

      const updatedUser: UserProfile = {
        ...user,
        customAffirmations: [...user.customAffirmations, newAff]
      };

      setUser(updatedUser);
      localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
    }
  };

  const removeAffirmation = async (id: string) => {
    if (!user) return;

    const success = await apiService.removeUserAffirmation(id);
    if (success) {
      const updatedUser: UserProfile = {
        ...user,
        customAffirmations: user.customAffirmations.filter((a) => a.id !== id)
      };

      setUser(updatedUser);
      localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
    }
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('abundance_settings', JSON.stringify(newSettings));

    if (
      newSettings.soundscapeId !== settings.soundscapeId ||
      newSettings.ambienceVolume !== settings.ambienceVolume
    ) {
      startAmbience(newSettings.soundscapeId, newSettings.ambienceVolume);
    }
  };

  const handleSettingsAudioUpload = (file: File, _category: string) => {
    setUserAudioFile(file);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    const initialProfile: UserProfile = { ...profile, customAffirmations: [], gratitudeLogs: [] };
    setUser(initialProfile);
    localStorage.setItem('abundance_user', JSON.stringify(initialProfile));
    setMode(AppMode.TUTORIAL);
  };

  // --- Render ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/40 via-cyan-400/30 to-indigo-500/40 animate-pulse shadow-[0_0_40px_rgba(16,185,129,0.45)] mx-auto" />
          <p className="text-sm text-slate-400 tracking-wide uppercase">
            Preparing your sacred space...
          </p>
        </div>
      </div>
    );
  }

  if (!hasInteracted) {
    return <PreSplash onContinue={handlePreSplashContinue} theme={settings.theme} />;
  }

  const currentSoundscapeObj =
    availableSoundscapes.find((s) => String(s.id) === String(settings.soundscapeId)) ||
    DEFAULT_SOUNDSCAPES[0];

  const renderContent = () => {
    switch (mode) {
      case AppMode.SPLASH:
        return (
          <SplashScreen
            onComplete={() => {
              setMode(AppMode.WELCOME);
            }}
          />
        );
      case AppMode.WELCOME:
        return (
          <WelcomeScreen
            user={user}
            onComplete={(nextMode) => {
              setMode(nextMode);
            }}
          />
        );
      case AppMode.AUTH:
        return (
          <Auth
            onLogin={handleLogin}
            onRegister={handleRegister}
            theme={settings.theme}
          />
        );
      case AppMode.ONBOARDING:
        return (
          <Onboarding
            onComplete={handleOnboardingComplete}
            initialName={tempRegName || user?.name}
          />
        );
      case AppMode.TUTORIAL:
        return (
          <TutorialOverlay
            onComplete={() => setMode(AppMode.DASHBOARD)}
            onChangeFocus={() => setMode(AppMode.ONBOARDING)}
            theme={settings.theme}
          />
        );
      case AppMode.SETTINGS:
        return (
          <Settings
            settings={settings}
            onChangeSettings={updateSettings}
            onChangeFocus={() => setMode(AppMode.ONBOARDING)}
            onBack={() => setMode(AppMode.DASHBOARD)}
            onSignOut={handleSignOut}
            onReplayTutorial={() => setMode(AppMode.TUTORIAL)}
            onAudioUpload={handleSettingsAudioUpload}
            theme={settings.theme}
            userAudioFile={userAudioFile}
            availableSoundscapes={availableSoundscapes}
          />
        );
      case AppMode.DASHBOARD:
        return user ? (
          <Dashboard
            user={user}
            onStartPractice={startPractice}
            onOpenMeditation={() => setMode(AppMode.MEDITATION_SETUP)}
            onOpenSettings={() => setMode(AppMode.SETTINGS)}
            onSignOut={handleSignOut}
            theme={settings.theme}
            userAudioFile={userAudioFile || undefined}
            activeSoundscape={currentSoundscapeObj}
          />
        ) : null;
      case AppMode.MEDITATION_SETUP:
        return (
          <MeditationSetup
            onBack={() => setMode(AppMode.DASHBOARD)}
            onBegin={handleMeditationBegin}
            theme={settings.theme}
            availableSoundscapes={availableSoundscapes}
          />
        );
      case AppMode.PRACTICE:
        return activeSession && user ? (
          <PracticeSession
            config={activeSession}
            customAffirmations={user.customAffirmations}
            onComplete={handleSessionComplete}
            onExit={handleSessionExit}
            userAudioFile={userAudioFile || undefined}
            theme={settings.theme}
            soundscape={currentSoundscapeObj}
          />
        ) : null;
      case AppMode.PROFILE:
        return user ? <Stats user={user} /> : null;
      case AppMode.LIBRARY:
        return user ? (
          <Library
            affirmations={user.customAffirmations}
            gratitudeLogs={user.gratitudeLogs}
            onAdd={addAffirmation}
            onRemove={removeAffirmation}
            onAudioUpload={setUserAudioFile}
            userAudioFile={userAudioFile}
            theme={settings.theme}
            soundscapes={availableSoundscapes}
            activeSoundscapeId={String(settings.soundscapeId)}
          />
        ) : null;
      default:
        return null;
    }
  };

  const hideNav = [
    AppMode.SPLASH,
    AppMode.ONBOARDING,
    AppMode.AUTH,
    AppMode.PRACTICE,
    AppMode.TUTORIAL,
    AppMode.MEDITATION_SETUP,
    AppMode.WELCOME
  ].includes(mode);

  const getNavClass = (targetMode: AppMode) => {
    const isActive = mode === targetMode;

    if (settings.theme === 'light') {
      return isActive ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600';
    }

    return isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300';
  };

  return (
    <Layout
      theme={settings.theme}
      mode={mode}
      practiceType={activeSession?.type}
    >
      <div className="flex-1">{renderContent()}</div>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-30">
          <div className="mx-auto max-w-md pb-4 px-4">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
              <div className="grid grid-cols-5 gap-1 py-2 px-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
                {/* Home */}
                <button
                  onClick={() => setMode(AppMode.DASHBOARD)}
                  className={`flex flex-col items-center space-y-1 transition-colors ${getNavClass(
                    AppMode.DASHBOARD
                  )}`}
                >
                  <Home className="w-4 h-4" />
                  <span>HOME</span>
                </button>

                {/* Library */}
                <button
                  onClick={() => setMode(AppMode.LIBRARY)}
                  className={`flex flex-col items-center space-y-1 transition-colors ${getNavClass(
                    AppMode.LIBRARY
                  )}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>MAKTABA</span>
                </button>

                {/* Center Sacred Button */}
                <button
                  onClick={() => startPractice(PracticeType.MORNING_IAM, 1)}
                  className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500 shadow-[0_0_40px_rgba(34,197,94,0.7)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </button>

                {/* Stats / Journey */}
                <button
                  onClick={() => setMode(AppMode.PROFILE)}
                  className={`flex flex-col items-center space-y-1 transition-colors ${getNavClass(
                    AppMode.PROFILE
                  )}`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>JOURNEY</span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => setMode(AppMode.SETTINGS)}
                  className={`flex flex-col items-center space-y-1 transition-colors ${getNavClass(
                    AppMode.SETTINGS
                  )}`}
                >
                  <SettingsNavIcon className="w-4 h-4" />
                  <span>SETTINGS</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
    </Layout>
  );
};
