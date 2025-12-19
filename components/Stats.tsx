import React from 'react';
import { UserProfile } from '../types';
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react';

interface StatsProps {
  user: UserProfile;
}

export const Stats: React.FC<StatsProps> = ({ user }) => {
  return (
    <div className="h-full p-4 max-w-md mx-auto text-slate-100 pb-24 overflow-y-auto custom-scrollbar">
      <h1 className="text-2xl font-serif font-bold mb-6">Your Journey</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy size={20} className="text-amber-200" />
            <span className="text-xs font-bold text-amber-200">Streak</span>
          </div>
          <p className="text-3xl font-bold">{user.streak}</p>
          <p className="text-xs text-amber-200">Days</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Zap size={20} className="text-indigo-200" />
            <span className="text-xs font-bold text-indigo-200">Level</span>
          </div>
          <p className="text-3xl font-bold">{user.level}</p>
          <p className="text-xs text-indigo-200">Alchemist</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={20} className="text-emerald-200" />
            <span className="text-xs font-bold text-emerald-200">Focus</span>
          </div>
          <p className="text-sm font-bold truncate">{user.focusAreas[0]?.label || 'Focus'}</p>
          <p className="text-xs text-emerald-200">{user.cyclePreference}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={20} className="text-pink-200" />
            <span className="text-xs font-bold text-pink-200">Sessions</span>
          </div>
          <p className="text-3xl font-bold">{user.affirmationsCompleted}</p>
          <p className="text-xs text-pink-200">Total</p>
        </div>
      </div>

      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 border border-slate-700 shadow-xl">
        <h2 className="text-lg font-serif font-bold mb-4">Progress Overview</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Affirmation Master</span>
              <span className="text-amber-400 font-bold">{Math.min(100, (user.affirmationsCompleted / 100) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (user.affirmationsCompleted / 100) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Consistency Streak</span>
              <span className="text-indigo-400 font-bold">{Math.min(100, (user.streak / 30) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (user.streak / 30) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Journal Entries</span>
              <span className="text-emerald-400 font-bold">{user.gratitudeLogs.length}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (user.gratitudeLogs.length / 50) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 border border-slate-700 shadow-xl">
        <h2 className="text-lg font-serif font-bold mb-3">Achievements</h2>
        <div className="space-y-2">
          {user.streak >= 7 && (
            <div className="flex items-center space-x-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Trophy size={20} className="text-amber-500" />
              <div>
                <p className="text-sm font-bold">Week Warrior</p>
                <p className="text-xs text-slate-400">7-day streak achieved</p>
              </div>
            </div>
          )}
          {user.affirmationsCompleted >= 50 && (
            <div className="flex items-center space-x-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Zap size={20} className="text-indigo-500" />
              <div>
                <p className="text-sm font-bold">Practice Master</p>
                <p className="text-xs text-slate-400">50 sessions completed</p>
              </div>
            </div>
          )}
          {user.gratitudeLogs.length >= 10 && (
            <div className="flex items-center space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Target size={20} className="text-purple-500" />
              <div>
                <p className="text-sm font-bold">Reflection Expert</p>
                <p className="text-xs text-slate-400">10 journal entries</p>
              </div>
            </div>
          )}
          {user.streak < 7 && user.affirmationsCompleted < 50 && user.gratitudeLogs.length < 10 && (
            <p className="text-sm text-slate-400 text-center py-4">Keep practicing to unlock achievements!</p>
          )}
        </div>
      </div>
    </div>
  );
};