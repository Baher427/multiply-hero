'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProgressMapProps {
  tableProgress: Array<{
    tableNumber: number;
    masteryLevel: number;
  }>;
  onSelectTable: (tableNumber: number) => void;
  onBack: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

interface WorldInfo {
  emoji: string;
  name: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  pathColor: string;
}

const WORLDS: Record<number, WorldInfo> = {
  1: {
    emoji: '🏝️',
    name: 'جزيرة الأرقام',
    gradientFrom: 'from-emerald-300',
    gradientTo: 'to-green-400',
    glowColor: 'shadow-emerald-400/60',
    pathColor: 'bg-emerald-400',
  },
  2: {
    emoji: '🌳',
    name: 'غابة الألغاز',
    gradientFrom: 'from-lime-300',
    gradientTo: 'to-emerald-400',
    glowColor: 'shadow-lime-400/60',
    pathColor: 'bg-lime-400',
  },
  3: {
    emoji: '🌊',
    name: 'بحر الضرب',
    gradientFrom: 'from-teal-300',
    gradientTo: 'to-cyan-400',
    glowColor: 'shadow-teal-400/60',
    pathColor: 'bg-teal-400',
  },
  4: {
    emoji: '⛰️',
    name: 'جبل الحكمة',
    gradientFrom: 'from-amber-300',
    gradientTo: 'to-orange-400',
    glowColor: 'shadow-amber-400/60',
    pathColor: 'bg-amber-400',
  },
  5: {
    emoji: '🍬',
    name: 'وادي الحلوى',
    gradientFrom: 'from-pink-300',
    gradientTo: 'to-rose-400',
    glowColor: 'shadow-pink-400/60',
    pathColor: 'bg-pink-400',
  },
  6: {
    emoji: '🚀',
    name: 'الفضاء المذهل',
    gradientFrom: 'from-purple-300',
    gradientTo: 'to-fuchsia-400',
    glowColor: 'shadow-purple-400/60',
    pathColor: 'bg-purple-400',
  },
  7: {
    emoji: '🏰',
    name: 'المدينة السحرية',
    gradientFrom: 'from-orange-300',
    gradientTo: 'to-red-400',
    glowColor: 'shadow-orange-400/60',
    pathColor: 'bg-orange-400',
  },
  8: {
    emoji: '🎨',
    name: 'عالم الألوان',
    gradientFrom: 'from-rose-300',
    gradientTo: 'to-pink-400',
    glowColor: 'shadow-rose-400/60',
    pathColor: 'bg-rose-400',
  },
  9: {
    emoji: '👑',
    name: 'قمة الأبطال',
    gradientFrom: 'from-yellow-300',
    gradientTo: 'to-amber-400',
    glowColor: 'shadow-yellow-400/60',
    pathColor: 'bg-yellow-400',
  },
};

const TABLE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// ─── Animated Dots Path Component ────────────────────────────────────────────

