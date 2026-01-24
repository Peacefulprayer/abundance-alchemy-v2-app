// components/BreathingOrb.tsx
import React, { useState, useRef, useEffect, FC } from 'react';
import '../BreathingOrb.css';

interface BreathingOrbProps {
  isAudioPlaying?: boolean;
  audioIntensity?: number;
  size?: number;
  breathingSpeed?: number;
  onClick?: () => void;
}

const BreathingOrb: FC<BreathingOrbProps> = ({ 
  isAudioPlaying = false,
  audioIntensity = 0,
  size = 175,
  breathingSpeed = 5000,
  onClick
}) => {
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0.5);
  const orbRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Breathing animation
  useEffect(() => {
    let startTime: number | null = null;
    
    const animateBreathing = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      const progress = (elapsed % breathingSpeed) / breathingSpeed;
      const breath = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
      
      // Audio modulation
      const audioModifier = isAudioPlaying ? 1 + audioIntensity * 0.3 : 1;
      const currentBreathPhase = breath * audioModifier;
      
      setBreathPhase(currentBreathPhase);
      
      // Update CSS variables
      if (orbRef.current) {
        const baseGlow = 15 + breath * 10;
        const audioGlow = isAudioPlaying ? audioIntensity * 25 : 0;
        
        orbRef.current.style.setProperty('--breath-phase', currentBreathPhase.toString());
        orbRef.current.style.setProperty('--pulse-glow', `${baseGlow + audioGlow}px`);
        orbRef.current.style.setProperty('--audio-intensity', audioIntensity.toString());
        orbRef.current.style.setProperty('--orb-size', `${size}px`);
        orbRef.current.style.setProperty('--breathing-speed', `${breathingSpeed}ms`);
      }
      
      animationRef.current = requestAnimationFrame(animateBreathing);
    };
    
    animationRef.current = requestAnimationFrame(animateBreathing);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAudioPlaying, audioIntensity, breathingSpeed, size]);

  const handleClick = () => {
    setIsActive(!isActive);
    
    if (orbRef.current) {
      orbRef.current.classList.add('orb-clicked');
      setTimeout(() => {
        orbRef.current?.classList.remove('orb-clicked');
      }, 300);
    }
    
    if (onClick) onClick();
  };

  const handleHover = (isHovering: boolean) => {
    if (orbRef.current) {
      orbRef.current.style.setProperty('--hover-intensity', isHovering ? '1' : '0');
    }
  };

  return (
    <div className="breathing-orb-container">
      <div 
        ref={orbRef}
        className={`breathing-orb ${isActive ? 'active' : ''} ${isAudioPlaying ? 'audio-responsive' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={{
          '--orb-size': `${size}px`,
          '--breathing-speed': `${breathingSpeed}ms`
        } as React.CSSProperties}
      >
        {/* Core Orb */}
        <div className="orb-core">
          <div className="orb-inner-glow" />
        </div>
        
        {/* Fire Ring */}
        <div className="fire-ring">
          <div className="fire-layer fire-orange" />
          <div className="fire-layer fire-gold" />
          <div className="fire-layer fire-blue" />
          <div className="fire-layer fire-white" />
        </div>
      </div>
    </div>
  );
};

export default BreathingOrb;