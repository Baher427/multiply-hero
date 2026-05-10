'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AvatarImage, { has3DAvatar, getAvatarEmoji } from '@/components/shared/AvatarImage';
import { useSound } from '@/hooks/use-sound';
import { AVATARS, COLORS } from '@/lib/game-engine/constants';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SettingsPageProps {
  child: {
    id: string;
    name: string;
    displayName: string;
    avatarId: string;
    favoriteColor: string;
    level: number;
  };
  onBack: () => void;
  onUpdateProfile: (updates: Partial<{ displayName: string; avatarId: string; favoriteColor: string }>) => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
}

// ─── Color Options ──────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { id: 'emerald', name: 'أخضر زمردي', gradient: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-400', value: '#10b981' },
  { id: 'cyan', name: 'سماوي', gradient: 'from-cyan-400 to-cyan-600', ring: 'ring-cyan-400', value: '#06b6d4' },
  { id: 'amber', name: 'عنبري', gradient: 'from-amber-400 to-amber-600', ring: 'ring-amber-400', value: '#f59e0b' },
  { id: 'rose', name: 'وردي', gradient: 'from-rose-400 to-rose-600', ring: 'ring-rose-400', value: '#f43f5e' },
  { id: 'violet', name: 'بنفسجي', gradient: 'from-violet-400 to-violet-600', ring: 'ring-violet-400', value: '#8b5cf6' },
  { id: 'orange', name: 'برتقالي', gradient: 'from-orange-400 to-orange-600', ring: 'ring-orange-400', value: '#f97316' },
  { id: 'teal', name: 'تركوازي', gradient: 'from-teal-400 to-teal-600', ring: 'ring-teal-400', value: '#14b8a6' },
  { id: 'pink', name: 'وردي فاتح', gradient: 'from-pink-400 to-pink-600', ring: 'ring-pink-400', value: '#ec4899' },
];

// ─── Sound Test Buttons ─────────────────────────────────────────────────────────

const SOUND_TESTS = [
  { id: 'correct', label: 'إجابة صحيحة', emoji: '✅' },
  { id: 'wrong', label: 'إجابة خاطئة', emoji: '❌' },
  { id: 'combo', label: 'كومبو', emoji: '🔥' },
  { id: 'levelUp', label: 'مستوى جديد', emoji: '⬆️' },
  { id: 'badge', label: 'إنجاز', emoji: '🏅' },
  { id: 'click', label: 'نقرة', emoji: '👆' },
  { id: 'star', label: 'نجمة', emoji: '⭐' },
  { id: 'coins', label: 'عملات', emoji: '🪙' },
  { id: 'gameOver', label: 'نهاية اللعبة', emoji: '🎮' },
  { id: 'match', label: 'تطابق', emoji: '🔗' },
  { id: 'countdown', label: 'عد تنازلي', emoji: '⏱️' },
];

// ─── Avatar Category ────────────────────────────────────────────────────────────

type AvatarCategory = 'animal' | 'emoji' | 'fruit' | 'object';

const CATEGORY_LABELS: Record<AvatarCategory, { label: string; icon: string }> = {
  animal: { label: 'حيوانات', icon: '🐾' },
  emoji: { label: 'وجوه', icon: '😊' },
  fruit: { label: 'فواكه', icon: '🍓' },
  object: { label: 'أشياء', icon: '⭐' },
};

const CATEGORY_ORDER: AvatarCategory[] = ['animal', 'emoji', 'fruit', 'object'];

