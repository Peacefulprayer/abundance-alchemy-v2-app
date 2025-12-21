import React, { useState, useEffect, useMemo } from 'react';
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
  CycleType // ADDED
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
// other imports...
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
  const [availableSoundscapes, setAvailableSoundscapes] = useState<Soundscape[]>(DEFAULT_SOUNDSCAPES);

  // --- Effects ---

  // 1. Sync Audio Settings
  useEffect(() => {
    setAudioSettings(settings.soundEffectsOn, settings.musicOn);
  }, [settings]);

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

  // ✅ 3. IMPORTANT: Removed global click-to-bell behavior.
  // This was causing sound on every click/tap and breaks the sacred “intentional sound” UX.

  // 4. Load Persisted Data
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
          const u = JSON.parse(savedUser);
          if (!u.gratitudeLogs) u.gratitudeLogs = [];
          setUser(u);

          if (u.email) {
            apiService.getUserAffirmations(u.email).then((affs) => {
              if (affs.length > 0) setUser((prev) => (prev ? { ...prev, customAffirmations: affs } : null));
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

  // 5. PreSplash Transition Logic
  const handlePreSplashContinue = () => {
    setHasInteracted(true);
    // Start Ambience immediately
    startAmbience(settings.soundscapeId, settings.ambienceVolume);
    // Go to Splash to run the timer
    setMode(AppMode.SPLASH);
  };



  // --- Handlers: Auth ---

  const handleRegister = (account: UserAccount) => {
    setTempRegName(account.name);
    // Create temp profile
    const newProfile: UserProfile = {
      name: account.name,
      email: account.email,
      focusAreas: [],
      cyclePreference: CycleType.DAILY, // FIXED: Use enum
      streak: 0,
      lastPracticeDate: null,
      affirmationsCompleted: 0,
      level: 1,
      customAffirmations: [],
      gratitudeLogs: []
    };
    setUser(newProfile);
    setMode(AppMode.ONBOARDING);
  };

  const handleLogin = (account: UserAccount) => {
    const savedUser = localStorage.getItem('abundance_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setMode(AppMode.DASHBOARD);
      // Ensure ambience is playing
      startAmbience(settings.soundscapeId, settings.ambienceVolume);
    } else {
      // Fallback
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
    stopAmbience(); // Quiet the lobby music
    setActiveSession({ type, duration }); // FIXED: Removed 'theme' property
    setMode(AppMode.PRACTICE);
  };

  const handleMeditationBegin = (config: PracticeSessionConfig) => {
    stopAmbience();

    // FIXED: Handle both string and Soundscape object, only 1 parameter
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
      const updatedUser = {
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

    // Stop session audio, Resume lobby ambience
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
      const updatedUser = { ...user, customAffirmations: [...user.customAffirmations, newAff] };
      setUser(updatedUser);
      localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
    }
  };

  const removeAffirmation = async (id: string) => {
    if (!user) return;
    const success = await apiService.removeUserAffirmation(id);
    if (success) {
      const updatedUser = { ...user, customAffirmations: user.customAffirmations.filter((a) => a.id !== id) };
      setUser(updatedUser);
      localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
    }
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('abundance_settings', JSON.stringify(newSettings));

    // Live update audio if needed
    if (newSettings.soundscapeId !== settings.soundscapeId || newSettings.ambienceVolume !== settings.ambienceVolume) {
      startAmbience(newSettings.soundscapeId, newSettings.ambienceVolume);
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    const initialProfile = { ...profile, customAffirmations: [], gratitudeLogs: [] };
    setUser(initialProfile);
    localStorage.setItem('abundance_user', JSON.stringify(initialProfile));
    setMode(AppMode.TUTORIAL);
  };

  // --- Render ---

  if (isLoading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 1. PreSplash (Gatekeeper)
  if (!hasInteracted) {
    return <PreSplash onContinue={handlePreSplashContinue} theme={settings.theme} />;
  }

  const currentSoundscapeObj =
    availableSoundscapes.find((s) => s.id === settings.soundscapeId) || DEFAULT_SOUNDSCAPES[0];

  const renderContent = () => {
  switch (mode) {
    case AppMode.SPLASH:
      return (
        <SplashScreen
          onComplete={() => {
            // OLD:
            // setMode(AppMode.AUTH);

            // NEW: go to Welcome instead of AUTH
            setMode(AppMode.WELCOME);
          }}
        />
      );

    case AppMode.WELCOME:
      return (
        <WelcomeScreen
          user={user}
          onComplete={(nextMode) => setMode(nextMode)}
        />
      );

    // ...all your existing other cases remain unchanged

case AppMode.AUTH:
  return (
    <Auth
      onRegister={handleRegister}
      onLogin={handleLogin}
      onBack={() => setMode(AppMode.SPLASH)}
      theme={settings.theme}
    />
  );

      case AppMode.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} initialName={tempRegName} />;

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
            onAudioUpload={setUserAudioFile}
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
            userAudioFile={userAudioFile}
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
            config={{ ...activeSession, focusAreas: user.focusAreas }}
            customAffirmations={user.customAffirmations}
            onComplete={handleSessionComplete}
            onExit={handleSessionExit}
            userAudioFile={userAudioFile}
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
          />
        ) : null;

      default:
        return null;
    }
  };

  // Nav Logic
  const hideNav = [
    AppMode.SPLASH,
    AppMode.ONBOARDING,
    AppMode.AUTH,
    AppMode.PRACTICE,
    AppMode.TUTORIAL,
    AppMode.MEDITATION_SETUP
  ].includes(mode);

  const getNavClass = (targetMode: AppMode) => {
    const isActive = mode === targetMode;
    if (settings.theme === 'light') {
      return isActive ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600';
    }
    return isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300';
  };

  return (
    <div
      className={`h-[100dvh] w-screen flex flex-col overflow-hidden font-sans ${
        settings.theme === 'light' ? 'text-slate-900' : 'text-slate-100'
      }`}
    >
      <Layout mode={mode} practiceType={activeSession?.type} theme={settings.theme}>
        <main className="h-full flex flex-col relative overflow-hidden">
          <div className="flex-1 relative z-10 h-full overflow-hidden">{renderContent()}</div>

          {!hideNav && (
            <nav
              className={`h-20 backdrop-blur-md border-t absolute bottom-0 w-full z-50 ${
                settings.theme === 'light'
                  ? 'bg-white/80 border-slate-200'
                  : 'bg-slate-900/60 border-slate-700/50'
              }`}
            >
              <div className="flex justify-around items-center h-full max-w-md mx-auto px-4 pb-4">
                <button
                  onClick={() => setMode(AppMode.DASHBOARD)}
                  className={`flex flex-col items-center space-y-1 transition-colors ${getNavClass(AppMode.DASHBOARD)}`}
                >
                  <Home size={24} />
                  <span className="text-[10px] font-bold tracking-widest">HOME</span>
                </button>

                <button
                  onClick={() => setMode(AppMode.LIBRARY)}
                  className={`flex flex-col items-center space-y-1 transition-colors ${getNavClass(AppMode.LIBRARY)}`}
                >
                  <BookOpen size={24} />
                  <span className="text-[10px] font-bold tracking-widest">MAKTABA</span>
                </button>

                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 p-[1px] shadow-lg shadow-purple-900/50 -mt-8 mx-2 transform hover:scale-105 transition-transform">
                  <button
                    onClick={() => startPractice(PracticeType.MORNING_IAM, 1)}
                    className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                  >
                    <Sparkles size={20} />
                  </button>
                </div>

                <button
                  onClick={() => setMode(AppMode.PROFILE)}
                  className={`flex flex-col items-center space-y-1 transition-colors ${getNavClass(AppMode.PROFILE)}`}
                >
                  <BarChart2 size={24} />
                  <span className="text-[10px] font-bold tracking-widest">JOURNEY</span>
                </button>

                <button
                  onClick={() => setMode(AppMode.SETTINGS)}
                  className={`flex flex-col items-center space-y-1 transition-colors ${getNavClass(AppMode.SETTINGS)}`}
                >
                  <SettingsNavIcon size={24} />
                  <span className="text-[10px] font-bold tracking-widest">SETTINGS</span>
                </button>
              </div>
            </nav>
          )}
        </main>
      </Layout>
    </div>
  );
};
