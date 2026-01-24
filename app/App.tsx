// App.tsx - PHASE 1: All screens wired with complete flow
// New User: PreSplash → Splash → Welcome → Naming → Auth → Onboarding → Tutorial → Dashboard
// Returning User: PreSplash → Splash → Welcome → Return Portal → Dashboard
import React, { useState, useEffect } from 'react';
import {
  AppMode,
  UserAccount,
  UserProfile,
  Soundscape,
  AppSettings,
  PracticeSessionConfig,
  PracticeType,
  Affirmation,
  GratitudeLog,
  CycleType,
} from './types';
import UniversalLayout from './components/UniversalLayout';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import PreSplash from './components/PreSplash';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PersonalGreeting } from './components/PersonalGreeting';
import { SacredNamingCeremony } from './components/SacredNamingCeremony';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { TutorialOverlay } from './components/TutorialOverlay';
import { PracticeSession } from './components/PracticeSession';
import { Settings } from './components/Settings';
import { Library } from './components/Library';
import { MeditationSetup } from './components/MeditationSetup';
import { Stats } from './components/Stats';
import { Layout } from './components/Layout';
import { playAmbience, stopAmbience } from './services/audioService';
import { href } from './services/base';

// UPDATED IMPORT: Use 'api' from the unified service
import { api } from './services/api';

// Default app settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  soundEffectsOn: true,
  musicOn: true,
  soundscapeId: 'default',
  iAmSoundscapeId: 'default',
  iLoveSoundscapeId: 'default',
  meditationSoundscapeId: 'default',
  ambienceVolume: 50,
  voiceId: 'default',
  reminders: {
    enabled: false,
    mode: 'INTERVAL',
    intervalMinutes: 60,
    specificTimes: ['08:00', '20:00'],
  },
};


