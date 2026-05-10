'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface GameSelectorProps {
  onSelectGame: (
    gameType: string,
    tableNumber: number | 'mixed',
    difficulty: 'easy' | 'medium' | 'hard'
  ) => void;
  onBack: () => void;
  recommendedTable?: number;
}

const GAME_TYPES = [
  {
    id: 'multiple-choice',
    emoji: '🎯',
    name: 'اختيار من متعدد',
    description: 'اختر الإجابة الصحيحة من أربعة خيارات',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
    iconBg: 'bg-purple-100',
  },
  {
    id: 'true-false',
    emoji: '✅',
    name: 'صح أم غلط',
    description: 'حدد هل العبارة صحيحة أم خاطئة',
    gradient: 'from-teal-500 to-emerald-500',
    bgGradient: 'from-teal-50 to-emerald-50',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-700',
    iconBg: 'bg-teal-100',
  },
  {
    id: 'matching',
    emoji: '🔗',
    name: 'توصيل',
    description: 'صِل عملية الضرب بناتجها الصحيح',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'fill-blank',
    emoji: '✏️',
    name: 'أكمل الفراغ',
    description: 'اكتب الرقم الناقص في العملية الحسابية',
    gradient: 'from-rose-500 to-red-500',
    bgGradient: 'from-rose-50 to-red-50',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-700',
    iconBg: 'bg-rose-100',
  },
];

const DIFFICULTY_OPTIONS = [
  {
    id: 'easy' as const,
    name: 'سهل',
    emoji: '😊',
    color: 'bg-emerald-100 border-emerald-400 text-emerald-700',
    selectedColor: 'bg-emerald-500 text-white border-emerald-600',
  },
  {
    id: 'medium' as const,
    name: 'متوسط',
    emoji: '🤔',
    color: 'bg-amber-100 border-amber-400 text-amber-700',
    selectedColor: 'bg-amber-500 text-white border-amber-600',
  },
  {
    id: 'hard' as const,
    name: 'صعب',
    emoji: '🔥',
    color: 'bg-red-100 border-red-400 text-red-700',
    selectedColor: 'bg-red-500 text-white border-red-600',
  },
];

export default function GameSelector({
  onSelectGame,
  onBack,
  recommendedTable,
}: GameSelectorProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | 'mixed'>(recommendedTable || 1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const tableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  const canStart = selectedGame !== null;

  const handleStart = () => {
    if (!canStart) return;
    onSelectGame(selectedGame, selectedTable, selectedDifficulty);
  };

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-gradient-to-b from-violet-50 to-orange-50 p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
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
        <div className="grid grid-cols-2 gap-3">
          {GAME_TYPES.map((game) => {
            const isSelected = selectedGame === game.id;
            return (
              <motion.button
                key={game.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedGame(game.id)}
                className={`rounded-2xl p-4 text-center border-2 transition-all cursor-pointer ${
                  isSelected
                    ? `${game.bgGradient} ${game.borderColor} shadow-lg ring-2 ring-offset-2 ring-purple-300`
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                <motion.span
                  className="text-4xl block mb-2"
                  animate={isSelected ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {game.emoji}
                </motion.span>
                <p className={`font-bold text-sm mb-1 ${isSelected ? game.textColor : 'text-gray-700'}`}>
                  {game.name}
                </p>
                <p className={`text-xs ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                  {game.description}
                </p>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2"
                  >
                    <span className="inline-block bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      ✓ تم الاختيار
                    </span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Table Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3 text-center">جدول الضرب</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {tableNumbers.map((num) => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedTable(num)}
              className={`w-12 h-12 rounded-xl text-lg font-bold border-2 transition-all cursor-pointer ${
                selectedTable === num
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 shadow-sm hover:border-purple-300'
              } ${recommendedTable === num && selectedTable !== num ? 'ring-2 ring-amber-300' : ''}`}
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedTable('mixed')}
            className={`h-12 px-4 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
              selectedTable === 'mixed'
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 shadow-sm hover:border-amber-300'
            }`}
          >
            🎲 مختلط
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
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`flex-1 max-w-[120px] rounded-2xl p-3 text-center border-2 transition-all cursor-pointer ${
                selectedDifficulty === diff.id ? diff.selectedColor : diff.color
              }`}
            >
              <span className="text-2xl block mb-1">{diff.emoji}</span>
              <span className="font-bold text-sm">{diff.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="mt-auto pb-4">
        <motion.button
          whileHover={canStart ? { scale: 1.03 } : {}}
          whileTap={canStart ? { scale: 0.97 } : {}}
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full rounded-2xl p-5 text-xl font-extrabold transition-all shadow-lg ${
            canStart
              ? 'bg-gradient-to-l from-purple-500 via-pink-500 to-orange-500 text-white hover:shadow-xl cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canStart ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" />
              ابدأ اللعبة! 🚀
            </span>
          ) : (
            'اختر نوع اللعبة أولاً 👆'
          )}
        </motion.button>
      </div>
    </div>
  );
}
