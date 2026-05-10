'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import AvatarImage, { has3DAvatar, getAvatarEmoji } from '@/components/shared/AvatarImage';
import Image from 'next/image';
import { useSound } from '@/hooks/use-sound';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ProfileSetupProps {
  onComplete: (profile: {
    name: string;
    displayName: string;
    age: number;
    avatarId: string;
    favoriteColor: string;
  }) => void;
  onBack: () => void;
}

type AvatarCategory = 'animals' | 'faces' | 'fruits' | 'objects';

interface AvatarItem {
  id: string;
  emoji: string;
  name: string;
  category: AvatarCategory;
  unlockLevel: number;
}

interface ColorOption {
  id: string;
  name: string;
  ring: string;
  gradient: string;
}

// ─── Static Data ────────────────────────────────────────────────────────────────

const AVATARS: AvatarItem[] = [
  { id: 'lion', emoji: '🦁', name: 'أسد', category: 'animals', unlockLevel: 0 },
  { id: 'cat', emoji: '🐱', name: 'قطة', category: 'animals', unlockLevel: 0 },
  { id: 'bear', emoji: '🐻', name: 'دب', category: 'animals', unlockLevel: 0 },
  { id: 'rabbit', emoji: '🐰', name: 'أرنب', category: 'animals', unlockLevel: 0 },
  { id: 'elephant', emoji: '🐘', name: 'فيل', category: 'animals', unlockLevel: 0 },
  { id: 'tiger', emoji: '🐯', name: 'نمر', category: 'animals', unlockLevel: 0 },
  { id: 'dog', emoji: '🐶', name: 'كلب', category: 'animals', unlockLevel: 0 },
  { id: 'owl', emoji: '🦉', name: 'بومة', category: 'animals', unlockLevel: 1 },
  { id: 'monkey', emoji: '🐵', name: 'قرد', category: 'animals', unlockLevel: 0 },
  { id: 'panda', emoji: '🐼', name: 'باندا', category: 'animals', unlockLevel: 2 },
  { id: 'penguin', emoji: '🐧', name: 'بطريق', category: 'animals', unlockLevel: 3 },
  { id: 'fox', emoji: '🦊', name: 'ثعلب', category: 'animals', unlockLevel: 1 },
  { id: 'unicorn', emoji: '🦄', name: 'يونيكورن', category: 'animals', unlockLevel: 5 },
  { id: 'dragon', emoji: '🐉', name: 'تنين', category: 'animals', unlockLevel: 4 },
  { id: 'frog', emoji: '🐸', name: 'ضفدع', category: 'animals', unlockLevel: 0 },
  { id: 'star-face', emoji: '🤩', name: 'مبهر', category: 'faces', unlockLevel: 0 },
  { id: 'cool-face', emoji: '😎', name: 'رائع', category: 'faces', unlockLevel: 0 },
  { id: 'heart-face', emoji: '😍', name: 'محب', category: 'faces', unlockLevel: 1 },
  { id: 'party-face', emoji: '🥳', name: 'احتفال', category: 'faces', unlockLevel: 2 },
  { id: 'nerd-face', emoji: '🤓', name: 'ذكي', category: 'faces', unlockLevel: 3 },
  { id: 'apple', emoji: '🍎', name: 'تفاحة', category: 'fruits', unlockLevel: 0 },
  { id: 'strawberry', emoji: '🍓', name: 'فراولة', category: 'fruits', unlockLevel: 0 },
  { id: 'watermelon', emoji: '🍉', name: 'بطيخة', category: 'fruits', unlockLevel: 1 },
  { id: 'banana', emoji: '🍌', name: 'موزة', category: 'fruits', unlockLevel: 0 },
  { id: 'rocket', emoji: '🚀', name: 'صاروخ', category: 'objects', unlockLevel: 0 },
  { id: 'crown', emoji: '👑', name: 'تاج', category: 'objects', unlockLevel: 3 },
  { id: 'gem', emoji: '💎', name: 'ماسة', category: 'objects', unlockLevel: 4 },
  { id: 'trophy', emoji: '🏆', name: 'كأس', category: 'objects', unlockLevel: 5 },
  { id: 'rainbow', emoji: '🌈', name: 'قوس قزح', category: 'objects', unlockLevel: 2 },
  { id: 'balloon', emoji: '🎈', name: 'بالون', category: 'objects', unlockLevel: 0 },
];

