// components/Auth.tsx - UPDATED: signup autofill suppression (best-effort) + initialName support preserved
import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount } from '../types';
import { Lock, Mail, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { SacredBackground } from './SacredBackground';
import BreathingOrb from './BreathingOrb';

interface AuthProps {
  onRegister: (account: UserAccount) => void;
  onLogin: (account: UserAccount) => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
  initialName?: string;
}

// UNIVERSAL TITLE CARD CLASSES (exact match WelcomeScreen)
const titleCardClasses =
  'backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10';

// UNIVERSAL CONTENT CARD CLASSES
const getContentCardClasses = (theme: 'light' | 'dark') =>
  theme === 'light'
    ? 'backdrop-blur-lg rounded-2xl border border-slate-200 p-4 md:p-6 w-full max-w-[280px] shadow-2xl space-y-4 md:space-y-6 bg-white/88'
    : 'backdrop-blur-lg rounded-2xl border border-amber-500/20 p-4 md:p-6 w-full max-w-[280px] shadow-2xl space-y-4 md:space-y-6 bg-slate-900/40';

export const Auth: React.FC<AuthProps> = ({
  onRegister,
  onLogin,
  onBack,
  theme,
  initialName = '',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(() =>
    initialName.trim() ? 'register' : 'login'
  );
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Keep naming ceremony name if it changes upstream
  useEffect(() => {
    setName((prev) => (prev ? prev : initialName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName]);

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
      setError(err?.message || 'Authentication failed. Please check your connection.');
      setLoading(false);
    }
  };

  // Theme colors
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const inputBg = theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900/50 border-slate-700';

  return (
    <SacredBackground
      theme={theme}
      backgroundType="AUTH"
      fallbackBackgroundType="SECTION_ENTRY"
    >
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 space-y-4 md:space-y-5 overflow-y-auto">
        <div className="mt-8 md:mt-12 mb-4 md:mb-6">
          <BreathingOrb size={80} breathingSpeed={4000} />
        </div>

        <div className={`${titleCardClasses} mb-4 md:mb-6`}>
          <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
            Abundance Alchemy
          </h1>
        </div>

        <div className={`${getContentCardClasses(theme)} mb-6 md:mb-8 relative`}>
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
            <h2 className={`text-base md:text-lg font-bold ${textColor}`}>
              {mode === 'login' ? 'Welcome Back' : 'Greetings and Namaste!'}
            </h2>

            {mode === 'login' ? (
              <p className={`text-xs md:text-sm ${subTextColor}`}>Continue your transformation</p>
            ) : (
              <div className="space-y-1">
                <p className={`text-sm md:text-sm font-medium ${textColor}`}>Initiate Your Account Now</p>
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
                    className={`w-full pl-9 pr-3 py-2 md:py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg} ${textColor}`}
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
                  className={`w-full pl-9 pr-3 py-2 md:py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg} ${textColor}`}
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
                  className={`w-full pl-9 pr-10 py-2 md:py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg} ${textColor}`}
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

            {error && (
              <div className="backdrop-blur-sm rounded-xl border border-amber-500/30 p-3 text-xs text-amber-400 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                <div className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                  <span className="font-medium">{error}</span>
                </div>
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
                setMode(next);
                setError('');
                setShowPassword(false);
                setName(next === 'register' ? initialName : '');
                setEmail('');
                setPassword('');
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
