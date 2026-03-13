// components/Auth.tsx - controlled sacred auth flow with explicit login/register intent
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserAccount } from '../types';
import { Lock, Mail, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { SacredBackground } from './SacredBackground';
import BreathingOrb from './BreathingOrb';
import { SACRED_LAYOUT, SACRED_TITLE_CARD, SACRED_BODY_CARD } from '../styles/sacredCards';

type AuthMode = 'login' | 'register';

interface AuthProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onRegister: (account: UserAccount) => void;
  onLogin: (account: UserAccount) => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
  initialName?: string;
}

// Auth uses the shared sacred design system for consistency with S1-S4 entry flow.
// S1–S4 always dark — single card style regardless of user theme
const getContentCardClasses = (_theme: 'light' | 'dark') =>
  `${SACRED_BODY_CARD} space-y-3 md:space-y-4 max-w-[300px] md:max-w-[360px] px-4 py-4 md:px-5 md:py-5`;

export const Auth: React.FC<AuthProps> = ({
  mode,
  onModeChange,
  onRegister,
  onLogin,
  onBack,
  theme,
  initialName = '',
}) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const previousModeRef = useRef<AuthMode>(mode);

  useEffect(() => {
    if (previousModeRef.current !== mode) {
      previousModeRef.current = mode;
      setError('');
      setResetStatus('');
      setShowPassword(false);
      setEmail('');
      setPassword('');
      setName(mode === 'register' ? initialName : '');
      return;
    }

    if (mode === 'register') {
      setName((prev) => (prev ? prev : initialName));
    }
  }, [initialName, mode]);

  // Autofill controls (best-effort across browsers)
  const formAutoComplete = useMemo(() => {
    // For register, many browsers ignore "off", but "new-password" helps steer password managers.
    return mode === 'register' ? 'new-password' : 'on';
  }, [mode]);

  const inputNames = useMemo(() => {
    // Distinct field names reduce aggressive autofill collisions between login/register.
    return mode === 'register'
      ? {
          email: 'signup_email',
          password: 'signup_password',
          name: 'signup_name',
        }
      : {
          email: 'login_email',
          password: 'login_password',
          name: 'login_name',
        };
  }, [mode]);

  const emailAutoComplete = mode === 'register' ? 'off' : 'email';
  const passwordAutoComplete = mode === 'register' ? 'new-password' : 'current-password';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (mode === 'register' && !name) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        const data = await api.register(name, email, password);

        const newAccount: UserAccount = {
          id: data?.id,
          email: data?.email ?? email,
          name: data?.name ?? name,
          streak: data?.streak,
          level: data?.level,
          focusAreas: data?.focusAreas,
          affirmationsCompleted: data?.affirmationsCompleted,
        };

        localStorage.setItem('abundance_auth', JSON.stringify(newAccount));
        setLoading(false);
        onRegister(newAccount);
      } else {
        const data = await api.login(email, password);

        setLoading(false);
        const account: UserAccount = {
          id: data?.id,
          email: data?.email ?? email,
          name: data?.name,
          streak: data?.streak,
          level: data?.level,
          focusAreas: data?.focusAreas,
          affirmationsCompleted: data?.affirmationsCompleted,
        };
        localStorage.setItem('abundance_auth', JSON.stringify(account));
        onLogin(account);
      }
    } catch (err: any) {
      console.error(err);
      if ((err instanceof ApiError || typeof err?.status === 'number') && err?.status === 401) {
        setError(
          mode === 'login'
            ? 'We could not find an active account with those credentials. Choose Sign Up if you are beginning again.'
            : 'Those details could not be used to create an account.'
        );
      } else {
        setError(err?.message || 'Authentication failed. Please check your connection.');
      }
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const nextEmail = email.trim();
    if (!nextEmail) {
      setError('Enter your email above, then choose Forgot Password.');
      return;
    }

    setError('');
    setResetStatus('');
    setResetLoading(true);
    try {
      const response = await api.requestPasswordReset(nextEmail);
      setResetStatus(
        response?.message || 'If an account exists for that email, a reset link has been sent.'
      );
    } catch (err: any) {
      setError(err?.message || 'We could not start password recovery. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // S1–S4 always dark ceremonial path
  const textColor = 'text-white';
  const subTextColor = 'text-white';
  const inputBg = 'bg-slate-800/80 border-slate-600 text-white placeholder-slate-400';

  return (
    <SacredBackground
      theme="dark"
      backgroundType="AUTH"
      fallbackBackgroundType="SPLASH"
    >
      <div className={SACRED_LAYOUT}>
        <BreathingOrb size={80} breathingSpeed={4000} />

        <div className={SACRED_TITLE_CARD}>
          <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
            Abundance Alchemy
          </h1>
        </div>

        <div className={`${getContentCardClasses(theme)} relative`}>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-amber-500/20 bg-slate-950/70 p-1 shadow-xl">
            <button
              type="button"
              onClick={() => onModeChange('register')}
              className={`rounded-xl px-3 py-2 text-xs font-bold tracking-[0.16em] uppercase transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg'
                  : 'text-amber-200/75 hover:bg-amber-500/10'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className={`rounded-xl px-3 py-2 text-xs font-bold tracking-[0.16em] uppercase transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg'
                  : 'text-amber-200/75 hover:bg-amber-500/10'
              }`}
            >
              Sign In
            </button>
          </div>

          {mode === 'register' && (
            <div className="flex justify-center -mt-1 mb-3 md:mb-4">
              <img
                src="https://abundantthought.com/abundance-alchemy/logo.png"
                alt="Abundance Alchemy"
                className="h-14 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="text-center space-y-2">
            <h2 className={`text-base md:text-lg ${mode === 'login' ? 'font-bold' : 'font-normal'} ${textColor}`}>
              {mode === 'login' ? 'Welcome Back' : 'Greetings and Namaste!'}
            </h2>

            {mode === 'login' ? (
              <p className={`text-xs md:text-sm ${subTextColor}`}>Continue your transformation</p>
            ) : (
              <div className="space-y-1">
                <p className={`text-[11px] md:text-xs tracking-[0.08em] uppercase text-amber-300`}>
                  Naming Ceremony Complete
                </p>
                <p className={`text-sm md:text-sm ${textColor}`}>
                  To complete account creation process,
                  <br />
                  set password now
                  <br />
                  and provide your email.
                </p>
                <p className={`text-xs ${subTextColor}`}>
                  So Let It Be Written.
                  <br />
                  So Let It Be Down.
                </p>
              </div>
            )}
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className={`absolute top-6 left-6 flex items-center space-x-1 text-xs ${subTextColor} hover:text-amber-400 transition-colors`}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}

          {/* Auth Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3 md:space-y-4 mt-3 md:mt-4"
            autoComplete={formAutoComplete}
          >
            {/* Autofill bait fields (best-effort): keeps browsers from stuffing the real fields on register */}
            {mode === 'register' && (
              <div className="hidden" aria-hidden="true">
                <input type="text" name="username" autoComplete="username" tabIndex={-1} />
                <input type="password" name="password" autoComplete="current-password" tabIndex={-1} />
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <label className={`text-xs font-bold ${subTextColor}`}>Name</label>
                <div className="relative">
                  <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} />
                  <input
                    type="text"
                    name={inputNames.name}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={`w-full pl-9 pr-3 py-2 md:py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg}`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={`text-xs font-bold ${subTextColor}`}>Email</label>
              <div className="relative">
                <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} />
                <input
                  type="email"
                  name={inputNames.email}
                  autoComplete={emailAutoComplete}
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full pl-9 pr-3 py-2 md:py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold ${subTextColor}`}>Password</label>
              <div className="relative">
                <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name={inputNames.password}
                  autoComplete={passwordAutoComplete}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 md:py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${subTextColor} hover:text-amber-400`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="text-amber-300 hover:text-amber-200 underline disabled:opacity-60"
                >
                  {resetLoading ? 'Sending Reset Link...' : 'Forgot Password?'}
                </button>
                <span className="text-slate-300">Need help getting back in?</span>
              </div>
            )}

            {error && (
              <div className="backdrop-blur-sm rounded-xl border border-amber-500/30 p-3 text-xs text-amber-400 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                <div className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {resetStatus && (
              <div className="backdrop-blur-sm rounded-xl border border-emerald-400/30 p-3 text-xs text-emerald-200 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5">
                <span className="font-medium">{resetStatus}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 mt-1 md:mt-2"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div
            className={`text-center text-xs ${subTextColor} pt-2 md:pt-3 border-t border-slate-700/30 mt-3 md:mt-4`}
          >
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                const next = mode === 'login' ? 'register' : 'login';
                onModeChange(next);
              }}
              className="text-amber-400 hover:text-amber-300 font-bold underline ml-1"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        <div className="h-6 md:h-4"></div>
      </div>
    </SacredBackground>
  );
};