const CATEGORY_LABELS: Record<AvatarCategory, { label: string; icon: string }> = {
  animals: { label: 'حيوانات', icon: '🐾' },
  faces: { label: 'وجوه', icon: '😊' },
  fruits: { label: 'فواكه', icon: '🍓' },
  objects: { label: 'أشياء', icon: '⭐' },
};

const CATEGORY_ORDER: AvatarCategory[] = ['animals', 'faces', 'fruits', 'objects'];

const COLOR_OPTIONS: ColorOption[] = [
  { id: 'emerald', name: 'أخضر زمردي', ring: 'ring-emerald-400', gradient: 'from-emerald-400 to-emerald-600' },
  { id: 'cyan', name: 'سماوي', ring: 'ring-cyan-400', gradient: 'from-cyan-400 to-cyan-600' },
  { id: 'amber', name: 'عنبري', ring: 'ring-amber-400', gradient: 'from-amber-400 to-amber-600' },
  { id: 'rose', name: 'وردي', ring: 'ring-rose-400', gradient: 'from-rose-400 to-rose-600' },
  { id: 'violet', name: 'بنفسجي', ring: 'ring-violet-400', gradient: 'from-violet-400 to-violet-600' },
  { id: 'orange', name: 'برتقالي', ring: 'ring-orange-400', gradient: 'from-orange-400 to-orange-600' },
  { id: 'teal', name: 'تركوازي', ring: 'ring-teal-400', gradient: 'from-teal-400 to-teal-600' },
  { id: 'pink', name: 'وردي فاتح', ring: 'ring-pink-400', gradient: 'from-pink-400 to-pink-600' },
];

// ─── Animation Config ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const stepTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// ─── Extracted Sub-Components ───────────────────────────────────────────────────