function App() {
  // START WITH PRE_SPLASH (not SPLASH)
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.PRE_SPLASH);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');


  // Dashboard expects UserProfile
  const [user, setUser] = useState<UserProfile | null>(null);


  const [sacredName, setSacredName] = useState<string>('');


  // ✅ Backend-validated session check
  const [authChecked, setAuthChecked] = useState(false);


  // ✅ Phase 1: Additional state for missing screens
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [practiceConfig, setPracticeConfig] = useState<PracticeSessionConfig | null>(null);
  const [soundscapes, setSoundscapes] = useState<Soundscape[]>([]);
  const [userAudioFile, setUserAudioFile] = useState<File | null>(null);


  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE_URL ?? '/abundance-alchemy-api';


  // Convert what Auth returns (UserAccount) into what Dashboard expects (UserProfile).
  const toUserProfile = (account: any): UserProfile => {
    const anyAcc = (account ?? {}) as Record<string, any>;


    const profile: UserProfile = {
      ...(anyAcc as any),


      // Identity fields
      id: anyAcc.id ?? anyAcc.user_id ?? anyAcc.email ?? 'local',
      email: anyAcc.email ?? '',
      name: anyAcc.name ?? anyAcc.username ?? anyAcc.displayName ?? '',


      // Required fields (safe defaults)
      focusAreas: anyAcc.focusAreas ?? [],
      cyclePreference: anyAcc.cyclePreference ?? CycleType.DAILY,
      streak: anyAcc.streak ?? 0,
      level: anyAcc.level ?? 1,
      affirmationsCompleted: anyAcc.affirmationsCompleted ?? 0,
      lastPracticeDate: anyAcc.lastPracticeDate ?? null,
      customAffirmations: anyAcc.customAffirmations ?? [],
      gratitudeLogs: anyAcc.gratitudeLogs ?? [],


      createdAt: anyAcc.createdAt ?? anyAcc.created_at ?? undefined,
      updatedAt: anyAcc.updatedAt ?? anyAcc.updated_at ?? undefined,
      lastActiveAt: anyAcc.lastActiveAt ?? anyAcc.last_active_at ?? undefined,
      settings: anyAcc.settings ?? undefined,
    } as UserProfile;


    return profile;
  };


  // ✅ Boot validation: localStorage is a hint, backend is truth.
  useEffect(() => {
    const raw = localStorage.getItem('abundance_auth');


    // No stored session → treat as new
    if (!raw) {
      setUser(null);
      setAuthChecked(true);
      return;
    }


    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.error('Failed to parse stored auth:', error);
      localStorage.removeItem('abundance_auth');
      setUser(null);
      setAuthChecked(true);
      return;
    }


    const email = parsed?.email;
    if (!email || typeof email !== 'string') {
      localStorage.removeItem('abundance_auth');
      setUser(null);
      setAuthChecked(true);
      return;
    }


    (async () => {
      try {
        // Use the new API service for consistency
        const res = await api.me();

        // Hydrate from backend-validated profile
        setUser(toUserProfile(res));


        // Optional: refresh stored auth with validated data (keeps email/name in sync)
        try {
          localStorage.setItem('abundance_auth', JSON.stringify(res));
        } catch {
          // ignore storage errors
        }


        setAuthChecked(true);
      } catch (e) {
        // Network error → safest: do not assume returning
        console.error('me.php validation failed:', e);
        // Don't auto-logout on network error, but don't validate either
        // If 401/403, api.ts handles logout automatically
        setAuthChecked(true); 
      }
    })();
  }, [API_BASE]);


  // ✅ Load soundscapes from backend
  useEffect(() => {
    const loadSoundscapes = async () => {
      try {
        const data = await api.getSoundscapes(user?.email);
        if (data && data.length > 0) {
          setSoundscapes(data);
        } else {
          // Fallback default soundscape
          setSoundscapes([defaultSoundscape]);
        }
      } catch (e) {
        console.error('Failed to load soundscapes:', e);
        setSoundscapes([defaultSoundscape]);
      }
    };
    loadSoundscapes();
  }, [user?.email]);


  // ✅ Sync theme from settings
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme]);


  // PreSplash → SplashScreen
  const handlePreSplashComplete = () => {
    console.log('PreSplash complete → going to SplashScreen');
    setCurrentMode(AppMode.SPLASH);
  };


  // SplashScreen → WelcomeScreen
  const handleSplashComplete = () => {
    console.log('SplashScreen complete → going to WelcomeScreen');
    setCurrentMode(AppMode.WELCOME);
  };


  // ✅ WelcomeScreen → next step
  // WelcomeScreen stays sacred/unchanged; it may return DASHBOARD for returning users.
  // We only route to RETURN_PORTAL if the user has been backend-validated.
  const handleWelcomeComplete = (nextMode: AppMode) => {
    console.log('WelcomeScreen complete → going to:', nextMode);


    if (nextMode === AppMode.DASHBOARD) {
      if (user) {
        setCurrentMode(AppMode.RETURN_PORTAL);
        return;
      }
      // If somehow unvalidated, route to AUTH (safe)
      setCurrentMode(AppMode.AUTH);
      return;
    }


    setCurrentMode(nextMode);
  };


  // SacredNamingCeremony → Auth
  const handleSacredNamingComplete = (userData: { name: string }) => {
    console.log('SacredNamingCeremony complete → going to Auth');
    setSacredName(userData.name);
    setCurrentMode(AppMode.AUTH);
  };


  // ✅ FIXED: Auth register → Onboarding (not Dashboard)
  const handleAuthRegister = (account: UserAccount) => {
    console.log('Auth register → going to Onboarding');
    const profile = toUserProfile(account);
    setUser(profile);
    localStorage.setItem('abundance_auth', JSON.stringify(account));
    setAuthChecked(true);
    // NEW USER FLOW: Auth → Onboarding → Tutorial → Dashboard
    setCurrentMode(AppMode.ONBOARDING);
  };


  // ✅ After login, go to Return Portal (not Dashboard)
  const handleAuthLogin = (account: UserAccount) => {
    console.log('Auth login → going to Return Portal');
    const profile = toUserProfile(account);
    setUser(profile);


    // IMPORTANT: store session so refresh survives
    localStorage.setItem('abundance_auth', JSON.stringify(account));


    // We consider this a validated session because backend already authenticated it
    setAuthChecked(true);


    setCurrentMode(AppMode.RETURN_PORTAL);
  };


  // ✅ Onboarding complete → Tutorial
  const handleOnboardingComplete = (profile: UserProfile) => {
    console.log('Onboarding complete → going to Tutorial');
    setUser(profile);
    // Save updated profile to localStorage
    localStorage.setItem('abundance_user', JSON.stringify(profile));
    // Sync focus to backend
    if (user?.email) {
      api.syncProgress({ ...profile, email: user.email });
    }
    setCurrentMode(AppMode.TUTORIAL);
  };


  // ✅ Tutorial complete → Dashboard
  const handleTutorialComplete = () => {
    console.log('Tutorial complete → going to Dashboard');
    setCurrentMode(AppMode.DASHBOARD);
  };


  // ✅ Practice session complete
  const handlePracticeComplete = (log?: GratitudeLog) => {
    console.log('Practice complete → returning to Dashboard');
    stopAmbience();


    if (log && user) {
      // Add gratitude log to user profile
      const updatedUser = {
        ...user,
        gratitudeLogs: [...(user.gratitudeLogs || []), log],
        affirmationsCompleted: (user.affirmationsCompleted || 0) + 1,
      };
      setUser(updatedUser);
      localStorage.setItem('abundance_user', JSON.stringify(updatedUser));
    }


    setPracticeConfig(null);
    setCurrentMode(AppMode.DASHBOARD);
  };


  // ✅ Practice session exit (without completing)
  const handlePracticeExit = () => {
    console.log('Practice exit → returning to Dashboard');
    stopAmbience();
    setPracticeConfig(null);
    setCurrentMode(AppMode.DASHBOARD);
  };


  // ✅ Settings handlers
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('abundance_settings', JSON.stringify(newSettings));
  };


  const handleSettingsBack = () => {
    console.log('Settings back → returning to Dashboard');
    setCurrentMode(AppMode.DASHBOARD);
  };


  const handleReplayTutorial = () => {
    console.log('Replay tutorial');
    setCurrentMode(AppMode.TUTORIAL);
  };


  const handleAudioUpload = async (file: File, category: string) => {
    setUserAudioFile(file);
    if (user?.email) {
      await api.uploadUserAudio(file, category, user.email);
      // Refresh soundscapes
      const data = await api.getSoundscapes(user.email);
      if (data) setSoundscapes(data);
    }
  };


  // ✅ Library handlers
  const handleAddAffirmation = async (text: string, type: PracticeType) => {
    if (!user?.email) return;
    const id = await api.addUserAffirmation(user.email, text, type);
    if (id && user) {
      // Create a temporary Affirmation object for UI (assuming API returned just ID or partial)
      // In a real app, 'id' from api.addUserAffirmation should be the full object or ID
      // If api returns object, cast it:
      const newAffirmation: Affirmation = {
        id: (id as any).id || String(id), 
        text,
        type,
        category: 'Personal',
        isFavorite: true,
        dateAdded: new Date().toISOString(),
      };
      const updatedUser = {
        ...user,
        customAffirmations: [...(user.customAffirmations || []), newAffirmation],
      };
      setUser(updatedUser);
    }
  };


  const handleRemoveAffirmation = async (id: string) => {
    await api.removeUserAffirmation(id);
    if (user) {
      const updatedUser = {
        ...user,
        customAffirmations: (user.customAffirmations || []).filter(a => a.id !== id),
      };
      setUser(updatedUser);
    }
  };


  // ✅ Meditation setup handler
  const handleMeditationBegin = (config: PracticeSessionConfig) => {
    console.log('Meditation begin → starting practice');
    setPracticeConfig(config);
    setCurrentMode(AppMode.PRACTICE);
  };


  // ✅ Change focus handler
  const handleChangeFocus = () => {
    console.log('Change focus → Onboarding');
    setCurrentMode(AppMode.ONBOARDING);
  };


  // ✅ Open Library handler
  const handleOpenLibrary = () => {
    console.log('Dashboard: open library → LIBRARY');
    setCurrentMode(AppMode.LIBRARY);
  };


  // Keep your reset "backdoor" available
  const handleResetAndStartOver = () => {
    localStorage.clear();
    setUser(null);
    setAuthChecked(true);
    setPracticeConfig(null);
    setCurrentMode(AppMode.PRE_SPLASH);
  };


  // Dashboard-required handlers
  const handleStartPractice = (type: PracticeType, duration: number) => {
    console.log('Dashboard: start practice →', type, duration);
    const config: PracticeSessionConfig = {
      type,
      duration,
      focusAreas: user?.focusAreas || [],
      soundscape: type === PracticeType.MORNING_IAM 
        ? soundscapes.find(s => s.id === settings.iAmSoundscapeId) || defaultSoundscape
        : type === PracticeType.EVENING_ILOVE
        ? soundscapes.find(s => s.id === settings.iLoveSoundscapeId) || defaultSoundscape
        : soundscapes.find(s => s.id === settings.meditationSoundscapeId) || defaultSoundscape,
    };
    setPracticeConfig(config);
    setCurrentMode(AppMode.PRACTICE);
  };


  const handleOpenMeditation = () => {
    console.log('Dashboard: open meditation setup');
    setCurrentMode(AppMode.MEDITATION_SETUP);
  };


  const handleOpenSettings = () => {
    console.log('Dashboard: open settings → SETTINGS');
    setCurrentMode(AppMode.SETTINGS);
  };


  const handleSignOut = () => {
    console.log('Dashboard: sign out');
    localStorage.removeItem('abundance_auth');
    setUser(null);
    setAuthChecked(true);
    setCurrentMode(AppMode.AUTH);
  };


  const defaultSoundscape: Soundscape = {
    id: 'default',
    label: 'Default Ambience',
    url: href('assets/audio/ambient/default.mp3'),
  };


  // Get active soundscape based on current practice type or default
  const getActiveSoundscape = (): Soundscape => {
    if (practiceConfig?.soundscape) {
      if (typeof practiceConfig.soundscape === 'string') {
        return soundscapes.find(s => s.id === practiceConfig.soundscape) || defaultSoundscape;
      }
      return practiceConfig.soundscape;
    }
    return soundscapes.find(s => s.id === settings.soundscapeId) || defaultSoundscape;
  };

  // Keep ambient music synced with app-level settings.
  useEffect(() => {
    if (currentMode === AppMode.PRACTICE) return;
    if (currentMode === AppMode.SPLASH) return;
    if (currentMode === AppMode.WELCOME) return;

    const ambienceModes = new Set<AppMode>([
      AppMode.NAMING_CEREMONY,
      AppMode.AUTH,
      AppMode.ONBOARDING,
      AppMode.TUTORIAL,
      AppMode.DASHBOARD,
      AppMode.LIBRARY,
      AppMode.SETTINGS,
      AppMode.STATS,
      AppMode.PROFILE,
      AppMode.RETURN_PORTAL,
      AppMode.MEDITATION_SETUP,
    ]);

    if (settings.musicOn && ambienceModes.has(currentMode)) {
      playAmbience(getActiveSoundscape(), settings.ambienceVolume);
    } else {
      stopAmbience();
    }
  }, [
    currentMode,
    settings.musicOn,
    settings.ambienceVolume,
    settings.soundscapeId,
    soundscapes,
  ]);


  // Render current screen based on mode
  const renderScreen = () => {
    switch (currentMode) {
      case AppMode.PRE_SPLASH:
        return (
          <UniversalLayout showBottomMenu={false}>
            <PreSplash onContinue={handlePreSplashComplete} theme={theme} />
          </UniversalLayout>
        );


      case AppMode.SPLASH:
        return (
          <UniversalLayout showBottomMenu={false}>
            <SplashScreen onComplete={handleSplashComplete} theme={theme} />
          </UniversalLayout>
        );


      case AppMode.WELCOME:
        return (
          <UniversalLayout showBottomMenu={false}>
            <WelcomeScreen
              // IMPORTANT: WelcomeScreen should not use localStorage.
              // It should only see a user when validated by backend (this state).
              user={user as any}
              onComplete={handleWelcomeComplete}
              theme={theme}
            />
          </UniversalLayout>
        );


      case AppMode.NAMING_CEREMONY:
        return (
          <UniversalLayout showBottomMenu={false}>
            <SacredNamingCeremony
              onComplete={handleSacredNamingComplete}
              theme={theme}
            />
          </UniversalLayout>
        );


      case AppMode.AUTH:
        return (
          <UniversalLayout showBottomMenu={false}>
            <Auth
              onRegister={handleAuthRegister}
              onLogin={handleAuthLogin}
              initialName={sacredName}
              theme={theme}
            />
          </UniversalLayout>
        );


      // ✅ Return Portal (PersonalGreeting repurposed)
      case AppMode.RETURN_PORTAL:
        return (
          <UniversalLayout showBottomMenu={false}>
            {user ? (
              <PersonalGreeting
                user={user}
                onContinue={() => setCurrentMode(AppMode.DASHBOARD)}
                onChooseNewFocus={() => setCurrentMode(AppMode.ONBOARDING)}
                theme={theme}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <button
                  onClick={() => setCurrentMode(AppMode.AUTH)}
                  className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90"
                >
                  Continue to Sign In
                </button>
              </div>
            )}
          </UniversalLayout>
        );


      // ✅ ONBOARDING - Focus selection flow
      case AppMode.ONBOARDING:
        return (
          <UniversalLayout showBottomMenu={false}>
            <Onboarding
              onComplete={handleOnboardingComplete}
              initialName={user?.name || sacredName}
            />
          </UniversalLayout>
        );


      // ✅ TUTORIAL - App introduction screens
      case AppMode.TUTORIAL:
        return (
          <UniversalLayout showBottomMenu={false}>
            <TutorialOverlay
              onComplete={handleTutorialComplete}
              onChangeFocus={handleChangeFocus}
              theme={theme}
            />
          </UniversalLayout>
        );


      // ✅ PRACTICE - I Am / I Love / Meditation session
      case AppMode.PRACTICE:
        return (
          <UniversalLayout showBottomMenu={false}>
            {practiceConfig ? (
              <PracticeSession
                config={practiceConfig}
                customAffirmations={user?.customAffirmations || []}
                onComplete={handlePracticeComplete}
                onExit={handlePracticeExit}
                userAudioFile={userAudioFile}
                theme={theme}
                soundscape={getActiveSoundscape()}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">No practice configured</p>
                <button
                  onClick={() => setCurrentMode(AppMode.DASHBOARD)}
                  className="ml-4 px-4 py-2 bg-amber-500 text-black rounded-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </UniversalLayout>
        );


      // ✅ SETTINGS - App settings panel
      case AppMode.SETTINGS:
        return (
          <UniversalLayout showBottomMenu={false}>
            <Settings
              settings={settings}
              onChangeSettings={handleSettingsChange}
              onChangeFocus={handleChangeFocus}
              onBack={handleSettingsBack}
              onSignOut={handleSignOut}
              onReplayTutorial={handleReplayTutorial}
              onAudioUpload={handleAudioUpload}
              theme={theme}
              userAudioFile={userAudioFile}
              availableSoundscapes={soundscapes}
            />
          </UniversalLayout>
        );


      // ✅ LIBRARY (Maktaba) - Affirmations and gratitude logs
      case AppMode.LIBRARY:
        return (
          <UniversalLayout showBottomMenu={true}>
            <Library
              customAffirmations={user?.customAffirmations || []}
              gratitudeLogs={user?.gratitudeLogs || []}
              onAdd={handleAddAffirmation}
              onRemove={handleRemoveAffirmation}
              onAudioUpload={setUserAudioFile}
              userAudioFile={userAudioFile}
              theme={theme}
              soundscapes={soundscapes}
            />
          </UniversalLayout>
        );

      case AppMode.STATS:
        return (
          <UniversalLayout showBottomMenu={true}>
            {user ? (
              <div className="min-h-screen">
                <Stats user={user} />
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setCurrentMode(AppMode.DASHBOARD)}
                    className="px-4 py-2 rounded-lg bg-amber-500 text-black hover:opacity-90"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <button
                  onClick={() => setCurrentMode(AppMode.AUTH)}
                  className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90"
                >
                  Continue to Sign In
                </button>
              </div>
            )}
          </UniversalLayout>
        );

      case AppMode.PROFILE:
        return (
          <UniversalLayout showBottomMenu={true}>
            <div className="min-h-screen flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold mb-2">Profile</h2>
              <p className="text-sm text-slate-300 mb-4">
                Profile details will live here.
              </p>
              <button
                onClick={() => setCurrentMode(AppMode.DASHBOARD)}
                className="px-4 py-2 rounded-lg bg-amber-500 text-black hover:opacity-90"
              >
                Back to Dashboard
              </button>
            </div>
          </UniversalLayout>
        );


      // ✅ MEDITATION_SETUP - Duration and soundscape selection
      case AppMode.MEDITATION_SETUP:
        return (
          <UniversalLayout showBottomMenu={false}>
            <MeditationSetup
              onBack={() => setCurrentMode(AppMode.DASHBOARD)}
              onBegin={handleMeditationBegin}
              theme={theme}
              availableSoundscapes={soundscapes}
            />
          </UniversalLayout>
        );


      case AppMode.DASHBOARD:
        return (
          <UniversalLayout showBottomMenu={true}>
            {user ? (
              <Dashboard
                user={user}
                theme={theme}
                onStartPractice={handleStartPractice}
                onOpenSettings={handleOpenSettings}
                onOpenProfile={() => setCurrentMode(AppMode.PROFILE)}
                musicOn={settings.musicOn}
                ambienceVolume={settings.ambienceVolume}
                onToggleMusic={() =>
                  handleSettingsChange({ ...settings, musicOn: !settings.musicOn })
                }
                onVolumeChange={(volume) =>
                  handleSettingsChange({ ...settings, ambienceVolume: volume })
                }
                onSignOut={handleSignOut}
                activeSoundscape={getActiveSoundscape()}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <button
                  onClick={() => setCurrentMode(AppMode.AUTH)}
                  className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90"
                >
                  Continue to Sign In
                </button>
              </div>
            )}


            <button
              onClick={handleResetAndStartOver}
              className="fixed bottom-4 right-4 px-3 py-2 bg-amber-500 text-black rounded-lg hover:opacity-90 shadow-lg text-xs"
              aria-label="Reset and start over"
              title="Reset & Start Over"
            >
              Reset
            </button>
          </UniversalLayout>
        );


      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p>Screen not found: {currentMode}</p>
            <button
              onClick={() => setCurrentMode(AppMode.PRE_SPLASH)}
              className="ml-4 px-4 py-2 bg-amber-500 text-black rounded-lg"
            >
              Restart from PreSplash
            </button>
          </div>
        );
    }
  };


  return (
    <div className="App">
      <Layout
        mode={currentMode}
        practiceType={practiceConfig?.type}
        theme={theme}
      >
        {renderScreen()}
      </Layout>
    </div>
  );
}


export default App;
