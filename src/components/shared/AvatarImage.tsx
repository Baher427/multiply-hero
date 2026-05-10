'use client';

import Image from 'next/image';

// Map of avatar IDs to image paths (3D images) and fallback emojis
const AVATAR_IMAGES: Record<string, { src: string; emoji: string; name: string }> = {
  lion: { src: '/images/avatars/lion.png', emoji: '🦁', name: 'أسد' },
  cat: { src: '/images/avatars/cat.png', emoji: '🐱', name: 'قطة' },
  bear: { src: '/images/avatars/bear.png', emoji: '🐻', name: 'دب' },
  rabbit: { src: '/images/avatars/rabbit.png', emoji: '🐰', name: 'أرنب' },
  dog: { src: '/images/avatars/dog.png', emoji: '🐶', name: 'كلب' },
  fox: { src: '/images/avatars/fox.png', emoji: '🦊', name: 'ثعلب' },
  panda: { src: '/images/avatars/panda.png', emoji: '🐼', name: 'باندا' },
  unicorn: { src: '/images/avatars/unicorn.png', emoji: '🦄', name: 'يونيكورن' },
  dragon: { src: '/images/avatars/dragon.png', emoji: '🐲', name: 'تنين' },
  penguin: { src: '/images/avatars/penguin.png', emoji: '🐧', name: 'بطريق' },
  // Fallback avatars using emojis
  elephant: { src: '', emoji: '🐘', name: 'فيل' },
  tiger: { src: '', emoji: '🐯', name: 'نمر' },
  owl: { src: '', emoji: '🦉', name: 'بومة' },
  monkey: { src: '', emoji: '🐵', name: 'قرد' },
  frog: { src: '', emoji: '🐸', name: 'ضفدع' },
  'star-face': { src: '', emoji: '🤩', name: 'نجم' },
  'cool-face': { src: '', emoji: '😎', name: 'رائع' },
  'heart-face': { src: '', emoji: '😍', name: 'قلب' },
  apple: { src: '', emoji: '🍎', name: 'تفاحة' },
  banana: { src: '', emoji: '🍌', name: 'موزة' },
  rocket: { src: '', emoji: '🚀', name: 'صاروخ' },
  crown: { src: '', emoji: '👑', name: 'تاج' },
  gem: { src: '', emoji: '💎', name: 'جوهرة' },
  trophy: { src: '', emoji: '🏆', name: 'كأس' },
  rainbow: { src: '', emoji: '🌈', name: 'قوس قزح' },
  balloon: { src: '', emoji: '🎈', name: 'بالون' },
};

interface AvatarImageProps {
  avatarId: string;
  size?: number;
  className?: string;
  useEmoji?: boolean;
}

export function getAvatarInfo(avatarId: string) {
  return AVATAR_IMAGES[avatarId] || AVATAR_IMAGES.lion;
}

export function getAvatarEmoji(avatarId: string): string {
  return AVATAR_IMAGES[avatarId]?.emoji || '🦁';
}

export function getAvatarSrc(avatarId: string): string {
  return AVATAR_IMAGES[avatarId]?.src || '';
}

export function has3DAvatar(avatarId: string): boolean {
  return !!(AVATAR_IMAGES[avatarId]?.src);
}

export default function AvatarImage({ avatarId, size = 48, className = '', useEmoji = false }: AvatarImageProps) {
  const info = AVATAR_IMAGES[avatarId] || AVATAR_IMAGES.lion;
  
  if (useEmoji || !info.src) {
    return (
      <span 
        className={`inline-block leading-none ${className}`} 
        style={{ fontSize: size * 0.7, width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {info.emoji}
      </span>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={info.src}
        alt={info.name}
        width={size}
        height={size}
        className="object-cover rounded-full"
        priority={size > 64}
      />
    </div>
  );
}

// World image component
const WORLD_IMAGES: Record<number, { src: string; emoji: string }> = {
  1: { src: '/images/worlds/world1.png', emoji: '🏝️' },
  2: { src: '/images/worlds/world2.png', emoji: '🌳' },
  3: { src: '/images/worlds/world3.png', emoji: '🌊' },
  4: { src: '/images/worlds/world4.png', emoji: '⛰️' },
  5: { src: '/images/worlds/world5.png', emoji: '🍬' },
  6: { src: '/images/worlds/world6.png', emoji: '🚀' },
  7: { src: '/images/worlds/world7.png', emoji: '🏰' },
  8: { src: '/images/worlds/world8.png', emoji: '🎨' },
  9: { src: '/images/worlds/world9.png', emoji: '👑' },
};

export function getWorldInfo(tableNumber: number) {
  return WORLD_IMAGES[tableNumber] || WORLD_IMAGES[1];
}

interface WorldImageProps {
  tableNumber: number;
  width?: number;
  height?: number;
  className?: string;
}

export function WorldImage({ tableNumber, width = 200, height = 100, className = '' }: WorldImageProps) {
  const info = WORLD_IMAGES[tableNumber] || WORLD_IMAGES[1];
  
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ width, height }}>
      <Image
        src={info.src}
        alt={`عالم جدول ${tableNumber}`}
        width={width}
        height={height}
        className="object-cover"
      />
    </div>
  );
}

// Mascot component
export function MascotImage({ size = 200, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/images/mascot/hero.png"
        alt="بطل الضرب"
        width={size}
        height={size}
        className="object-contain drop-shadow-2xl"
        priority
      />
    </div>
  );
}
