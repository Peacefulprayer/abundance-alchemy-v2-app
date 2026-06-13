import React, { useRef, useState } from 'react';
import type { UserProfile, FocusArea } from '../types';
import { ProfileImage } from './ProfileImage';
import {
  SCREEN_PAGE_SHELL,
  SCREEN_TITLE_PILL,
  screenActionRow,
  screenBackButton,
  screenHeroCard,
  screenItemCard,
  screenSectionFrame,
  screenSectionKicker,
  screenSubTextColor,
  screenTextColor,
} from '../styles/sacredScreen';

interface ProfileProps {
  user: UserProfile;
  theme: 'light' | 'dark';
  onBack: () => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
}

const focusLabel = (focus: FocusArea | undefined): string => {
  if (!focus) return 'General';
  return typeof focus === 'string' ? focus : focus.label;
};

const PROFILE_IMAGE_MAX_SIZE = 320;

const readImageAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Unable to read image.'));
    };
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });

const resizeProfileImage = async (file: File): Promise<string> => {
  const source = await readImageAsDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to process image.'));
    img.src = source;
  });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return source;
  }

  const shortestSide = Math.min(image.width, image.height);
  const sx = (image.width - shortestSide) / 2;
  const sy = (image.height - shortestSide) / 2;

  canvas.width = PROFILE_IMAGE_MAX_SIZE;
  canvas.height = PROFILE_IMAGE_MAX_SIZE;
  context.drawImage(
    image,
    sx,
    sy,
    shortestSide,
    shortestSide,
    0,
    0,
    PROFILE_IMAGE_MAX_SIZE,
    PROFILE_IMAGE_MAX_SIZE
  );

  return canvas.toDataURL('image/jpeg', 0.84);
};

export const Profile: React.FC<ProfileProps> = ({ user, theme, onBack, onUpdateProfile }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [imageStatus, setImageStatus] = useState('');
  const textColor = screenTextColor(theme);
  const subTextColor = screenSubTextColor(theme);
  const titlePill = SCREEN_TITLE_PILL;
  const sectionFrame = screenSectionFrame(theme);
  const cardBg = screenHeroCard(theme);
  const itemBg = screenItemCard(theme);
  const pageShell = `${SCREEN_PAGE_SHELL} pb-24`;
  const sectionKicker = screenSectionKicker(theme);
  const backButton = screenBackButton(theme);
  const actionButton = `inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${screenActionRow(theme)}`;

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSavingImage(true);
    setImageStatus('');
    try {
      const nextImage = await resizeProfileImage(file);
      onUpdateProfile({ profileImage: nextImage });
      setImageStatus('Profile image updated.');
    } catch (error) {
      setImageStatus(error instanceof Error ? error.message : 'Unable to update image.');
    } finally {
      setIsSavingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`h-full w-full overflow-y-auto px-4 pt-4 ${textColor}`}>
      <div className={pageShell}>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className={backButton}
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <span className={titlePill}>Your Profile</span>
        </div>

        <div className={sectionFrame}>
          <div className={`${cardBg} p-5`}>
            <p className={sectionKicker}>Sacred Identity</p>
            <div className="mt-4 flex items-center gap-4">
              <ProfileImage name={user.name} imageUrl={user.profileImage} size="lg" />
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={actionButton}
                  >
                    {isSavingImage ? 'Saving Image...' : 'Add / Change Image'}
                  </button>
                  {user.profileImage ? (
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ profileImage: '' })}
                      className={actionButton}
                    >
                      Remove Image
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
                <p className={`text-xs ${subTextColor}`}>
                  Square photos work best. The image is optimized and stored with your profile on this device.
                </p>
                {imageStatus ? <p className="text-xs text-amber-400">{imageStatus}</p> : null}
              </div>
            </div>
            <h2 className="mt-3 text-2xl font-serif font-semibold">{user.name || 'Initiate'}</h2>
            <p className={`mt-2 text-sm ${subTextColor}`}>{user.email || 'No email on file'}</p>
            <p className={`mt-4 text-sm leading-relaxed ${subTextColor}`}>
              This profile reflects the identity and intention you are carrying through your practice journey.
            </p>
          </div>
        </div>

        <div className={sectionFrame}>
          <div className="flex items-center justify-between px-1">
            <h3 className={titlePill}>Journey Details</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className={`${itemBg} p-4`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}>Level</div>
              <div className="mt-3 text-2xl font-semibold">{user.level}</div>
            </div>
            <div className={`${itemBg} p-4`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}>Streak</div>
              <div className="mt-3 text-2xl font-semibold">{user.streak}</div>
            </div>
            <div className={`${itemBg} p-4`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}>Primary Focus</div>
              <div className="mt-3 text-sm font-semibold leading-snug">{focusLabel(user.focusAreas?.[0])}</div>
            </div>
            <div className={`${itemBg} p-4`}>
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${subTextColor}`}>Completed</div>
              <div className="mt-3 text-2xl font-semibold">{user.affirmationsCompleted}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