function AnimatedDotsPath({ isActive, color }: { isActive: boolean; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${color} ${isActive ? 'opacity-100' : 'opacity-30'}`}
          animate={
            isActive
              ? {
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            repeat: Infinity,
            duration: 1.2,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── World Node Component ────────────────────────────────────────────────────

function WorldNode({
  worldInfo,
  tableNumber,
  masteryLevel,
  isUnlocked,
  isCurrent,
  index,
  onClick,
}: {
  worldInfo: WorldInfo;
  tableNumber: number;
  masteryLevel: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  index: number;
  onClick: () => void;
}) {
  const progressColor =
    masteryLevel >= 80
      ? '[&>div]:from-green-400 [&>div]:to-emerald-500 [&>div]:bg-gradient-to-l'
      : masteryLevel >= 40
        ? '[&>div]:from-yellow-400 [&>div]:to-amber-500 [&>div]:bg-gradient-to-l'
        : '[&>div]:from-red-400 [&>div]:to-orange-500 [&>div]:bg-gradient-to-l';

  return (
    <motion.div
      initial={{ opacity: 0, x: isUnlocked ? 30 : 10, scale: isUnlocked ? 0.8 : 0.6 }}
      animate={{ opacity: isUnlocked ? 1 : 0.5, x: 0, scale: isUnlocked ? 1 : 0.6 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: index * 0.08,
      }}
      className="relative"
    >
      {/* Glow effect for current world */}
      {isCurrent && (
        <motion.div
          className={`absolute -inset-3 rounded-3xl ${worldInfo.glowColor} shadow-[0_0_30px_8px] opacity-50`}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      )}

      <motion.div
        whileHover={isUnlocked ? { scale: 1.05, y: -4 } : {}}
        whileTap={isUnlocked ? { scale: 0.97 } : {}}
        onClick={isUnlocked ? onClick : undefined}
        className={`relative cursor-${isUnlocked ? 'pointer' : 'not-allowed'} transition-all`}
      >
        <Card
          className={`overflow-hidden border-0 shadow-xl ${
            isUnlocked
              ? `bg-gradient-to-br ${worldInfo.gradientFrom} ${worldInfo.gradientTo}`
              : 'bg-gradient-to-br from-gray-300 to-gray-400'
          } ${isCurrent ? 'ring-4 ring-white/60' : ''}`}
        >
          <CardContent className="p-4 flex items-center gap-4 relative z-10">
            {/* Emoji */}
            <div className="relative">
              <motion.div
                className="text-4xl md:text-5xl"
                animate={isCurrent ? { y: [0, -4, 0], rotate: [0, 5, -5, 0] } : {}}
                transition={
                  isCurrent
                    ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
                    : {}
                }
              >
                {worldInfo.emoji}
              </motion.div>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black text-white drop-shadow-sm">
                  {tableNumber}
                </span>
                <span
                  className={`text-sm md:text-base font-bold ${
                    isUnlocked ? 'text-white/90' : 'text-gray-500'
                  } truncate`}
                >
                  {worldInfo.name}
                </span>
              </div>

              {isUnlocked ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80">
                      {masteryLevel >= 80 ? 'متقن ✅' : masteryLevel >= 40 ? 'يتعلم 📖' : 'يحتاج تدريب 💪'}
                    </span>
                    <span className="text-xs font-extrabold text-white">
                      {Math.round(masteryLevel)}%
                    </span>
                  </div>
                  <Progress
                    value={masteryLevel}
                    className={`h-3 rounded-full bg-white/25 ${progressColor}`}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600 font-semibold">مقفل 🔒</span>
                  <span className="text-xs text-gray-500">
                    أتقن العالم السابق أكثر من 50%
                  </span>
                </div>
              )}
            </div>

            {/* Play button or lock */}
            {isUnlocked && (
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="shrink-0"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-xl">▶️</span>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mastery badge */}
      {isUnlocked && masteryLevel >= 80 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: index * 0.08 + 0.3 }}
          className="absolute -top-2 -left-2"
        >
          <Badge className="bg-yellow-400 text-yellow-900 border-0 font-bold text-xs px-2 shadow-lg">
            ⭐ متقن
          </Badge>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProgressMap({
  tableProgress,
  onSelectTable,
  onBack,
}: ProgressMapProps) {
  // Build progress map for quick lookup
  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    tableProgress.forEach((tp) => map.set(tp.tableNumber, tp.masteryLevel));
    return map;
  }, [tableProgress]);

  // Calculate unlock status: world N is unlocked if world N-1 has > 50% mastery (world 1 is always unlocked)
  const unlockStatus = useMemo(() => {
    const status = new Map<number, boolean>();
    TABLE_ORDER.forEach((tableNum, idx) => {
      if (idx === 0) {
        status.set(tableNum, true);
      } else {
        const prevTable = TABLE_ORDER[idx - 1];
        const prevMastery = progressMap.get(prevTable) ?? 0;
        status.set(tableNum, prevMastery > 50);
      }
    });
    return status;
  }, [progressMap]);

  // Find current world (first unlocked with < 80% mastery)
  const currentWorld = useMemo(() => {
    for (const tableNum of TABLE_ORDER) {
      if (unlockStatus.get(tableNum)) {
        const mastery = progressMap.get(tableNum) ?? 0;
        if (mastery < 80) return tableNum;
      }
    }
    return 9; // All mastered
  }, [unlockStatus, progressMap]);

  // Calculate overall stats
  const totalMastery = useMemo(() => {
    if (tableProgress.length === 0) return 0;
    return Math.round(
      tableProgress.reduce((acc, tp) => acc + tp.masteryLevel, 0) / 9
    );
  }, [tableProgress]);

  const masteredCount = useMemo(() => {
    return tableProgress.filter((tp) => tp.masteryLevel >= 80).length;
  }, [tableProgress]);

  return (
    <div dir="rtl" className="min-h-screen w-full pb-8">
      {/* Background gradient matching current world */}
      <motion.div
        className="fixed inset-0 z-0"
        animate={{
          background: WORLDS[currentWorld]
            ? `linear-gradient(135deg, var(--tw-gradient-stops))`
            : 'linear-gradient(135deg, #fef3c7, #d1fae5)',
        }}
        style={{
          background: currentWorld
            ? `linear-gradient(135deg, 
                ${currentWorld <= 3 ? '#d1fae5' : currentWorld <= 6 ? '#fce7f3' : '#fef3c7'} 0%, 
                ${currentWorld <= 3 ? '#a7f3d0' : currentWorld <= 6 ? '#fbcfe8' : '#fde68a'} 50%, 
                ${currentWorld <= 3 ? '#6ee7b7' : currentWorld <= 6 ? '#f9a8d4' : '#fcd34d'} 100%)`
            : 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #d1fae5 100%)',
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute top-20 right-8 text-5xl opacity-20"
        >
          🗺️
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-60 left-12 text-4xl opacity-15"
        >
          🌟
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute bottom-40 right-20 text-4xl opacity-15"
        >
          ⭐
        </motion.div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-3 md:px-6 flex flex-col gap-4">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-slate-800 to-slate-700 overflow-hidden relative">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg backdrop-blur-sm"
                  aria-label="رجوع"
                >
                  →
                </motion.button>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                    🗺️ خريطة العوالم
                  </h1>
                  <p className="text-xs text-white/60 mt-1">
                    تقدم عبر العوالم واتقن جداول الضرب!
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl">{WORLDS[currentWorld]?.emoji}</div>
                  <span className="text-[10px] text-white/70 font-bold">العالم الحالي</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Stats Summary ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-2">
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 flex flex-col items-center">
                <span className="text-2xl">🏆</span>
                <span className="text-lg font-black text-emerald-600">{masteredCount}</span>
                <span className="text-[10px] text-gray-500 font-semibold">عوالم متقنة</span>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 flex flex-col items-center">
                <span className="text-2xl">📊</span>
                <span className="text-lg font-black text-amber-600">{totalMastery}%</span>
                <span className="text-[10px] text-gray-500 font-semibold">إجمالي التقدم</span>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 flex flex-col items-center">
                <span className="text-2xl">🔓</span>
                <span className="text-lg font-black text-teal-600">
                  {Array.from(unlockStatus.values()).filter(Boolean).length}
                </span>
                <span className="text-[10px] text-gray-500 font-semibold">عوالم مفتوحة</span>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* ─── Vertical World Path ─── */}
        <div className="relative">
          {/* Reversed so it goes bottom-to-top visually */}
          <div className="flex flex-col-reverse gap-0">
            {TABLE_ORDER.map((tableNum, idx) => {
              const worldInfo = WORLDS[tableNum];
              const mastery = progressMap.get(tableNum) ?? 0;
              const isUnlocked = unlockStatus.get(tableNum) ?? false;
              const isCurrent = currentWorld === tableNum;
              const nextTable = TABLE_ORDER[idx + 1];
              const nextUnlocked = nextTable ? (unlockStatus.get(nextTable) ?? false) : false;
              const pathActive = isUnlocked && nextUnlocked;

              return (
                <div key={tableNum} className="flex flex-col items-center">
                  {/* World Node */}
                  <WorldNode
                    worldInfo={worldInfo}
                    tableNumber={tableNum}
                    masteryLevel={mastery}
                    isUnlocked={isUnlocked}
                    isCurrent={isCurrent}
                    index={idx}
                    onClick={() => onSelectTable(tableNum)}
                  />

                  {/* Animated path connector (between worlds, not after the last) */}
                  {idx < TABLE_ORDER.length - 1 && (
                    <AnimatedDotsPath
                      isActive={pathActive}
                      color={worldInfo.pathColor}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Victory flag at top */}
          <AnimatePresence>
            {masteredCount === 9 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex justify-center mt-4"
              >
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400">
                  <CardContent className="p-6 flex flex-col items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="text-6xl"
                    >
                      🏆
                    </motion.div>
                    <h2 className="text-2xl font-black text-white drop-shadow-sm">
                      مبروك! أتقنت كل العوالم! 🎉
                    </h2>
                    <p className="text-sm text-white/80 font-semibold">
                      أنت بطل حقيقي في جداول الضرب!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
