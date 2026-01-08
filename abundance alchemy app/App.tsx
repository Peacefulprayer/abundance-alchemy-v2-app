// App.tsx - FIXED: Backend-validated returning-user detection (me.php) + sacred flow preserved
import React, { useState, useEffect } from 'react';
import { AppMode, UserAccount, UserProfile, Soundscape } from './types';
import UniversalLayout from './components/UniversalLayout';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import PreSplash from './components/PreSplash';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PersonalGreeting } from './components/PersonalGreeting';
import { SacredNamingCeremony } from './components/SacredNamingCeremony';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function App() {
  // START WITH PRE_SPLASH (not SPLASH)
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.PRE_SPLASH);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Dashboard expects UserProfile
  const [user, setUser] = useState<UserProfile | null>(null);

  const [sacredName, setSacredName] = useState<string>('');

  // ✅ Step 3: backend-validated session check
  const [authChecked, setAuthChecked] = useState(false);

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE_URL ?? '/abundance-alchemy/api';

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
      cyclePreference: anyAcc.cyclePreference ?? 'standard',
      streak: anyAcc.streak ?? 0,
      level: anyAcc.level ?? 1,

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
        const res = await fetch(
          `${API_BASE}/me.php?email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
          }
        );

        if (!res.ok) {
          // User deleted or invalid session → clear and treat as new user
          localStorage.removeItem('abundance_auth');
          setUser(null);
          setAuthChecked(true);
          return;
        }

        const data = await res.json();

        // Hydrate from backend-validated profile
        setUser(toUserProfile(data));

        // Optional: refresh stored auth with validated data (keeps email/name in sync)
        try {
          localStorage.setItem('abundance_auth', JSON.stringify(data));
        } catch {
          // ignore storage errors
        }

        setAuthChecked(true);
      } catch (e) {
        // Network error → safest: do not assume returning
        console.error('me.php validation failed:', e);
        localStorage.removeItem('abundance_auth');
        setUser(null);
        setAuthChecked(true);
      }
    })();
  }, [API_BASE]);

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

  const handleAuthRegister = (account: UserAccount) => {
    console.log('Auth register → going to Dashboard');
    const profile = toUserProfile(account);
    setUser(profile);
    localStorage.setItem('abundance_auth', JSON.stringify(account));
    setAuthChecked(true);
    setCurrentMode(AppMode.DASHBOARD);
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

  // Keep your reset “backdoor” available
  const handleResetAndStartOver = () => {
    localStorage.clear();
    setUser(null);
    setAuthChecked(true);
    setCurrentMode(AppMode.PRE_SPLASH);
  };

  // Dashboard-required handlers
  const handleStartPractice = () => {
    console.log('Dashboard: start practice → PRACTICE');
    setCurrentMode(AppMode.PRACTICE);
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
    url: '/abundance-alchemy/assets/audio/ambient/default.mp3',
  };

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

      case AppMode.DASHBOARD:
        return (
          <UniversalLayout showBottomMenu={true}>
            {user ? (
              <Dashboard
                user={user}
                theme={theme}
                onStartPractice={handleStartPractice as any}
                onOpenSettings={handleOpenSettings}
                onSignOut={handleSignOut}
                activeSoundscape={defaultSoundscape}
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

  return <div className="App">{renderScreen()}</div>;
}

export default App;