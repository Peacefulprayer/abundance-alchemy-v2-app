import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';
import BreathingOrb from './BreathingOrb';
import { SacredBackground } from './SacredBackground';
import {
  SACRED_LAYOUT,
  SACRED_TITLE_CARD,
  SACRED_BODY_CARD,
  SACRED_INNER_WIDTH,
} from '../styles/sacredCards';

interface TutorialOverlayProps {
  onComplete: () => void;
  onChangeFocus: () => void;
  theme: 'light' | 'dark';
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onChangeFocus, theme }) => {
  const [step, setStep] = useState(0);

  // Tutorial is always dark + green text for sacred ceremonial path
  const textColor = 'text-emerald-200';
  const subTextColor = 'text-emerald-300';
  const contentText = 'text-emerald-300';
  const contentMuted = 'text-emerald-200';
  const contentAccent = 'text-amber-400';
  const contentAccentStrong = 'text-amber-200';
  const contentIndigo = 'text-indigo-300';
  const contentEmerald = 'text-emerald-400';
  const contentBorder = 'border-amber-500';
  const indicatorInactive = 'bg-slate-600/60';
  const backButtonClasses = 'border-slate-600 text-emerald-300 hover:bg-slate-800';
  const skipClasses = 'text-emerald-400 hover:text-emerald-300';
  const footerNote = 'text-emerald-400';

  const steps = [
    {
      title: 'App Tutorial',
      content: (
        <div className={`space-y-4 text-left text-xs leading-relaxed overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar ${contentText}`}>
          <p className={`text-center italic text-sm ${contentAccent}`}>"Your focus sets your intention and your practice brings you into alignment with it."</p>
          <p className="text-center">
            <span className={`font-semibold ${contentText}`}>"The Kingdom of Heaven is at hand"</span>
            <br />
            These Practices are about providing concrete tools to help with shifting your vibrational alignment to match that of the good that is all around you.
          </p>
          <p>Chances are if you are not experiencing this then you are simply in alignment with something else. And The Divine, the Ancestors want to bring you back.</p>
          <p>In that light the I Am morning practice is an adjustment, a tuning, a frequency shift from saying no to your good to saying yes to your good!</p>
          <p className={`border-l-2 pl-3 ${contentMuted} ${contentBorder}`}>Speak your I Am practice out loud and rapid (fast one after the other so your brain does not have a chance to throw any weird stuff) so you can feel the vibration of your voice in your body.</p>
          <p>Your evening <span className={`font-semibold ${contentIndigo}`}>I Love</span> practice is bringing on the vibrational alignment of gratitude, seed planting - putting good and beautiful vibes into the soil of the garden of dreams to work as you sleep.</p>
        </div>
      ),
    },
    {
      title: 'Meditation, Prayer & Duration',
      content: (
        <div className={`space-y-3 text-left text-xs leading-relaxed ${contentText}`}>
           <p>Select 1, 5, or 15 minutes for quick sessions, or choose a custom duration for deeper practice.</p>
           <p><strong className={contentAccentStrong}>Meditation Practice:</strong> Explore the specific Meditation Mode for guided stillness, breathwork, and ambient soundscapes to find your center.</p>
           <p><strong className={contentAccentStrong}>Omba (Prayer):</strong> Prayer is its own sacred path. You can choose your path, shape your prayer profile, and move into a dedicated prayer atmosphere that is distinct from meditation.</p>
        </div>
      ),
    },
    {
      title: 'Sound Alchemy',
      content: (
        <div className={`space-y-3 text-left text-xs leading-relaxed ${contentText}`}>
          <p>
            Sound is a powerful tool. The default background sound is designed to hold space for you.
          </p>
          <p>Once inside you will have control over the sounds you listen to.</p>
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
    {
      title: 'Movement Through the App',
      content: (
        <div className={`space-y-3 text-left text-xs leading-relaxed ${contentText}`}>
          <p>For the smoothest experience, move through your practice using the in-app buttons, cards, and bottom menu.</p>
          <p>When needed use the in-app back buttons to move through the dashboard spaces.</p>
          <p className={contentMuted}>Move gently and intentionally through each space, allowing the practice to unfold step by step.</p>
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
    <SacredBackground theme="dark" backgroundType="TUTORIAL" fallbackBackgroundType="ONBOARDING">
    <div className={SACRED_LAYOUT}>
      <BreathingOrb size={80} breathingSpeed={4000} />

      <div className={SACRED_TITLE_CARD}>
        <h1 className="text-base md:text-lg font-light tracking-[0.15em] md:tracking-[0.2em] text-amber-500 text-center">
          Abundance Alchemy
        </h1>
      </div>

      <div className={SACRED_BODY_CARD}>
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

      <div className={`${SACRED_INNER_WIDTH} space-y-3`}>
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

        <p className={`text-center text-[10px] italic mt-2 ${footerNote}`}>
          When you are ready, click Next.
        </p>
        <button
          onClick={() => {
            buttonSoundService.play('back');
            onComplete();
          }}
          className={`w-full text-xs transition-colors ${skipClasses}`}
        >
          Skip Tutorial
        </button>
      </div>
    </div>
    </SacredBackground>
  );
};
