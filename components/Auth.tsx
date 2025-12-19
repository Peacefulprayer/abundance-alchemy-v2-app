import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Lock, Mail, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AlchemistAvatar } from './AlchemistAvatar';
import { apiService } from '../services/apiService';

interface AuthProps {
  onRegister: (account: UserAccount) => void;
  onLogin: (account: UserAccount) => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Auth: React.FC<AuthProps> = ({ onRegister, onLogin, onBack, theme }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        // 1. Check local storage to prevent duplicate local accounts (basic check)
        const existingAuth = localStorage.getItem('abundance_auth');
        if (existingAuth) {
          const existing = JSON.parse(existingAuth);
          if (existing.email === email) {
            setError('Email already registered locally. Please login.');
            setLoading(false);
            return;
          }
        }

        // 2. Register on Server (Connects to your Admin Dashboard)
        await apiService.register(name, email, password);
        
        // 3. Create Local Account Object
        const newAccount: UserAccount = {
          email,
          name,
          password: btoa(password) // Basic encoding for local storage
        };

        // 4. Save and Proceed
        localStorage.setItem('abundance_auth', JSON.stringify(newAccount));
        setLoading(false);
        onRegister(newAccount);

      } else {
        // LOGIN FLOW
        const storedAuth = localStorage.getItem('abundance_auth');
        
        if (!storedAuth) {
          setError('No account found on this device. Please register.');
          setLoading(false);
          return;
        }

        const authData = JSON.parse(storedAuth);
        
        // Check password (handling both raw and encoded legacy versions)
        const storedPwd = authData.password || authData.passwordHash;
        const isPasswordMatch = 
          storedPwd === btoa(password) || 
          storedPwd === password;

        if (authData.email !== email) {
          setError('Email not found.');
          setLoading(false);
          return;
        }

        if (!isPasswordMatch) {
          setError('Incorrect password.');
          setLoading(false);
          return;
        }

        // Optional: Verify with server
        await apiService.login(email, password);

        setLoading(false);
        onLogin(authData);
      }
    } catch (err: any) {
      console.error(err);
      setError('Authentication failed. Please check your connection.');
      setLoading(false);
    }
  };

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900/50 border-slate-700';
  const cardBg = theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/80 border-slate-700';

  return (
    <div className={`h-full flex flex-col items-center justify-center p-8 space-y-6 max-w-md mx-auto relative ${textColor}`}>
      {onBack && (
        <button
          onClick={onBack}
          className={`absolute top-4 left-4 flex items-center space-x-2 text-xs ${subTextColor} hover:text-amber-400 transition-colors`}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      )}

      <div className="relative">
        <img 
          src="/logo.png" 
          alt="Abundant Thought" 
          className="h-16 object-contain mx-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
        />
      </div>

      <AlchemistAvatar size="md" mood="calm" speaking={false} />

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? 'Welcome Back' : 'Begin Your Journey'}
        </h1>
        <p className={`text-sm ${subTextColor}`}>
          {mode === 'login' 
            ? 'Continue your transformation' 
            : 'Create your account to start practicing'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`w-full space-y-4 rounded-2xl p-6 border shadow-xl ${cardBg}`}>
        {mode === 'register' && (
          <div className="space-y-2">
            <label className={`text-xs font-bold ${subTextColor}`}>Name</label>
            <div className="relative">
              <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg} ${textColor}`}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className={`text-xs font-bold ${subTextColor}`}>Email</label>
          <div className="relative">
            <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg} ${textColor}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`text-xs font-bold ${subTextColor}`}>Password</label>
          <div className="relative">
            <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor}`} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all ${inputBg} ${textColor}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${subTextColor} hover:text-amber-400`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className={`text-sm ${subTextColor}`}>
        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
            setName('');
            setEmail('');
            setPassword('');
          }}
          className="text-amber-400 hover:text-amber-300 font-bold underline"
        >
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};
