'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, Swords } from 'lucide-react';
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

const WORLD_EMOJIS: Record<number, string> = {
  1: '🏝️', 2: '🌳', 3: '🌊', 4: '⛰️', 5: '🍬',
  6: '🚀', 7: '🏰', 8: '🎨', 9: '👑',
};

const TABLE_GRADIENTS: Record<number, string> = {
  1: 'from-emerald-400 to-teal-500',
  2: 'from-lime-400 to-green-500',
  3: 'from-teal-400 to-cyan-500',
  4: 'from-amber-400 to-orange-500',
  5: 'from-pink-400 to-rose-500',
  6: 'from-violet-400 to-purple-500',
  7: 'from-orange-400 to-red-500',
  8: 'from-rose-400 to-pink-500',
  9: 'from-yellow-400 to-amber-500',
};

const TABLE_PREVIEW_PROBLEMS: Record<number, string[]> = {
  1: ['1×1', '1×5', '1×9'],
  2: ['2×3', '2×7', '2×9'],
  3: ['3×4', '3×6', '3×8'],
  4: ['4×2', '4×5', '4×7'],
  5: ['5×3', '5×6', '5×9'],
  6: ['6×2', '6×4', '6×8'],
  7: ['7×3', '7×5', '7×9'],
  8: ['8×2', '8×4', '8×7'],
  9: ['9×3', '9×6', '9×9'],
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
    difficulty: 'سهل',
    difficultyColor: 'text-green-600',
    icon: Zap,
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
    difficulty: 'سهل',
    difficultyColor: 'text-green-600',
    icon: Shield,
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
    difficulty: 'متوسط',
    difficultyColor: 'text-yellow-600',
    icon: Swords,
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
    difficulty: 'صعب',
    difficultyColor: 'text-red-600',
    icon: Sparkles,
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
    barColor: 'from-green-400 to-emerald-500',
    bars: 1,
  },
  {
    id: 'medium' as const,
    name: 'متوسط',
    emoji: '🤔',
    description: 'تحدّي متوازن',
    color: 'bg-amber-100 border-amber-400 text-amber-700',
    selectedColor: 'bg-amber-500 text-white border-amber-600',
    glowColor: 'ring-amber-300',
    barColor: 'from-yellow-400 to-amber-500',
    bars: 2,
  },
  {
    id: 'hard' as const,
    name: 'صعب',
    emoji: '🔥',
    description: 'أسئلة أكثر ووقت أقل',
    color: 'bg-red-100 border-red-400 text-red-700',
    selectedColor: 'bg-red-500 text-white border-red-600',
    glowColor: 'ring-red-300',
    barColor: 'from-orange-400 to-red-500',
    bars: 3,
  },
];

// ─── Floating Math Symbols ───────────────────────────────────────────────────

const MATH_SYMBOLS = [
  { symbol: '×', x: '5%', y: '8%', size: 'text-2xl', duration: 12, delay: 0 },
  { symbol: '+', x: '90%', y: '15%', size: 'text-xl', duration: 10, delay: 1 },
  { symbol: '=', x: '15%', y: '70%', size: 'text-lg', duration: 14, delay: 2 },
  { symbol: '÷', x: '80%', y: '60%', size: 'text-2xl', duration: 11, delay: 0.5 },
  { symbol: '−', x: '50%', y: '85%', size: 'text-xl', duration: 13, delay: 3 },
  { symbol: '×', x: '70%', y: '30%', size: 'text-lg', duration: 9, delay: 1.5 },
  { symbol: '3', x: '25%', y: '40%', size: 'text-3xl', duration: 15, delay: 4 },
  { symbol: '7', x: '60%', y: '10%', size: 'text-2xl', duration: 10, delay: 2.5 },
  { symbol: '9', x: '40%', y: '55%', size: 'text-xl', duration: 12, delay: 0.8 },
  { symbol: '5', x: '85%', y: '80%', size: 'text-2xl', duration: 11, delay: 3.5 },
  { symbol: '×', x: '30%', y: '20%', size: 'text-lg', duration: 14, delay: 1.2 },
  { symbol: '8', x: '10%', y: '90%', size: 'text-xl', duration: 10, delay: 2 },
];

