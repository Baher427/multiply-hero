'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

interface GameSelectorProps {
  onSelectGame: (
    gameType: string,
    tableNumber: number | 'mixed',
    difficulty: 'easy' | 'medium' | 'hard'
  ) => void;
  onBack: () => void;
  recommendedTable?: number;
}

const WORLD_NAMES: Record<number, string> = {
  1: 'جزيرة الأرقام',
  2: 'غابة الضرب',
  3: 'محيط الثلاثة',
  4: 'جبل الأربعة',
  5: 'وادي الحلوى',
  6: 'فضاء الستة',
  7: 'قلعة السبعة',
  8: 'عالم الألوان',
  9: 'مملكة التسعة',
};

const GAME_TYPES = [
  {
    id: 'multiple-choice',
    emoji: '🎯',
    name: 'اختيار من متعدد',
    description: 'اختر الإجابة الصحيحة من بين أربعة خيارات ممتعة',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    selectedBg: 'bg-gradient-to-br from-purple-100 to-pink-100',
    borderColor: 'border-purple-300',
    glowColor: 'ring-purple-400',
    textColor: 'text-purple-700',
  },
  {
    id: 'true-false',
    emoji: '✅',
    name: 'صح أم غلط',
    description: 'حدد هل العبارة الرياضية صحيحة أم خاطئة',
    gradient: 'from-teal-500 to-emerald-500',
    bgGradient: 'from-teal-50 to-emerald-50',
    selectedBg: 'bg-gradient-to-br from-teal-100 to-emerald-100',
    borderColor: 'border-teal-300',
    glowColor: 'ring-teal-400',
    textColor: 'text-teal-700',
  },
  {
    id: 'matching',
    emoji: '🔗',
    name: 'توصيل',
    description: 'صِل عملية الضرب بالناتج الصحيح لها',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50',
    selectedBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
    borderColor: 'border-amber-300',
    glowColor: 'ring-amber-400',
    textColor: 'text-amber-700',
  },
  {
    id: 'fill-blank',
    emoji: '✏️',
    name: 'أكمل الفراغ',
    description: 'اكتب الرقم الناقص وأكمل العملية الحسابية',
    gradient: 'from-rose-500 to-red-500',
    bgGradient: 'from-rose-50 to-red-50',
    selectedBg: 'bg-gradient-to-br from-rose-100 to-red-100',
    borderColor: 'border-rose-300',
    glowColor: 'ring-rose-400',
    textColor: 'text-rose-700',
  },
];

const DIFFICULTY_OPTIONS = [
  {
    id: 'easy' as const,
    name: 'سهل',
    emoji: '😊',
    description: 'أسئلة قليلة وأكثر وقت',
    color: 'bg-emerald-100 border-emerald-400 text-emerald-700',
    selectedColor: 'bg-emerald-500 text-white border-emerald-600',
    glowColor: 'ring-emerald-300',
  },
  {
    id: 'medium' as const,
    name: 'متوسط',
    emoji: '🤔',
    description: 'تحدّي متوازن',
    color: 'bg-amber-100 border-amber-400 text-amber-700',
    selectedColor: 'bg-amber-500 text-white border-amber-600',
    glowColor: 'ring-amber-300',
  },
  {
    id: 'hard' as const,
    name: 'صعب',
    emoji: '🔥',
    description: 'أسئلة أكثر ووقت أقل',
    color: 'bg-red-100 border-red-400 text-red-700',
    selectedColor: 'bg-red-500 text-white border-red-600',
    glowColor: 'ring-red-300',
  },
];