// ─── Animation Variants ─────────────────────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 },
  }),
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function SettingsPage({
  child,
  onBack,
  onUpdateProfile,
  soundEnabled,
  musicEnabled,
  toggleSound,
  toggleMusic,
}: SettingsPageProps) {
  const { play } = useSound();

  // Profile editing state
  const [editName, setEditName] = useState(child.displayName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(child.avatarId);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(child.favoriteColor);
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('animal');

  // Volume state
  const [volume, setVolume] = useState(75);

  // Dialog states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle name save
  const handleSaveName = useCallback(() => {
    if (editName.trim().length >= 2) {
      onUpdateProfile({ displayName: editName.trim() });
      setIsEditingName(false);
      play('levelUp');
    }
  }, [editName, onUpdateProfile, play]);

  // Handle avatar change
  const handleAvatarSelect = useCallback((avatarId: string) => {
    setSelectedAvatar(avatarId);
    onUpdateProfile({ avatarId });
    play('click');
  }, [onUpdateProfile, play]);

  // Handle color change
  const handleColorSelect = useCallback((colorId: string) => {
    setSelectedColor(colorId);
    onUpdateProfile({ favoriteColor: colorId });
    play('click');
  }, [onUpdateProfile, play]);

  // Handle sound toggle
  const handleSoundToggle = useCallback(() => {
    toggleSound();
    play('click');
  }, [toggleSound, play]);

  // Handle music toggle
  const handleMusicToggle = useCallback(() => {
    toggleMusic();
    play('click');
  }, [toggleMusic, play]);

  // Test sound
  const handleTestSound = useCallback((soundId: string) => {
    play(soundId as any);
  }, [play]);

  // Reset progress
  const handleResetProgress = useCallback(async () => {
    try {
      await fetch(`/api/progress?childId=${child.id}`, { method: 'DELETE' });
      await fetch(`/api/badges?childId=${child.id}`, { method: 'DELETE' });
      setResetDialogOpen(false);
      play('gameOver');
    } catch (error) {
      console.error('Failed to reset progress:', error);
    }
  }, [child.id, play]);

  // Delete account
  const handleDeleteAccount = useCallback(async () => {
    try {
      await fetch(`/api/children/${child.id}`, { method: 'DELETE' });
      setDeleteDialogOpen(false);
      onBack();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  }, [child.id, onBack]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full pb-8"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #e0f2fe 60%, #d1fae5 100%)',
      }}
    >
      {/* ─── Floating Background Decorations ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute top-20 right-10 text-6xl opacity-20"
        >
          ⚙️
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-40 left-16 text-5xl opacity-15"
        >
          🎵
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute bottom-32 right-24 text-4xl opacity-15"
        >
          🎨
        </motion.div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-3 md:px-6 flex flex-col gap-5 pt-4">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-slate-700 to-slate-600 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 left-8 w-3 h-3 rounded-full bg-white" />
              <div className="absolute top-6 right-20 w-2 h-2 rounded-full bg-yellow-200" />
              <div className="absolute bottom-4 left-24 w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <CardContent className="p-4 md:p-5 relative z-10">
              <div className="flex items-center gap-4">
                {/* Back Button */}
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white text-lg backdrop-blur-sm"
                  aria-label="رجوع"
                >
                  →
                </motion.button>

                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm flex items-center gap-2">
                    ⚙️ الإعدادات
                  </h1>
                  <p className="text-white/60 text-sm mt-1">
                    خصّص تجربتك كما تحب!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Sound Controls Section ─── */}
        <motion.div
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                🔊 التحكم بالصوت
              </h2>

              <div className="space-y-5">
                {/* Sound Effects Toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-slate-700 text-base">المؤثرات الصوتية</p>
                    <p className="text-sm text-slate-500">أصوات الإجابات والأزرار</p>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={handleSoundToggle}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-700 text-base">مستوى الصوت</p>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {volume}%
                    </span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(val) => setVolume(val[0])}
                    max={100}
                    step={5}
                    disabled={!soundEnabled}
                    className={`w-full ${!soundEnabled ? 'opacity-40' : ''}`}
                  />
                </div>

                {/* Music Toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-slate-700 text-base">الموسيقى الخلفية</p>
                    <p className="text-sm text-slate-500">موسيقى أثناء اللعب</p>
                  </div>
                  <Switch
                    checked={musicEnabled}
                    onCheckedChange={handleMusicToggle}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                {/* Test Sound Buttons */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-700 text-base">اختبر الأصوات 🎵</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {SOUND_TESTS.map((sound) => (
                      <motion.button
                        key={sound.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTestSound(sound.id)}
                        disabled={!soundEnabled}
                        className={`
                          flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all duration-200
                          ${soundEnabled
                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 cursor-pointer'
                            : 'bg-gray-50 border border-gray-200 cursor-not-allowed opacity-50'
                          }
                        `}
                      >
                        <span className="text-xl">{sound.emoji}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-center leading-tight">
                          {sound.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Profile Section ─── */}
        <motion.div
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                👤 الملف الشخصي
              </h2>

              <div className="space-y-5">
                {/* Current Avatar & Name Display */}
                <div className="flex items-center gap-4 bg-gradient-to-l from-amber-50 to-orange-50 p-4 rounded-2xl">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-lg border-3 border-white/50 cursor-pointer overflow-hidden"
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  >
                    <AvatarImage avatarId={selectedAvatar} size={64} />
                  </motion.div>
                  <div className="flex-1">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-right font-bold text-lg rounded-xl border-2 border-amber-300 focus:border-amber-400 h-10"
                          maxLength={30}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleSaveName}
                          className="w-9 h-9 rounded-full bg-emerald-400 text-white flex items-center justify-center text-lg shadow-md shrink-0"
                        >
                          ✓
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setIsEditingName(false); setEditName(child.displayName); }}
                          className="w-9 h-9 rounded-full bg-gray-300 text-white flex items-center justify-center text-lg shadow-md shrink-0"
                        >
                          ✕
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xl md:text-2xl font-black text-amber-700">
                          {child.displayName}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setIsEditingName(true); play('click'); }}
                          className="w-7 h-7 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-sm shadow-sm"
                          aria-label="تعديل الاسم"
                        >
                          ✏️
                        </motion.button>
                      </div>
                    )}
                    <p className="text-sm text-amber-600/70 mt-0.5">
                      المستوى {child.level} • اضغط على الشخصية لتغييرها
                    </p>
                  </div>
                </div>

                {/* Avatar Picker */}
                <AnimatePresence>
                  {showAvatarPicker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl p-4 space-y-3">
                        <p className="text-base font-bold text-slate-700 text-center">اختار شخصيتك الجديدة 🎭</p>

                        {/* Category Tabs */}
                        <div className="flex justify-center gap-2 flex-wrap">
                          {CATEGORY_ORDER.map((cat) => {
                            const info = CATEGORY_LABELS[cat];
                            const isActive = activeCategory === cat;
                            return (
                              <motion.button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); play('click'); }}
                                className={`
                                  flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold
                                  transition-all duration-200
                                  ${isActive
                                    ? 'bg-rose-400 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                  }
                                `}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <span>{info.icon}</span>
                                <span>{info.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Avatar Grid */}
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto custom-scrollbar px-1">
                          {AVATARS.filter((a) => a.category === activeCategory).map((avatar, idx) => {
                            const isLocked = avatar.unlockLevel > child.level;
                            const isSelected = selectedAvatar === avatar.id;

                            return (
                              <motion.button
                                key={avatar.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.03, type: 'spring', stiffness: 400, damping: 20 }}
                                onClick={() => !isLocked && handleAvatarSelect(avatar.id)}
                                disabled={isLocked}
                                className={`
                                  relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200
                                  min-h-[64px]
                                  ${isSelected
                                    ? 'bg-amber-100 ring-3 ring-amber-400 shadow-lg scale-110'
                                    : isLocked
                                      ? 'bg-gray-100/50 opacity-50 cursor-not-allowed'
                                      : 'bg-white hover:bg-amber-50 hover:shadow-sm cursor-pointer border border-gray-100'
                                  }
                                `}
                                whileHover={!isLocked ? { scale: 1.08 } : {}}
                                whileTap={!isLocked ? { scale: 0.95 } : {}}
                              >
                                {has3DAvatar(avatar.id) ? (
                                  <div className="w-8 h-8 mx-auto">
                                    <AvatarImage avatarId={avatar.id} size={32} className={isLocked ? 'grayscale opacity-50' : ''} />
                                  </div>
                                ) : (
                                  <span className={`text-2xl ${isLocked ? 'grayscale' : ''}`}>
                                    {avatar.emoji}
                                  </span>
                                )}
                                <span className="text-[8px] sm:text-[10px] font-bold text-gray-600 mt-0.5 text-center leading-tight">
                                  {avatar.name}
                                </span>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -left-1 bg-amber-400 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[8px] sm:text-[10px] font-bold shadow-md"
                                  >
                                    ✓
                                  </motion.div>
                                )}
                                {isLocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
                                    <span className="text-sm">🔒</span>
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>

                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setShowAvatarPicker(false); play('click'); }}
                            className="rounded-full text-sm font-bold"
                          >
                            تم ✓
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Favorite Color */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-700 text-base">لونك المفضل 🎨</p>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {COLOR_OPTIONS.map((color, idx) => {
                      const isSelected = selectedColor === color.id;
                      return (
                        <motion.button
                          key={color.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: idx * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
                          onClick={() => handleColorSelect(color.id)}
                          className={`
                            relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200
                            min-h-[60px] sm:min-h-[72px]
                            ${isSelected
                              ? `bg-white ring-3 shadow-lg scale-110 ${color.ring}`
                              : 'bg-white hover:shadow-md border border-gray-100 hover:border-gray-200'
                            }
                          `}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${color.gradient} shadow-md`}
                          />
                          <span className="text-[8px] sm:text-[10px] font-bold text-gray-600 mt-1 text-center leading-tight">
                            {color.name}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -left-1 bg-emerald-400 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[8px] sm:text-[10px] font-bold shadow-md"
                            >
                              ✓
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── App Info Section ─── */}
        <motion.div
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-l from-cyan-50 to-emerald-50 overflow-hidden">
            <CardContent className="p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                ℹ️ حول التطبيق
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/60 rounded-xl p-3">
                  <span className="font-bold text-slate-700 text-sm">إصدار التطبيق</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">1.0.0</span>
                </div>
                <div className="flex items-center justify-between bg-white/60 rounded-xl p-3">
                  <span className="font-bold text-slate-700 text-sm">اسم التطبيق</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">بطل الضرب ✨</span>
                </div>
                <div className="flex items-center justify-between bg-white/60 rounded-xl p-3">
                  <span className="font-bold text-slate-700 text-sm">الفئة المستهدفة</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-sm">أطفال 5-12 سنة 👧👦</span>
                </div>

                {/* Credits */}
                <div className="bg-white/40 rounded-xl p-4 mt-3 border border-white/60">
                  <p className="text-center text-sm font-bold text-slate-600 mb-2">شكر وتقدير 🙏</p>
                  <p className="text-center text-xs text-slate-500 leading-relaxed">
                    صُمّم هذا التطبيق بحب لمساعدة الأطفال في تعلم جدول الضرب بطريقة ممتعة وتفاعلية.
                    كل الأصوات مُولّدة رقمياً باستخدام Web Audio API.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Danger Zone Section ─── */}
        <motion.div
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden border-r-4 border-r-red-400">
            <CardContent className="p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-black text-red-600 mb-4 flex items-center gap-2">
                ⚠️ منطقة الخطر
              </h2>

              <div className="space-y-4">
                {/* Reset Progress */}
                <div className="flex items-center justify-between gap-3 bg-red-50 rounded-xl p-4">
                  <div className="flex-1">
                    <p className="font-bold text-red-700 text-base">إعادة تعيين التقدم</p>
                    <p className="text-sm text-red-500">حذف كل النقاط والإنجازات والتقدم</p>
                  </div>
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl font-bold"
                        onClick={() => play('click')}
                      >
                        إعادة تعيين
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="sm:max-w-md rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2 text-xl">
                          ⚠️ تأكيد إعادة التعيين
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                          هل أنت متأكد من حذف كل التقدم؟ سيتم حذف جميع النقاط والنجوم والإنجازات والعملات. هذا الإجراء <span className="font-bold text-red-600">لا يمكن التراجع عنه!</span>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex gap-3 sm:gap-3 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => { setResetDialogOpen(false); play('click'); }}
                          className="rounded-xl flex-1 font-bold"
                        >
                          إلغاء
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleResetProgress}
                          className="rounded-xl flex-1 font-bold"
                        >
                          نعم، احذف الكل 🗑️
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Delete Account */}
                <div className="flex items-center justify-between gap-3 bg-red-50 rounded-xl p-4">
                  <div className="flex-1">
                    <p className="font-bold text-red-700 text-base">حذف الحساب</p>
                    <p className="text-sm text-red-500">حذف الحساب نهائياً وكل البيانات</p>
                  </div>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl font-bold bg-red-700 hover:bg-red-800"
                        onClick={() => play('click')}
                      >
                        حذف الحساب
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="sm:max-w-md rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-red-700 flex items-center gap-2 text-xl">
                          🚨 حذف الحساب نهائياً
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                          هل أنت متأكد من حذف حساب <span className="font-bold">{child.displayName}</span>؟ سيتم حذف كل البيانات نهائياً بما فيها الملف الشخصي والتقدم والإنجازات. هذا الإجراء <span className="font-bold text-red-600">لا يمكن التراجع عنه أبداً!</span>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex gap-3 sm:gap-3 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => { setDeleteDialogOpen(false); play('click'); }}
                          className="rounded-xl flex-1 font-bold"
                        >
                          إلغاء
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          className="rounded-xl flex-1 font-bold bg-red-800 hover:bg-red-900"
                        >
                          نعم، احذف الحساب 💔
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Footer ─── */}
        <motion.div
          custom={4}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="text-center py-4"
        >
          <p className="text-sm font-bold text-slate-400">
            ✨ بطل الضرب - تعلم جدول الضرب بمتعة ✨
          </p>
          <p className="text-xs text-slate-300 mt-1">
            صُنع بـ 💚 للأطفال العرب
          </p>
        </motion.div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
