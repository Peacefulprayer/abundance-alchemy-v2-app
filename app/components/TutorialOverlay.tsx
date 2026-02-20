import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import BreathingOrb from './BreathingOrb';

interface TutorialOverlayProps {
  onComplete: () => void;
  onChangeFocus: () => void;
  theme: 'light' | 'dark';
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onChangeFocus, theme }) => {
  const [step, setStep] = useState(0);

  const titleCardClasses =
    'backdrop-blur-lg rounded-2xl border p-4 md:p-5 w-full max-w-[280px] shadow-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-white/10';

  const getContentCardClasses = () => {
    const base =
      'backdrop-blur-md rounded-2xl border p-4 md:p-6 w-full max-w-[280px] shadow-xl';
    return theme === 'dark'
      ? `${base} bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-white/10`
      : `${base} bg-gradient-to-b from-white to-slate-50 border-slate-200`;
  };

  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const contentText = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const contentMuted = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const contentAccent = theme === 'dark' ? 'text-amber-400' : 'text-amber-700';
  const contentAccentStrong = theme === 'dark' ? 'text-amber-200' : 'text-amber-800';
  const contentIndigo = theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700';
  const contentEmerald = theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700';
  const contentBorder = theme === 'dark' ? 'border-amber-500' : 'border-amber-500/50';
  const indicatorInactive = theme === 'dark' ? 'bg-slate-600/60' : 'bg-slate-300';
  const backButtonClasses =
    theme === 'dark'
      ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
      : 'border-slate-300 text-slate-700 hover:bg-slate-100';
  const skipClasses =
    theme === 'dark'
      ? 'text-slate-400 hover:text-slate-300'
      : 'text-slate-600 hover:text-slate-700';
  const footerNote = theme === 'dark' ? 'text-slate-500' : 'text-slate-600';

  const steps = [
    {
      title: 'The I Am Practice',
      content: (
        <div className={`space-y-4 text-left text-xs leading-relaxed overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar ${contentText}`}>
          <p className={`font-bold italic text-sm ${contentAccent}`}>"Your focus sets your intention and your practice brings you into alignment with it."</p>
          <p>This I Am Practice is about shifting your vibrational alignment to match that of all the good that is all around you, everywhere present, right here, right now.</p>
          <p>This is a meaning of <span className={`font-semibold ${contentText}`}>"The Kingdom of Heaven is at Hand".</span></p>
          <p>Chances are if you are not experiencing this then you are simply in alignment with something else. And God wants to bring you back, The Ancestors, The Divine wants to bring you back.</p>
          <p>In that light the I Am morning practice is an adjustment, a tuning, a frequency shift from saying no to your good to saying yes to your good!</p>
          <p className={`border-l-2 pl-3 ${contentMuted} ${contentBorder}`}>Speak your I Am practice out loud and rapid (fast one after the other so your brain does not have a chance to throw any weird stuff) so you can feel the vibration of your voice in your body.</p>
          <p>Your evening <span className={`font-semibold ${contentIndigo}`}>I Love</span> practice is bringing on the vibrational alignment of gratitude, seed planting - putting good and beautiful vibes into the soil of the garden of dreams to work as you sleep.</p>
        </div>
      ),
    },
    {
      title: 'Meditation & Duration',
      content: (
        <div className={`space-y-3 text-left text-xs leading-relaxed ${contentText}`}>
           <p>Select 1, 5, or 15 minutes for quick sessions, or choose a custom duration for deeper practice.</p>
           <p><strong className={contentAccentStrong}>Meditation Practice:</strong> You can also explore the specific Meditation Mode for guided stillness, breathwork, and ambient soundscapes to find your center.</p>
        </div>
      ),
    },
    {
      title: 'Sonic Alchemy',
      content: (
        <div className={`space-y-3 text-left text-xs leading-relaxed ${contentText}`}>
          <p>Your environment matters. The default background sound is designed to hold space for you, but you are the creator.</p>
          <p>Go to <strong className={contentEmerald}>Settings &gt; Audio</strong> to:</p>
          <ul className={`list-disc pl-4 space-y-1 ${contentMuted}`}>
             <li>Change the default background ambience.</li>
             <li>Set specific music for I Am or I Love practices.</li>
             <li>Upload your own music tracks.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Reflect & Journal',
      content: (
        <div className={`space-y-3 text-left text-xs leading-relaxed ${contentText}`}>
          <p>After each session, it is a good idea to record your thoughts and feelings - this includes any ideas that come to you.</p>
          <p>Your progress is saved and together with your recordings you can look back and track your progress and see where you might want continue a particular focus or change it up.</p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    buttonSoundService.play('click');
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    buttonSoundService.play('back');
    if (step > 0) {
      setStep(step - 1);
    }
  };


  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="mt-8 md:mt-12 mb-4 md:mb-6">
        <BreathingOrb size={80} breathingSpeed={4000} />
      </div>

      <div className={`${titleCardClasses} mb-4 md:mb-6`}>
        <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
          Abundance Alchemy
        </h1>
      </div>

      <div className={`${getContentCardClasses()} mb-6 md:mb-8`}>
        <div className="text-center space-y-3">
          <Sparkles size={28} className="mx-auto text-amber-500" />
          <h2 className={`text-base md:text-lg font-bold text-amber-400 ${textColor}`}>
            {steps[step].title}
          </h2>
          <div className={`leading-relaxed text-xs md:text-sm ${contentText}`}>
            <div className="max-h-[45vh] overflow-y-auto custom-scrollbar pr-1 text-left">
              {typeof steps[step].content === 'string' ? <p>{steps[step].content}</p> : steps[step].content}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-2 pt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all ${
                i === step ? 'bg-amber-500' : indicatorInactive
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-[280px] space-y-3">
        <div className="flex space-x-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className={`flex-1 px-4 py-2 rounded-lg border font-bold transition-all flex items-center justify-center ${backButtonClasses}`}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-[3] px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium text-xs md:text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{step === steps.length - 1 ? 'Start Practicing' : 'Next'}</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <button
          onClick={() => {
            buttonSoundService.play('back');
            onComplete();
          }}
          className={`w-full text-xs transition-colors pt-2 ${skipClasses}`}
        >
          Skip Tutorial
        </button>
        <p className={`text-center text-[10px] italic mt-2 ${footerNote}`}>
          When you are ready, click Next.
        </p>
      </div>
    </div>
  );
};
