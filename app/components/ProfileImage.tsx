import React from 'react';

interface ProfileImageProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ProfileImageProps['size']>, string> = {
  sm: 'h-11 w-11',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

const getInitials = (name?: string): string => {
  const parts = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return 'AA';
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
};

export const ProfileImage: React.FC<ProfileImageProps> = ({
  name,
  imageUrl,
  size = 'md',
  className = '',
}) => {
  const initials = getInitials(name);

  return (
    <div
      className={[
        'inline-flex items-center justify-center overflow-hidden rounded-full border border-amber-300/55 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-black/90 shadow-[0_10px_24px_rgba(0,0,0,0.28)] ring-2 ring-amber-300/20',
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name ? `${name} profile` : 'Profile'}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-amber-200">
          {initials}
        </span>
      )}
    </div>
  );
};