function ProgressIndicator({ step }: { step: number }) {
  const stepLabels = ['الاسم', 'الشخصية', 'الألوان'];
  const stepIcons = ['✏️', '🎭', '🎨'];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8" dir="rtl">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1 sm:gap-2">
          <motion.div
            className={`
              flex items-center justify-center rounded-full transition-colors
              ${i === step
                ? 'bg-amber-400 text-white shadow-lg shadow-amber-200 size-10 sm:size-12'
                : i < step
                  ? 'bg-emerald-400 text-white size-8 sm:size-10'
                  : 'bg-gray-200 text-gray-400 size-8 sm:size-10'
              }
            `}
            animate={i === step ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.6, repeat: i === step ? Infinity : 0, repeatDelay: 1 }}
          >
            {i < step ? (
              <span className="text-sm sm:text-base">✓</span>
            ) : (
              <span className="text-sm sm:text-base">{stepIcons[i]}</span>
            )}
          </motion.div>
          <span
            className={`text-xs sm:text-sm font-bold ${
              i === step ? 'text-amber-600' : i < step ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            {stepLabels[i]}
          </span>
          {i < 2 && (
            <div
              className={`w-6 sm:w-10 h-1 rounded-full ${
                i < step ? 'bg-emerald-400' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface Step1Props {
  name: string;
  displayName: string;
  onNameChange: (v: string) => void;
  onDisplayNameChange: (v: string) => void;
  direction: number;
}

function Step1({ name, displayName, onNameChange, onDisplayNameChange, direction }: Step1Props) {
  return (
    <motion.div
      key="step1"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
      className="space-y-6 sm:space-y-8"
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-600 mb-2">
          ما اسمك؟ 🌟
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">أخبرنا اسمك عشان نعرفك!</p>
      </motion.div>

      <div className="space-y-4 sm:space-y-5 max-w-md mx-auto" dir="rtl">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2">
            اسمك 📝
          </label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="اكتب اسمك هنا..."
            className="text-right text-lg sm:text-xl p-4 sm:p-6 rounded-2xl border-2 border-amber-200 focus:border-amber-400 focus:ring-amber-300 h-14 sm:h-16"
            maxLength={30}
          />
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2">
            اسمك المميز ✨ <span className="text-gray-400 text-sm">(اختياري)</span>
          </label>
          <Input
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="لقب مميز ليك..."
            className="text-right text-lg sm:text-xl p-4 sm:p-6 rounded-2xl border-2 border-rose-200 focus:border-rose-400 focus:ring-rose-300 h-14 sm:h-16"
            maxLength={30}
          />
        </motion.div>
      </div>

      {/* Live preview */}
      <AnimatePresence>
        {name.trim() && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center"
          >
            <Card className="inline-block border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <p className="text-gray-500 text-sm mb-1">أهلاً</p>
                <p className="text-xl sm:text-2xl font-extrabold text-amber-600">
                  {displayName || name} 🎉
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface Step2Props {
  avatarId: string;
  onAvatarSelect: (id: string) => void;
  activeCategory: AvatarCategory;
  onCategoryChange: (cat: AvatarCategory) => void;
  currentLevel: number;
  direction: number;
}

function Step2({
  avatarId,
  onAvatarSelect,
  activeCategory,
  onCategoryChange,
  currentLevel,
  direction,
}: Step2Props) {
  const selectedAvatar = AVATARS.find((a) => a.id === avatarId);

  return (
    <motion.div
      key="step2"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
      className="space-y-4 sm:space-y-6"
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <h2 className="text-2xl sm:text-4xl font-extrabold text-rose-600 mb-2">
          اختار شخصيتك 🎭
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">اختار الشخصية اللي تمثلك!</p>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 sm:gap-3 flex-wrap" dir="rtl">
        {CATEGORY_ORDER.map((cat) => {
          const info = CATEGORY_LABELS[cat];
          const isActive = activeCategory === cat;
          return (
            <motion.button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`
                flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold
                transition-all duration-200
                ${isActive
                  ? 'bg-rose-400 text-white shadow-lg shadow-rose-200 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-base sm:text-lg">{info.icon}</span>
              <span>{info.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Avatar Grid */}
      <div
        className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-h-72 sm:max-h-96 overflow-y-auto px-1 custom-scrollbar"
        dir="rtl"
      >
        <AnimatePresence mode="popLayout">
          {AVATARS.filter((a) => a.category === activeCategory).map((avatar, idx) => {
            const isLocked = avatar.unlockLevel > currentLevel;
            const isSelected = avatarId === avatar.id;

            return (
              <motion.button
                key={avatar.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: idx * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => !isLocked && onAvatarSelect(avatar.id)}
                disabled={isLocked}
                className={`
                  relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl transition-all duration-200
                  min-h-[80px] sm:min-h-[100px]
                  ${isSelected
                    ? 'bg-amber-100 ring-4 ring-amber-400 shadow-lg shadow-amber-200 scale-110'
                    : isLocked
                      ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                      : 'bg-white hover:bg-amber-50 hover:shadow-md cursor-pointer border-2 border-gray-100 hover:border-amber-200'
                  }
                `}
                whileHover={!isLocked ? { scale: 1.08 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
              >
                {has3DAvatar(avatar.id) ? (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto">
                    <AvatarImage avatarId={avatar.id} size={48} className={`${isLocked ? 'grayscale opacity-50' : ''}`} />
                  </div>
                ) : (
                  <span className={`text-3xl sm:text-4xl ${isLocked ? 'grayscale' : ''}`}>
                    {avatar.emoji}
                  </span>
                )}
                <span className="text-[10px] sm:text-xs font-bold text-gray-600 mt-1 text-center leading-tight">
                  {avatar.name}
                </span>

                {/* Selection check mark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -left-1 bg-amber-400 text-white rounded-full size-5 sm:size-6 flex items-center justify-center text-xs font-bold shadow-md"
                  >
                    ✓
                  </motion.div>
                )}

                {/* Lock overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-2xl">
                    <span className="text-lg sm:text-xl">🔒</span>
                    <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold mt-0.5">
                      مستوى {avatar.unlockLevel}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Selected avatar preview */}
      <AnimatePresence>
        {selectedAvatar && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="text-center"
          >
            <Card className="inline-block border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-amber-50 shadow-lg">
              <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                {has3DAvatar(selectedAvatar.id) ? (
                    <div className="w-14 h-14 sm:w-16 sm:h-16">
                      <AvatarImage avatarId={selectedAvatar.id} size={64} />
                    </div>
                  ) : (
                    <span className="text-4xl sm:text-5xl">{selectedAvatar.emoji}</span>
                  )}
                <div className="text-right">
                  <p className="text-gray-500 text-xs sm:text-sm">شخصيتك</p>
                  <p className="text-lg sm:text-xl font-extrabold text-rose-600">
                    {selectedAvatar.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface Step3Props {
  name: string;
  displayName: string;
  avatarId: string;
  favoriteColor: string;
  age: number;
  onColorSelect: (id: string) => void;
  onAgeSelect: (age: number) => void;
  direction: number;
}

function Step3({
  name,
  displayName,
  avatarId,
  favoriteColor,
  age,
  onColorSelect,
  onAgeSelect,
  direction,
}: Step3Props) {
  const selectedAvatar = AVATARS.find((a) => a.id === avatarId);
  const isValid = favoriteColor !== '' && age >= 5 && age <= 12;

  return (
    <motion.div
      key="step3"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
      className="space-y-6 sm:space-y-8"
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-600 mb-2">
          كمل بياناتك 🎨
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">اختار لونك المفضل وعمرك!</p>
      </motion.div>

      {/* Color Picker */}
      <div dir="rtl">
        <label className="block text-base sm:text-lg font-bold text-gray-700 mb-3 text-center">
          لونك المفضل 🌈
        </label>
        <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-sm mx-auto">
          {COLOR_OPTIONS.map((color, idx) => {
            const isSelected = favoriteColor === color.id;
            return (
              <motion.button
                key={color.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.06, type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => onColorSelect(color.id)}
                className={`
                  relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl transition-all duration-200
                  min-h-[70px] sm:min-h-[85px]
                  ${isSelected
                    ? `bg-white ring-4 shadow-lg scale-110 ${color.ring}`
                    : 'bg-white hover:shadow-md border-2 border-gray-100 hover:border-gray-200'
                  }
                `}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <div
                  className={`size-10 sm:size-12 rounded-full bg-gradient-to-br ${color.gradient} shadow-md`}
                />
                <span className="text-[9px] sm:text-xs font-bold text-gray-600 mt-1.5 text-center leading-tight">
                  {color.name}
                </span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -left-1 bg-emerald-400 text-white rounded-full size-5 sm:size-6 flex items-center justify-center text-xs font-bold shadow-md"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Age Selector */}
      <div dir="rtl">
        <label className="block text-base sm:text-lg font-bold text-gray-700 mb-3 text-center">
          كم عمرك؟ 🎂
        </label>
        <div className="flex justify-center gap-2 sm:gap-3 flex-wrap max-w-md mx-auto">
          {[5, 6, 7, 8, 9, 10, 11, 12].map((a, idx) => {
            const isSelected = age === a;
            return (
              <motion.button
                key={a}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => onAgeSelect(a)}
                className={`
                  flex items-center justify-center rounded-2xl font-extrabold
                  transition-all duration-200
                  size-12 sm:size-14 text-lg sm:text-xl
                  ${isSelected
                    ? 'bg-emerald-400 text-white shadow-lg shadow-emerald-200 scale-110'
                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600'
                  }
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {a}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Summary preview */}
      <AnimatePresence>
        {isValid && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="text-center"
          >
            <Card className="inline-block border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
              <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4" dir="rtl">
                {selectedAvatar && (
                  has3DAvatar(selectedAvatar.id) ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14">
                      <AvatarImage avatarId={selectedAvatar.id} size={56} />
                    </div>
                  ) : (
                    <span className="text-3xl sm:text-4xl">{selectedAvatar.emoji}</span>
                  )
                )}
                <div className="text-right">
                  <p className="text-lg sm:text-xl font-extrabold text-emerald-600">
                    {displayName || name}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    عمره {age} سنوات • لونه المفضل{' '}
                    {COLOR_OPTIONS.find((c) => c.id === favoriteColor)?.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ProfileSetup({ onComplete, onBack }: ProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarId, setAvatarId] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('');
  const [age, setAge] = useState<number>(7);
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('animals');
  const { play: playSound } = useSound();

  // Current user level for avatar unlocking — new users start at 0
  const currentLevel = 0;

  const goNext = useCallback(() => {
    playSound('click');
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  }, [playSound]);

  const goPrev = useCallback(() => {
    playSound('click');
    if (step === 0) {
      onBack();
      return;
    }
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, [step, onBack, playSound]);

  const handleComplete = useCallback(() => {
    playSound('levelUp');
    onComplete({
      name,
      displayName: displayName || name,
      age,
      avatarId,
      favoriteColor,
    });
  }, [name, displayName, age, avatarId, favoriteColor, onComplete, playSound]);

  const isStep1Valid = name.trim().length >= 2;
  const isStep2Valid = avatarId !== '';
  const isStep3Valid = favoriteColor !== '' && age >= 5 && age <= 12;
  const isValid = [isStep1Valid, isStep2Valid, isStep3Valid];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-rose-50 to-emerald-50"
      dir="rtl"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="border-2 border-amber-200 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-5 sm:p-8">
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={step === 0 ? onBack : goPrev}
              className="mb-4 flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-sm font-bold"
            >
              <span>→</span>
              <span>رجوع</span>
            </motion.button>

            {/* Progress Indicator */}
            <ProgressIndicator step={step} />

            {/* Step Content */}
            <div className="relative overflow-hidden min-h-[340px] sm:min-h-[400px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {step === 0 && (
                  <Step1
                    key="step1"
                    name={name}
                    displayName={displayName}
                    onNameChange={setName}
                    onDisplayNameChange={setDisplayName}
                    direction={direction}
                  />
                )}
                {step === 1 && (
                  <Step2
                    key="step2"
                    avatarId={avatarId}
                    onAvatarSelect={setAvatarId}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    currentLevel={currentLevel}
                    direction={direction}
                  />
                )}
                {step === 2 && (
                  <Step3
                    key="step3"
                    name={name}
                    displayName={displayName}
                    avatarId={avatarId}
                    favoriteColor={favoriteColor}
                    age={age}
                    onColorSelect={setFavoriteColor}
                    onAgeSelect={setAge}
                    direction={direction}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col gap-3">
              {step < 2 ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={goNext}
                    disabled={!isValid[step]}
                    className={`
                      w-full h-14 sm:h-16 text-lg sm:text-xl font-extrabold rounded-2xl
                      transition-all duration-200
                      ${isValid[step]
                        ? 'bg-amber-400 hover:bg-amber-500 text-white shadow-lg shadow-amber-200'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    التالي ←
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleComplete}
                    disabled={!isValid[step]}
                    className={`
                      w-full h-14 sm:h-16 text-lg sm:text-xl font-extrabold rounded-2xl
                      transition-all duration-200
                      ${isValid[step]
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-200'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    يلا نبدأ! 🚀
                  </Button>
                </motion.div>
              )}

              {/* Step hints */}
              <p className="text-center text-xs sm:text-sm text-gray-400">
                {!isValid[step] && step === 0 && 'اكتب اسمك عشان تكمل ✏️'}
                {!isValid[step] && step === 1 && 'اختار شخصية عشان تكمل 🎭'}
                {!isValid[step] && step === 2 && 'اختار لونك وعمرك 🎨'}
                {isValid[step] && step === 0 && 'ممتاز! يلا نكمل 🌟'}
                {isValid[step] && step === 1 && 'شخصية رهيبة! يلا نكمل 🎉'}
                {isValid[step] && step === 2 && 'كل حاجة جاهزة! 🚀'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative footer */}
        <motion.div
          className="text-center mt-4 text-gray-300 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          ✨ منصة تعلم جدول الضرب ✨
        </motion.div>
      </motion.div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}</style>
    </div>
  );
}
