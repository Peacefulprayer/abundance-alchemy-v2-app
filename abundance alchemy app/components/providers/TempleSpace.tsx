// components/providers/TempleSpace.tsx - FIXED BACKGROUND (All screens use cover)
import React, { ReactNode } from 'react';

interface TempleSpaceProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
  backgroundType?: 'splash' | 'welcome' | 'default';
}

export const TempleSpace: React.FC<TempleSpaceProps> = ({
  children,
  theme = 'dark',
  backgroundType = 'default',
}) => {
  // Different backgrounds for different screens
  const getBackgroundImage = () => {
    switch (backgroundType) {
      case 'splash':
        return 'url(https://abundantthought.com/abundance-alchemy/assets/images/backgrounds/SPLASH_1765630178_ai-generated-background-2.jpg)';
      case 'welcome':
        return 'url(https://abundantthought.com/abundance-alchemy/assets/images/backgrounds/splash.jpg)';
      case 'default':
        // Auth screen uses its own dedicated background
        return 'url(https://abundantthought.com/abundance-alchemy/assets/images/backgrounds/AUTH_1767230125_auth_back.jpg)';
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image Container - FIXED: No transform conflicts */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: getBackgroundImage(),
          backgroundSize: 'cover', // ALL screens use cover (consistent)
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 1,
        }}
      />
      
      {/* Dark Overlay - 30% opacity for ALL screens */}
      {(backgroundType === 'splash' || backgroundType === 'welcome' || backgroundType === 'default') && (
        <div className="fixed inset-0 bg-slate-950/30 z-0" />
      )}
      
      {/* Content Container - RESPONSIVE + SCROLLABLE */}
      <div className="relative z-10 min-h-screen flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};