function FloatingMathSymbols() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {MATH_SYMBOLS.map((s, i) => (
        <motion.div
          key={i}
          className={`absolute ${s.size} opacity-[0.07] select-none font-black text-slate-600`}
          style={{ left: s.x, top: s.y }}
          animate={{
            y: [0, -25, 0, 15, 0],
            x: [0, 8, -5, 6, 0],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.05, 0.1, 0.05, 0.08, 0.05],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {s.symbol}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Table Card with Mastery Level ───────────────────────────────────────────

function TableSelectionCard({
  tableNumber,
  isSelected,
  isRecommended,
  onSelect,
  index,
}: {
  tableNumber: number;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
  index: number;
}) {
  const gradient = TABLE_GRADIENTS[tableNumber];
  const emoji = WORLD_EMOJIS[tableNumber];
  const name = WORLD_NAMES[tableNumber];
  const previewProblems = TABLE_PREVIEW_PROBLEMS[tableNumber];

  return (
    <motion.button
      initial={{ opacity: 0, y: 25, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20, delay: index * 0.04 }}
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.94 }}
      onClick={onSelect}
      className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer w-full aspect-square ${
        isSelected
          ? `border-white shadow-2xl ring-4 ring-offset-2 ring-white/60 scale-[1.04]`
          : 'border-white/30 shadow-md hover:shadow-lg hover:border-white/60'
      }`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1 right-1 text-4xl rotate-12">{emoji}</div>
        <div className="absolute bottom-1 left-1 text-3xl -rotate-6">{emoji}</div>
      </div>

      {/* Selected glow border */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          animate={{
            boxShadow: [
              'inset 0 0 15px 2px rgba(255,255,255,0.3)',
              'inset 0 0 25px 4px rgba(255,255,255,0.5)',
              'inset 0 0 15px 2px rgba(255,255,255,0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Recommended pulsing badge */}
      {isRecommended && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 left-1 z-30"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="bg-white text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5"
          >
            ⭐ موصى به
          </motion.div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-2 gap-0.5">
        {/* Table Number - Large */}
        <motion.span
          className="text-3xl md:text-4xl font-black text-white drop-shadow-lg"
          animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {tableNumber}
        </motion.span>

        {/* World Emoji */}
        <span className="text-lg">{emoji}</span>

        {/* World Name */}
        <span className="text-[8px] md:text-[9px] font-bold text-white/80 truncate max-w-full">{name}</span>

        {/* Preview Problems */}
        <div className="flex gap-0.5 mt-0.5">
          {previewProblems.map((prob, pi) => (
            <span key={pi} className="text-[7px] md:text-[8px] font-mono font-bold text-white/60 bg-white/15 px-1 py-0 rounded">
              {prob}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GameSelector({
  onSelectGame,
  onBack,
  recommendedTable,
}: GameSelectorProps) {
  const { play: playSound } = useSound();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | 'mixed'>(recommendedTable || 1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentStep, setCurrentStep] = useState(0); // 0=game, 1=table, 2=difficulty

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
    setCurrentStep(1);
  };

  const handleSelectTable = (table: number | 'mixed') => {
    playSound('click');
    setSelectedTable(table);
    setCurrentStep(2);
  };

  const handleSelectDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    playSound('click');
    setSelectedDifficulty(diff);
  };

  const stepTitles = ['🎮 اختر اللعبة', '🔢 اختر الجدول', '⚡ اختر المستوى'];

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* ─── Background Floating Math Symbols ─── */}
      <FloatingMathSymbols />

      {/* ─── Background Glow Orbs ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-2/3 left-2/3 w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1 max-w-2xl mx-auto w-full p-4">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playSound('click'); onBack(); }}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            رجوع
            <ArrowRight className="w-4 h-4 mr-1" />
          </Button>
          <h1 className="text-2xl font-extrabold text-white">🎮 اختر اللعبة</h1>
        </div>

        {/* ─── Step Indicator ─── */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {[0, 1, 2].map((step) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  currentStep >= step
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/40'
                }`}
                animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                {step + 1}
              </motion.div>
              {step < 2 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                  currentStep > step ? 'bg-gradient-to-l from-purple-500 to-pink-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* ─── Step Title ─── */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-bold text-white/80 text-center mb-4"
          >
            {stepTitles[currentStep]}
          </motion.h2>
        </AnimatePresence>

        {/* ─── Step 1: Game Type Selection ─── */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="game-selection"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              {GAME_TYPES.map((game) => {
                const isSelected = selectedGame === game.id;
                const IconComp = game.icon;
                return (
                  <motion.button
                    key={game.id}
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectGame(game.id)}
                    className={`relative rounded-2xl p-5 text-center border-2 transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? `${game.selectedBg} ${game.borderColor} shadow-lg ring-2 ring-offset-2 ${game.glowColor} scale-[1.02]`
                        : 'bg-white/5 border-white/10 shadow-sm hover:shadow-md hover:bg-white/10'
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
                        animate={isSelected ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {game.emoji}
                      </motion.span>
                      <p className={`font-bold text-base mb-2 ${isSelected ? game.textColor : 'text-white/80'}`}>
                        {game.name}
                      </p>
                      <p className={`text-xs leading-relaxed mb-2 ${isSelected ? 'text-slate-600' : 'text-white/40'}`}>
                        {game.description}
                      </p>
                      {/* Difficulty indicator */}
                      <div className={`inline-flex items-center gap-1 text-[10px] font-bold ${isSelected ? game.textColor : 'text-white/30'}`}>
                        <IconComp className="w-3 h-3" />
                        {game.difficulty}
                      </div>
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Step 2: Table Selection Grid ─── */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="table-selection"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Back to game selection */}
              <motion.button
                onClick={() => setCurrentStep(0)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-white/50 hover:text-white/80 mb-3 flex items-center gap-1 transition-colors"
              >
                ← رجوع لاختيار اللعبة
              </motion.button>

              <div className="grid grid-cols-3 gap-3 mb-3">
                {tableNumbers.map((num, idx) => (
                  <TableSelectionCard
                    key={num}
                    tableNumber={num}
                    isSelected={selectedTable === num}
                    isRecommended={recommendedTable === num}
                    onSelect={() => handleSelectTable(num)}
                    index={idx}
                  />
                ))}
                {/* Mixed option */}
                <motion.button
                  initial={{ opacity: 0, y: 25, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 9 * 0.04 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleSelectTable('mixed')}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer w-full aspect-square ${
                    selectedTable === 'mixed'
                      ? 'border-white shadow-2xl ring-4 ring-offset-2 ring-white/60 scale-[1.04]'
                      : 'border-white/30 shadow-md hover:shadow-lg hover:border-white/60'
                  }`}
                >
                  <div className={`absolute inset-0 ${
                    selectedTable === 'mixed'
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                      : 'bg-gradient-to-br from-amber-400/80 to-orange-500/80'
                  }`} />
                  {selectedTable === 'mixed' && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      animate={{
                        boxShadow: [
                          'inset 0 0 15px 2px rgba(255,255,255,0.3)',
                          'inset 0 0 25px 4px rgba(255,255,255,0.5)',
                          'inset 0 0 15px 2px rgba(255,255,255,0.3)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1">
                    <span className="text-3xl">🎲</span>
                    <span className="text-sm font-black text-white">مختلط</span>
                    <span className="text-[8px] font-bold text-white/60">كل الجداول</span>
                  </div>
                </motion.button>
              </div>

              {/* Recommendation hint */}
              {recommendedTable && selectedTable !== recommendedTable && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-400 text-center mt-1"
                >
                  💡 ننصح بجدول الضرب {recommendedTable}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Step 3: Difficulty Selection ─── */}
        <AnimatePresence mode="wait">
          {currentStep === 2 && (
            <motion.div
              key="difficulty-selection"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <motion.button
                onClick={() => setCurrentStep(1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-white/50 hover:text-white/80 mb-3 flex items-center gap-1 transition-colors"
              >
                ← رجوع لاختيار الجدول
              </motion.button>

              <div className="flex gap-3 justify-center mb-6">
                {DIFFICULTY_OPTIONS.map((diff) => (
                  <motion.button
                    key={diff.id}
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSelectDifficulty(diff.id)}
                    className={`flex-1 max-w-[140px] rounded-2xl p-5 text-center border-2 transition-all cursor-pointer relative overflow-hidden ${
                      selectedDifficulty === diff.id
                        ? `${diff.selectedColor} ring-2 ring-offset-1 ${diff.glowColor} shadow-lg`
                        : diff.color
                    }`}
                  >
                    {/* Intensity bars */}
                    <div className="flex gap-0.5 justify-center mb-2">
                      {[1, 2, 3].map((bar) => (
                        <motion.div
                          key={bar}
                          className={`w-3 h-1.5 rounded-full transition-all ${
                            bar <= diff.bars
                              ? selectedDifficulty === diff.id ? 'bg-white/80' : `bg-gradient-to-r ${diff.barColor}`
                              : selectedDifficulty === diff.id ? 'bg-white/20' : 'bg-black/10'
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: bar * 0.1, type: 'spring' }}
                        />
                      ))}
                    </div>
                    <span className="text-3xl block mb-1">{diff.emoji}</span>
                    <span className="font-bold text-sm block">{diff.name}</span>
                    <span className={`text-[10px] block mt-1 leading-tight ${
                      selectedDifficulty === diff.id ? 'text-white/80' : 'text-current opacity-60'
                    }`}>
                      {diff.description}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Selection Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10"
              >
                <div className="text-xs font-bold text-white/40 mb-2">ملخص الاختيار</div>
                <div className="flex items-center gap-3 justify-center flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-lg">{GAME_TYPES.find(g => g.id === selectedGame)?.emoji}</span>
                    <span className="text-xs font-bold text-white/80">{GAME_TYPES.find(g => g.id === selectedGame)?.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-lg">{selectedTable === 'mixed' ? '🎲' : WORLD_EMOJIS[selectedTable as number]}</span>
                    <span className="text-xs font-bold text-white/80">{selectedTable === 'mixed' ? 'مختلط' : `جدول ${selectedTable}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-lg">{DIFFICULTY_OPTIONS.find(d => d.id === selectedDifficulty)?.emoji}</span>
                    <span className="text-xs font-bold text-white/80">{DIFFICULTY_OPTIONS.find(d => d.id === selectedDifficulty)?.name}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Start Button (always visible) ─── */}
        <div className="mt-auto pb-4">
          <motion.button
            whileHover={canStart ? { scale: 1.02 } : {}}
            whileTap={canStart ? { scale: 0.98 } : {}}
            onClick={handleStart}
            disabled={!canStart}
            className={`relative w-full rounded-2xl p-5 text-xl font-extrabold transition-all overflow-hidden ${
              canStart
                ? 'bg-gradient-to-l from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl cursor-pointer'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {/* Animated gradient shimmer when enabled */}
            {canStart && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-l from-orange-400 via-pink-400 to-purple-400"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
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
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
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

          {/* Quick navigation if game is selected */}
          {canStart && currentStep > 0 && (
            <div className="flex gap-2 mt-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="flex-1 text-white/40 hover:text-white/70 hover:bg-white/5 text-xs"
                >
                  ← السابق
                </Button>
              )}
              {currentStep < 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
                  className="flex-1 text-white/40 hover:text-white/70 hover:bg-white/5 text-xs"
                >
                  التالي →
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
