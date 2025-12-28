import React, { ReactNode } from 'react';

interface TempleSpaceProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
}

export const TempleSpace: React.FC<TempleSpaceProps> = ({
  children,
  theme = 'dark',
}) => {
  const bgClass = theme === 'dark' 
    ? 'bg-slate-950' 
    : 'bg-gradient-to-br from-amber-50 to-amber-100';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      <div className="absolute inset-0 overflow-hidden">
        {theme === 'dark' ? (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(251,191,36,0.2)_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(120,53,15,0.1)_1px,transparent_0)] bg-[length:50px_50px]" />
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};