import React, { useState } from 'react';
import { AppSettings, Soundscape } from '../types';
import { ArrowLeft, Sun, Moon, Volume2, Bell, Music, RefreshCw, LogOut, Palette, Clock, Upload } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';

interface SettingsProps {
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
  onChangeFocus: () => void;
  onBack: () => void;
  onSignOut: () => void;
  onReplayTutorial: () => void;
  onAudioUpload: (file: File, category: string) => void;
  theme: 'light' | 'dark';
  userAudioFile: File | null;
  availableSoundscapes: Soundscape[];
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onChangeSettings,
  onChangeFocus,
  onBack,
  onSignOut,
  onReplayTutorial,
  onAudioUpload,
  theme,
  userAudioFile,
  availableSoundscapes
}) => {
  const [uploadCategory, setUploadCategory] = useState('MEDITATION');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-400';
  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-700';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-600';

  // Helper to safely check category
  const normalize = (cat: string | undefined) => (cat || '').toUpperCase();

  // Filter soundscapes by category - Case Insensitive for robustness
  // Admin 'Ambience' or 'GENERAL' -> App Ambience
  const ambienceTracks = availableSoundscapes.filter(s => {
    const cat = normalize(s.category as string);
    return !['MEDITATION', 'MORNING_IAM', 'EVENING_ILOVE', 'CHANT', 'OM'].includes(cat);
  });
  
  // Admin 'Music' or 'MUSIC' or 'MORNING_IAM' -> I Am Practice
  const iAmTracks = availableSoundscapes.filter(s => 
    ['MORNING_IAM', 'MUSIC', 'GENERAL'].includes(normalize(s.category as string))
  );
  
  // Admin 'Music' or 'MUSIC' or 'EVENING_ILOVE' -> I Love Practice
  const iLoveTracks = availableSoundscapes.filter(s => 
    ['EVENING_ILOVE', 'MUSIC', 'GENERAL'].includes(normalize(s.category as string))
  );
  
  // Admin 'Meditation' / 'MEDITATION' / 'MUSIC' -> Meditation Practice
  const meditationTracks = availableSoundscapes.filter(s => 
    ['MEDITATION', 'MUSIC'].includes(normalize(s.category as string))
  );

  const toggleTheme = () => {
    buttonSoundService.play('click');
    onChangeSettings({ ...settings, theme: theme === 'light' ? 'dark' : 'light' });
  };

  const toggleSoundEffects = () => {
    buttonSoundService.play('click');
    onChangeSettings({ ...settings, soundEffectsOn: !settings.soundEffectsOn });
  };

  const toggleMusic = () => {
    buttonSoundService.play('click');
    onChangeSettings({ ...settings, musicOn: !settings.musicOn });
  };

  const updateVolume = (volume: number) => {
    onChangeSettings({ ...settings, ambienceVolume: volume });
  };

  // Helper to handle specific soundscape updates
  const updateSpecificSoundscape = (key: keyof AppSettings, id: string) => {
    buttonSoundService.play('click');
    onChangeSettings({ ...settings, [key]: id });
  };

  // Reminder Handlers
  const toggleReminders = () => {
    buttonSoundService.play('click');
    onChangeSettings({ 
      ...settings, 
      reminders: { ...settings.reminders, enabled: !settings.reminders.enabled } 
    });
  };

  const updateReminderMode = (mode: 'INTERVAL' | 'SPECIFIC_TIMES') => {
    buttonSoundService.play('click');
    onChangeSettings({ 
      ...settings, 
      reminders: { ...settings.reminders, mode } 
    });
  };

  const updateInterval = (minutes: number) => {
    buttonSoundService.play('click');
    onChangeSettings({ 
      ...settings, 
      reminders: { ...settings.reminders, intervalMinutes: minutes } 
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    buttonSoundService.play('click');
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (uploadFile) {
      buttonSoundService.play('confirm');
      onAudioUpload(uploadFile, uploadCategory);
      setUploadFile(null);
    }
  };

  // Helper to append badge to label
  const getSourceLabel = (s: Soundscape) => {
    // If ID is numeric (from DB) or url has 'user_', it's Cloud. Default/Hardcoded is System.
    const isCloud = !isNaN(Number(s.id)) || s.url?.includes('user_');
    return isCloud ? `${s.label} (Cloud)` : `${s.label} (System)`;
  };

  return (
    <div className={`h-full flex flex-col p-4 max-w-md mx-auto ${textColor} pb-24 overflow-y-auto custom-scrollbar`}>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            buttonSoundService.play('back');
            onBack();
          }}
          className={`flex items-center space-x-2 text-sm ${subTextColor} hover:opacity-100 transition-opacity`}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-serif font-bold">Settings</h1>
        <div className="w-16"></div>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <div className={`rounded-2xl p-4 border shadow-lg ${cardBg}`}>
          <h3 className="text-sm font-bold mb-4 flex items-center space-x-2">
            <Palette size={16} className="text-purple-500" />
            <span>Appearance</span>
          </h3>
          
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
              theme === 'light' 
                ? 'bg-slate-100 border-slate-300' 
                : 'bg-slate-800 border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              {theme === 'light' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-400" />}
              <div className="text-left">
                <p className="text-sm font-bold">{theme === 'light' ? 'Day Mode' : 'Night Mode'}</p>
                <p className={`text-xs ${subTextColor}`}>Tap to switch</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'} relative`}>
              <div className={`absolute top-1 ${theme === 'dark' ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`} />
            </div>
          </button>
        </div>

        {/* Audio Settings */}
        <div className={`rounded-2xl p-4 border shadow-lg ${cardBg}`}>
          <h3 className="text-sm font-bold mb-4 flex items-center space-x-2">
            <Volume2 size={16} className="text-emerald-500" />
            <span>Audio</span>
          </h3>

          <div className="space-y-6">
            {/* Global Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Master Volume</span>
                <span className="text-xs text-amber-500 font-bold">{settings.ambienceVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.ambienceVolume}
                onChange={(e) => updateVolume(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">Controls volume for ambience and music.</p>
            </div>

            {/* Toggles */}
            <div className="flex justify-start gap-8">
               <div className="flex items-center space-x-4">
                <span className="text-sm w-12">Effects</span>
                <button onClick={toggleSoundEffects} className={`w-10 h-5 rounded-full transition-colors ${settings.soundEffectsOn ? 'bg-emerald-600' : 'bg-slate-600'} relative`}>
                  <div className={`absolute top-0.5 ${settings.soundEffectsOn ? 'right-0.5' : 'left-0.5'} w-4 h-4 bg-white rounded-full transition-all`} />
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm w-12">Music</span>
                <button onClick={toggleMusic} className={`w-10 h-5 rounded-full transition-colors ${settings.musicOn ? 'bg-emerald-600' : 'bg-slate-600'} relative`}>
                  <div className={`absolute top-0.5 ${settings.musicOn ? 'right-0.5' : 'left-0.5'} w-4 h-4 bg-white rounded-full transition-all`} />
                </button>
              </div>
            </div>

            {/* Soundscape Sections */}
            <div className="space-y-3 pt-2 border-t border-slate-700/30">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Soundscapes</h4>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">App Ambience (Background)</label>
                <select
                  value={settings.soundscapeId}
                  onChange={(e) => updateSpecificSoundscape('soundscapeId', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg} ${textColor}`}
                >
                  <option value="">Select Ambience</option>
                  {ambienceTracks.map((s) => (
                    <option key={s.id} value={s.id}>{getSourceLabel(s)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">I Am Practice Music</label>
                <select
                  value={settings.iAmSoundscapeId}
                  onChange={(e) => updateSpecificSoundscape('iAmSoundscapeId', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg} ${textColor}`}
                >
                  <option value="">Use Default</option>
                  {iAmTracks.map((s) => (
                    <option key={s.id} value={s.id}>{getSourceLabel(s)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">I Love Practice Music</label>
                <select
                  value={settings.iLoveSoundscapeId}
                  onChange={(e) => updateSpecificSoundscape('iLoveSoundscapeId', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg} ${textColor}`}
                >
                  <option value="">Use Default</option>
                  {iLoveTracks.map((s) => (
                    <option key={s.id} value={s.id}>{getSourceLabel(s)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Meditation Music</label>
                <select
                  value={settings.meditationSoundscapeId}
                  onChange={(e) => updateSpecificSoundscape('meditationSoundscapeId', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg} ${textColor}`}
                >
                  <option value="">Use Default</option>
                  {meditationTracks.map((s) => (
                    <option key={s.id} value={s.id}>{getSourceLabel(s)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload Section */}
            <div className="pt-4 border-t border-slate-700/30">
               <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Upload Your Music</h4>
               
               <div className="space-y-3">
                 <div className="flex rounded-lg overflow-hidden border border-slate-600/50">
                   {['MORNING_IAM', 'EVENING_ILOVE', 'MEDITATION', 'AMBIENCE'].map((cat) => (
                     <button
                        key={cat}
                        onClick={() => {
                          buttonSoundService.play('click');
                          setUploadCategory(cat);
                        }}
                        className={`flex-1 py-2 text-[8px] sm:text-[10px] font-bold transition-colors ${
                          uploadCategory === cat 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                        }`}
                     >
                       {cat === 'MORNING_IAM' ? 'I Am' : cat === 'EVENING_ILOVE' ? 'I Love' : cat === 'MEDITATION' ? 'Meditation' : 'Ambience'}
                     </button>
                   ))}
                 </div>

                 <label className={`flex items-center justify-between p-3 rounded-xl border border-dashed cursor-pointer transition-colors ${uploadFile ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-500 hover:border-emerald-400'}`}>
                    <div className="flex items-center space-x-3">
                      <Music size={18} className={uploadFile ? 'text-emerald-500' : 'text-slate-400'} />
                      <span className={`text-sm ${uploadFile ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {uploadFile ? uploadFile.name : 'Choose Audio File...'}
                      </span>
                    </div>
                    <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                 </label>

                 {uploadFile && (
                   <button 
                    onClick={handleUploadSubmit}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center justify-center space-x-2"
                   >
                     <Upload size={16} />
                     <span>Upload to {uploadCategory.replace('_', ' ')}</span>
                   </button>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Daily Reminders */}
        <div className={`rounded-2xl p-4 border shadow-lg ${cardBg}`}>
          <div className="flex items-center justify_between mb-4">
            <h3 className="text-sm font-bold flex items-center space-x-2">
              <Clock size={16} className="text-amber-500" />
              <span>Daily Reminder</span>
            </h3>
            <button
              onClick={toggleReminders}
              className={`w-12 h-6 rounded-full transition-colors ${settings.reminders.enabled ? 'bg-amber-500' : 'bg-slate-600'} relative`}
            >
              <div className={`absolute top-1 ${settings.reminders.enabled ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`} />
            </button>
          </div>

          {settings.reminders.enabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex p-1 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700">
                <button
                  onClick={() => updateReminderMode('INTERVAL')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    settings.reminders.mode === 'INTERVAL'
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Interval
                </button>
                <button
                  onClick={() => updateReminderMode('SPECIFIC_TIMES')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    settings.reminders.mode === 'SPECIFIC_TIMES'
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Specific Time
                </button>
              </div>

              {settings.reminders.mode === 'INTERVAL' ? (
                <div className="space-y-2">
                  <p className={`text-xs ${subTextColor}`}>Remind me to practice every:</p>
                  <div className="flex space-x-2">
                    {[30, 60, 120].map((min) => (
                      <button
                        key={min}
                        onClick={() => updateInterval(min)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                          settings.reminders.intervalMinutes === min
                            ? 'bg-amber-500 text-white border-amber-600'
                            : `${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-600'} ${subTextColor}`
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className={`text-xs ${subTextColor}`}>Set a specific time (e.g. 08:00):</p>
                  <input
                    type="time"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'light' 
                        ? 'bg-slate-50 border-slate-300' 
                        : 'bg-slate-800 border-slate-600'
                    }`}
                    defaultValue={settings.reminders.specificTimes[0]}
                  />
                  <p className="text-[10px] text-slate-500 italic">Push notifications require browser permission.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`rounded-2xl p-4 border shadow-lg ${cardBg}`}>
          <h3 className="text-sm font-bold mb-4">Actions</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                buttonSoundService.play('click');
                onChangeFocus();
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
            >
              <span className="text-sm font-medium text-indigo-400">Change Focus Area</span>
              <RefreshCw size={16} className="text-indigo-400" />
            </button>

            <button
              onClick={() => {
                buttonSoundService.play('click');
                onReplayTutorial();
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors"
            >
              <span className="text-sm font-medium text-purple-400">Replay Tutorial</span>
              <RefreshCw size={16} className="text-purple-400" />
            </button>

            <button
              onClick={() => {
                buttonSoundService.play('back');
                onSignOut();
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            >
              <span className="text-sm font-medium text-red-400">Sign Out</span>
              <LogOut size={16} className="text-red-400" />
            </button>
          </div>
        </div>

        <div className={`rounded-2xl p-4 border shadow-lg ${cardBg}`}>
          <p className={`text-xs ${subTextColor} text-center leading-relaxed`}>
            Abundance Alchemy v1.0.0<br />
            Based on "I Am Practice" by Michael Soaries<br />
            © 2024 Abundant Thought - Michael Soaries
          </p>
        </div>
      </div>
    </div>
  );
};