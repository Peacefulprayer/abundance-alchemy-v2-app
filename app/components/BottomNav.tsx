import React from 'react';
import { Home, BookOpen, HandHeart, Settings, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppMode } from '../types';
import { buttonSoundService } from '../services/buttonSoundService';

interface BottomNavProps {
  mode: AppMode;
  onNavigate: (mode: AppMode) => void;
}

type NavItem = {
  key: AppMode;
  label: string;
  subLabel?: string;
  icon: LucideIcon;
  center?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: AppMode.DASHBOARD, label: 'Home', icon: Home },
  { key: AppMode.LIBRARY, label: 'Maktaba', icon: BookOpen },
  { key: AppMode.PRAYER_SETUP, label: 'Omba', subLabel: 'Pray', icon: HandHeart, center: true },
  { key: AppMode.SETTINGS, label: 'Settings', icon: Settings },
  { key: AppMode.STATS, label: 'Stats', icon: BarChart3 }
];

export const BottomNav: React.FC<BottomNavProps> = ({ mode, onNavigate }) => {
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[420px] md:max-w-[520px] z-50">
      <div className="relative w-full rounded-2xl border border-slate-700/40 bg-slate-900/70 backdrop-blur-lg px-2 py-2 shadow-2xl">
        <div className="flex items-end justify-between">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.key;

            if (item.center) {
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    buttonSoundService.play('click');
                    onNavigate(item.key);
                  }}
                  className="flex flex-col items-center gap-1 -mt-6 px-3"
                  aria-label={item.label}
                >
                  <div className="h-11 w-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black flex items-center justify-center shadow-xl">
                    <Icon size={17} />
                  </div>
                  <div className="flex flex-col items-center leading-tight">
                    <span className="text-[9px] font-semibold tracking-wide text-slate-100 uppercase">{item.label}</span>
                    <span className="text-[10px] text-slate-200">{item.subLabel ?? item.label}</span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => {
                  buttonSoundService.play('click');
                  onNavigate(item.key);
                }}
                className="flex flex-col items-center gap-1 px-3"
                aria-label={item.label}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-amber-400' : 'text-slate-400'}
                />
                <span
                  className={`text-[10px] ${
                    isActive ? 'text-amber-300' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
