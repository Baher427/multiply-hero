'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Map of avatar IDs to image paths (3D images) and fallback emojis
const AVATAR_IMAGES: Record<string, { src: string; emoji: string; name: string }> = {
  lion: { src: '/avatars/lion.png', emoji: '🦁', name: 'أسد' },
  cat: { src: '/avatars/cat.png', emoji: '🐱', name: 'قطة' },
  bear: { src: '/avatars/bear.png', emoji: '🐻', name: 'دب' },
  rabbit: { src: '/avatars/rabbit.png', emoji: '🐰', name: 'أرنب' },
  dog: { src: '/avatars/dog.png', emoji: '🐶', name: 'كلب' },
  fox: { src: '/avatars/fox.png', emoji: '🦊', name: 'ثعلب' },
  panda: { src: '/avatars/panda.png', emoji: '🐼', name: 'باندا' },
  unicorn: { src: '/avatars/unicorn.png', emoji: '🦄', name: 'يونيكورن' },
  dragon: { src: '/avatars/dragon.png', emoji: '🐲', name: 'تنين' },
  penguin: { src: '/avatars/penguin.png', emoji: '🐧', name: 'بطريق' },
  elephant: { src: '/avatars/elephant.png', emoji: '🐘', name: 'فيل' },
  tiger: { src: '/avatars/tiger.png', emoji: '🐯', name: 'نمر' },
  owl: { src: '/avatars/owl.png', emoji: '🦉', name: 'بومة' },
  monkey: { src: '/avatars/monkey.png', emoji: '🐵', name: 'قرد' },
  frog: { src: '/avatars/frog.png', emoji: '🐸', name: 'ضفدع' },
  'star-face': { src: '/avatars/star-face.png', emoji: '🤩', name: 'نجم' },
  'cool-face': { src: '/avatars/cool-face.png', emoji: '😎', name: 'رائع' },
  'heart-face': { src: '/avatars/heart-face.png', emoji: '😍', name: 'قلب' },
  'party-face': { src: '/avatars/party-face.png', emoji: '🥳', name: 'حفلة' },
  'nerd-face': { src: '/avatars/nerd-face.png', emoji: '🤓', name: 'ذكي' },
  apple: { src: '/avatars/apple.png', emoji: '🍎', name: 'تفاحة' },
  strawberry: { src: '/avatars/strawberry.png', emoji: '🍓', name: 'فراولة' },
  watermelon: { src: '/avatars/watermelon.png', emoji: '🍉', name: 'بطيخة' },
  banana: { src: '/avatars/banana.png', emoji: '🍌', name: 'موزة' },
  rocket: { src: '/avatars/rocket.png', emoji: '🚀', name: 'صاروخ' },
  crown: { src: '/avatars/crown.png', emoji: '👑', name: 'تاج' },
  gem: { src: '/avatars/gem.png', emoji: '💎', name: 'جوهرة' },
  trophy: { src: '/avatars/trophy.png', emoji: '🏆', name: 'كأس' },
  rainbow: { src: '/avatars/rainbow.png', emoji: '🌈', name: 'قوس قزح' },
  balloon: { src: '/avatars/balloon.png', emoji: '🎈', name: 'بالون' },
};

// Size presets
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  xxl: 128,
};

interface AvatarImageProps {
  avatarId: string;
  size?: number | AvatarSize;
  className?: string;
  useEmoji?: boolean;
  glow?: boolean;
  rounded?: boolean;
  animate?: boolean; // bounce on mount
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

export default function AvatarImage({
  avatarId,
  size = 'md',
  className = '',
  useEmoji = false,
  glow = false,
  rounded = true,
  animate = false,
}: AvatarImageProps) {
  const info = AVATAR_IMAGES[avatarId] || AVATAR_IMAGES.lion;
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  // Resolve size
  const resolvedSize = typeof size === 'string' ? SIZE_MAP[size] || 48 : size;
  const resolvedSizeNumber = resolvedSize;

  const handleImageError = useCallback(() => {
    setImgError(true);
    setImgLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImgLoading(false);
  }, []);

  // If explicitly requesting emoji or image failed to load
  if (useEmoji || !info.src || imgError) {
    const Wrapper = animate ? motion.span : 'span';
    const animateProps = animate ? {
      initial: { scale: 0.8, y: 10 },
      animate: { scale: 1, y: 0 },
      transition: { type: 'spring' as const, stiffness: 300, damping: 15 },
    } : {};

    return (
      <Wrapper
        className={`inline-block leading-none ${className} ${rounded ? 'rounded-full' : ''}`}
        style={{
          fontSize: resolvedSizeNumber * 0.7,
          width: resolvedSizeNumber,
          height: resolvedSizeNumber,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...animateProps}
      >
        {info.emoji}
      </Wrapper>
    );
  }

  return (
    <motion.div
      initial={animate ? { scale: 0.8, y: 10 } : undefined}
      animate={animate ? { scale: 1, y: 0 } : undefined}
      transition={animate ? { type: 'spring', stiffness: 300, damping: 15 } : undefined}
      className={`relative overflow-hidden ${rounded ? 'rounded-full' : 'rounded-xl'} ${className}`}
      style={{ width: resolvedSizeNumber, height: resolvedSizeNumber }}
    >
      {/* Glow effect */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
            transform: 'scale(1.4)',
          }}
        />
      )}

      {/* Loading skeleton */}
      {imgLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"
        />
      )}

      <Image
        src={info.src}
        alt={info.name}
        width={resolvedSizeNumber}
        height={resolvedSizeNumber}
        className={`object-cover ${rounded ? 'rounded-full' : 'rounded-xl'} relative z-10`}
        priority={resolvedSizeNumber > 64}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </motion.div>
  );
}

// World image component
const WORLD_IMAGES: Record<number, { src: string; emoji: string }> = {
  1: { src: '/worlds/world-1.png', emoji: '🏝️' },
  2: { src: '/worlds/world-2.png', emoji: '🌳' },
  3: { src: '/worlds/world-3.png', emoji: '🌊' },
  4: { src: '/worlds/world-4.png', emoji: '⛰️' },
  5: { src: '/worlds/world-5.png', emoji: '🍬' },
  6: { src: '/worlds/world-6.png', emoji: '🚀' },
  7: { src: '/worlds/world-7.png', emoji: '🏰' },
  8: { src: '/worlds/world-8.png', emoji: '🎨' },
  9: { src: '/worlds/world-9.png', emoji: '👑' },
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
