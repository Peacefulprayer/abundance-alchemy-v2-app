import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { buttonSoundService } from '../services/buttonSoundService';

interface TutorialOverlayProps {
  onComplete: () => void;
  onChangeFocus: () => void;
  theme: 'light' | 'dark';
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onChangeFocus, theme }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'The I Am Practice',
      content: (
        <div className="space-y-4 text-left text-xs leading-relaxed overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar text-slate-100">
          <p className="font-bold text-amber-400 italic text-sm">"Your focus sets your intention and your practice brings you into alignment with it."</p>
          <p>This I Am Practice is about shifting your vibrational alignment to match that of all the good that is all around you, everywhere present, right here, right now.</p>
          <p>This is a meaning of <span className="text-white font-semibold">"The Kingdom of Heaven is at Hand".</span></p>
          <p>Chances are if you are not experiencing this then you are simply in alignment with something else. And God wants to bring you back, The Ancestors, The Divine wants to bring you back.</p>
          <p>In that light the I Am morning practice is an adjustment, a tuning, a frequency shift from saying no to your good to saying yes to your good!</p>
          <p className="border-l-2 border-amber-500 pl-3 text-slate-200">Speak your I Am practice out loud and rapid (fast one after the other so your brain does not have a chance to throw any weird stuff) so you can feel the vibration of your voice in your body.</p>
          <p>Your evening <span className="text-indigo-300 font-semibold">I Love</span> practice is bringing on the vibrational alignment of gratitude, seed planting - putting good and beautiful vibes into the soil of the garden of dreams to work as you sleep.</p>
        </div>
      ),
    },
    {
      title: 'Meditation & Duration',
      content: (
        <div className="space-y-3 text-left text-xs leading-relaxed text-slate-100">
           <p>Select 1, 5, or 15 minutes for quick sessions, or choose a custom duration for deeper practice.</p>
           <p><strong className="text-amber-200">Meditation Practice:</strong> You can also explore the specific Meditation Mode for guided stillness, breathwork, and ambient soundscapes to find your center.</p>
        </div>
      ),
    },
    {
      title: 'Sonic Alchemy',
      content: (
        <div className="space-y-3 text-left text-xs leading-relaxed text-slate-100">
          <p>Your environment matters. The default background sound is designed to hold space for you, but you are the creator.</p>
          <p>Go to <strong className="text-emerald-400">Settings &gt; Audio</strong> to:</p>
          <ul className="list-disc pl-4 space-y-1 text-slate-300">
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
        <div className="space-y-3 text-left text-xs leading-relaxed text-slate-100">
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

  const textColor = 'text-slate-100';

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 max-w-md mx-auto">
      <div className={`w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 ${textColor}`}>
        <div className="text-center space-y-4">
          <Sparkles size={48} className="mx-auto text-amber-500" />
          <h1 className="text-2xl font-serif font-bold text-amber-400 drop-shadow-sm">{steps[step].title}</h1>
          <div className="leading-relaxed text-sm">
            {typeof steps[step].content === 'string' ? <p>{steps[step].content}</p> : steps[step].content}
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-all ${
                i === step ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex space-x-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-[3] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>{step === steps.length - 1 ? 'Start Practicing' : 'Next'}</span>
              <ArrowRight size={20} />
            </button>
          </div>

          <button
            onClick={() => {
              buttonSoundService.play('back');
              onComplete();
            }}
            className="w-full text-slate-400 hover:text-slate-300 text-sm transition-colors pt-2"
          >
            Skip Tutorial
          </button>
          <p className="text-center text-[10px] text-slate-500 italic mt-2">When you are ready, click Next.</p>
        </div>
      </div>
    </div>
  );
};