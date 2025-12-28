// components/PersonalGreeting.tsx
import React, { useState } from 'react';

interface PersonalGreetingProps {
  onComplete: (nickname: string) => void;
  theme?: 'light' | 'dark';
  // userName prop removed to match App.tsx usage
}

export const PersonalGreeting: React.FC<PersonalGreetingProps> = ({
  onComplete,
  theme = 'dark',
}) => {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(nickname || 'Traveler');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <h2 className="text-2xl text-amber-400 mb-6 text-center">
          What should we call you?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter a nickname"
            className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-lg text-white"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};