export default function GameSelector({
  onSelectGame,
  onBack,
  recommendedTable,
}: GameSelectorProps) {
  const { play: playSound } = useSound();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | 'mixed'>(recommendedTable || 1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const tableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  const canStart = selectedGame !== null;

  const handleStart = () => {
    if (!canStart) return;
    playSound('levelUp');
    onSelectGame(selectedGame, selectedTable, selectedDifficulty);
  };

  const handleSelectGame = (gameId: string) => {
    playSound('click');
    setSelectedGame(gameId);
  };

  const handleSelectTable = (table: number | 'mixed') => {
    playSound('click');
    setSelectedTable(table);
  };

  const handleSelectDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    playSound('click');
    setSelectedDifficulty(diff);
  };

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-gradient-to-b from-violet-50 to-orange-50 p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { playSound('click'); onBack(); }}
          className="text-gray-500 hover:text-gray-700"
        >
          رجوع
          <ArrowRight className="w-4 h-4 mr-1" />
        </Button>
        <h1 className="text-2xl font-extrabold text-gray-800">🎮 اختر اللعبة</h1>
      </div>

      {/* Game Type Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3 text-center">نوع اللعبة</p>
        <div className="grid grid-cols-2 gap-4">
          {GAME_TYPES.map((game) => {
            const isSelected = selectedGame === game.id;
            return (
              <motion.button
                key={game.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelectGame(game.id)}
                className={`relative rounded-2xl p-5 text-center border-2 transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? `${game.selectedBg} ${game.borderColor} shadow-lg ring-2 ring-offset-2 ${game.glowColor} scale-[1.02]`
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Background gradient overlay when selected */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.12 }}
                    className={`absolute inset-0 bg-gradient-to-br ${game.gradient}`}
                  />
                )}
                <div className="relative z-10">
                  <motion.span
                    className="text-5xl block mb-3"
                    animate={isSelected ? { 
                      scale: [1, 1.3, 1], 
                      rotate: [0, 10, -10, 0] 
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {game.emoji}
                  </motion.span>
                  <p className={`font-bold text-base mb-2 ${isSelected ? game.textColor : 'text-gray-700'}`}>
                    {game.name}
                  </p>
                  <p className={`text-xs leading-relaxed ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                    {game.description}
                  </p>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="mt-3"
                    >
                      <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                        ✓ تم الاختيار
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Table Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3 text-center">جدول الضرب</p>
        <div className="grid grid-cols-3 gap-3">
          {tableNumbers.map((num) => {
            const isSelected = selectedTable === num;
            const isRecommended = recommendedTable === num;
            return (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectTable(num)}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer aspect-[4/3] ${
                  isSelected
                    ? 'border-purple-500 shadow-lg ring-2 ring-offset-2 ring-purple-400 scale-[1.02]'
                    : 'border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300'
                }`}
              >
                {/* World Image */}
                <Image
                  src={`/images/worlds/world${num}.png`}
                  alt={WORLD_NAMES[num]}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 30vw, 150px"
                />
                {/* Overlay */}
                <div className={`absolute inset-0 transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-t from-purple-900/80 via-purple-600/40 to-transparent' 
                    : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
                }`} />
                
                {/* Recommended Badge */}
                {isRecommended && !isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 left-1 z-20 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md"
                  >
                    ⭐ موصى به
                  </motion.div>
                )}

                {/* Selected glow border */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 z-10 pointer-events-none" 
                    style={{ boxShadow: '0 0 12px 3px rgba(168, 85, 247, 0.4)' }} 
                  />
                )}

                {/* Content */}
                <div className="absolute bottom-0 right-0 left-0 p-2 z-10">
                  <span className={`text-3xl font-extrabold block leading-none ${
                    isSelected ? 'text-white' : 'text-white'
                  }`}>
                    {num}
                  </span>
                  <span className={`text-[10px] font-medium block mt-0.5 ${
                    isSelected ? 'text-purple-100' : 'text-gray-200'
                  }`}>
                    {WORLD_NAMES[num]}
                  </span>
                </div>
              </motion.button>
            );
          })}
          {/* Mixed button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectTable('mixed')}
            className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer aspect-[4/3] ${
              selectedTable === 'mixed'
                ? 'border-amber-500 shadow-lg ring-2 ring-offset-2 ring-amber-400 scale-[1.02]'
                : 'border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300'
            }`}
          >
            <div className={`absolute inset-0 ${
              selectedTable === 'mixed'
                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                : 'bg-gradient-to-br from-amber-100 to-orange-100'
            }`} />
            {selectedTable === 'mixed' && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none" 
                style={{ boxShadow: 'inset 0 0 12px 3px rgba(251, 191, 36, 0.3)' }} 
              />
            )}
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <span className="text-3xl mb-1">🎲</span>
              <span className={`text-sm font-bold ${selectedTable === 'mixed' ? 'text-white' : 'text-amber-700'}`}>
                مختلط
              </span>
            </div>
          </motion.button>
        </div>
        {recommendedTable && selectedTable !== recommendedTable && (
          <p className="text-xs text-amber-500 text-center mt-2">
            💡 ننصح بجدول الضرب {recommendedTable}
          </p>
        )}
      </div>

      {/* Difficulty Selection */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-3 text-center">المستوى</p>
        <div className="flex gap-3 justify-center">
          {DIFFICULTY_OPTIONS.map((diff) => (
            <motion.button
              key={diff.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectDifficulty(diff.id)}
              className={`flex-1 max-w-[130px] rounded-2xl p-4 text-center border-2 transition-all cursor-pointer ${
                selectedDifficulty === diff.id 
                  ? `${diff.selectedColor} ring-2 ring-offset-1 ${diff.glowColor} shadow-md` 
                  : diff.color
              }`}
            >
              <span className="text-2xl block mb-1">{diff.emoji}</span>
              <span className="font-bold text-sm block">{diff.name}</span>
              <span className={`text-[10px] block mt-1 leading-tight ${
                selectedDifficulty === diff.id ? 'text-white/80' : 'text-current opacity-60'
              }`}>
                {diff.description}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="mt-auto pb-4">
        <motion.button
          whileHover={canStart ? { scale: 1.02 } : {}}
          whileTap={canStart ? { scale: 0.98 } : {}}
          onClick={handleStart}
          disabled={!canStart}
          className={`relative w-full rounded-2xl p-5 text-xl font-extrabold transition-all overflow-hidden ${
            canStart
              ? 'bg-gradient-to-l from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {/* Animated gradient shimmer when enabled */}
          {canStart && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-l from-orange-400 via-pink-400 to-purple-400"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ backgroundSize: '200% 100%' }}
            />
          )}
          
          {/* Pulsing glow effect */}
          {canStart && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                  '0 0 40px rgba(236, 72, 153, 0.5)',
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          <span className="relative z-10 flex items-center justify-center gap-2">
            {canStart ? (
              <>
                <Sparkles className="w-6 h-6" />
                🚀 ابدأ اللعب!
              </>
            ) : (
              'اختر نوع اللعبة أولاً 👆'
            )}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
