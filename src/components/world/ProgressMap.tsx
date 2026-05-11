'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Lock, CheckCircle, Clock, BarChart3, Trophy, ChevronLeft, Sparkles, TrendingUp, X } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProgressMapProps {
  tableProgress: Array<{
    tableNumber: number;
    masteryLevel: number;
  }>;
  onSelectTable: (tableNumber: number) => void;
  onBack: () => void;
}

// ─── World Info ──────────────────────────────────────────────────────────────

interface WorldInfo {
  name: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  pathColor: string;
  description: string;
  iconBg: string;
  iconChar: string;
  avgMastery: number; // simulated average for "You vs Average"
}

const WORLDS: Record<number, WorldInfo> = {
  1: {
    name: 'جزيرة الأرقام', gradientFrom: 'from-emerald-400', gradientTo: 'to-green-500',
    glowColor: 'shadow-emerald-400/60', pathColor: 'bg-emerald-400', description: 'ابدأ رحلتك مع جدول 1!',
    iconBg: 'bg-emerald-500', iconChar: '١', avgMastery: 0.75,
  },
  2: {
    name: 'غابة الألغاز', gradientFrom: 'from-lime-400', gradientTo: 'to-emerald-500',
    glowColor: 'shadow-lime-400/60', pathColor: 'bg-lime-400', description: 'أزواج وأشجار سحرية!',
    iconBg: 'bg-lime-500', iconChar: '٢', avgMastery: 0.65,
  },
  3: {
    name: 'بحر الضرب', gradientFrom: 'from-teal-400', gradientTo: 'to-cyan-500',
    glowColor: 'shadow-teal-400/60', pathColor: 'bg-teal-400', description: 'لآلئ ومحار في الأعماق!',
    iconBg: 'bg-teal-500', iconChar: '٣', avgMastery: 0.55,
  },
  4: {
    name: 'جبل الحكمة', gradientFrom: 'from-amber-400', gradientTo: 'to-orange-500',
    glowColor: 'shadow-amber-400/60', pathColor: 'bg-amber-400', description: 'تسلق وأتقن جدول 4!',
    iconBg: 'bg-amber-500', iconChar: '٤', avgMastery: 0.48,
  },
  5: {
    name: 'وادي الحلوى', gradientFrom: 'from-pink-400', gradientTo: 'to-rose-500',
    glowColor: 'shadow-pink-400/60', pathColor: 'bg-pink-400', description: 'حلوى ووصفات سحرية!',
    iconBg: 'bg-pink-500', iconChar: '٥', avgMastery: 0.42,
  },
  6: {
    name: 'الفضاء المذهل', gradientFrom: 'from-violet-400', gradientTo: 'to-purple-500',
    glowColor: 'shadow-violet-400/60', pathColor: 'bg-violet-400', description: 'كواكب ونجوم لا متناهية!',
    iconBg: 'bg-violet-500', iconChar: '٦', avgMastery: 0.38,
  },
  7: {
    name: 'المدينة السحرية', gradientFrom: 'from-orange-400', gradientTo: 'to-red-500',
    glowColor: 'shadow-orange-400/60', pathColor: 'bg-orange-400', description: 'حواجز وتنانين!',
    iconBg: 'bg-orange-500', iconChar: '٧', avgMastery: 0.32,
  },
  8: {
    name: 'عالم الألوان', gradientFrom: 'from-rose-400', gradientTo: 'to-pink-500',
    glowColor: 'shadow-rose-400/60', pathColor: 'bg-rose-400', description: 'ألوان وإبداع بلا حدود!',
    iconBg: 'bg-rose-500', iconChar: '٨', avgMastery: 0.28,
  },
  9: {
    name: 'قمة الأبطال', gradientFrom: 'from-yellow-400', gradientTo: 'to-amber-500',
    glowColor: 'shadow-yellow-400/60', pathColor: 'bg-yellow-400', description: 'الكنز الأعظم ينتظرك!',
    iconBg: 'bg-yellow-500', iconChar: '٩', avgMastery: 0.22,
  },
};

const TABLE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// ─── Floating Particles ──────────────────────────────────────────────────────

function FloatingParticles() {
  const particles = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 5 + (i * 8) % 90,
      y: 10 + (i * 13) % 80,
      size: 3 + (i % 4) * 2,
      duration: 4 + i * 0.7,
      delay: i * 0.5,
    })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── World Detail Popup ──────────────────────────────────────────────────────

function WorldDetailPopup({
  world,
  tableNumber,
  mastery,
  onClose,
  onPlay,
}: {
  world: WorldInfo;
  tableNumber: number;
  mastery: number;
  onClose: () => void;
  onPlay: () => void;
}) {
  const masteryPercent = Math.round(mastery * 100);
  const avgPercent = Math.round(world.avgMastery * 100);
  const isAhead = masteryPercent >= avgPercent;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        <Card className="border-0 shadow-2xl overflow-hidden" dir="rtl">
          {/* Header */}
          <div className={`bg-gradient-to-br ${world.gradientFrom} ${world.gradientTo} p-5 relative`}>
            <button
              onClick={onClose}
              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                  boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                <span className="text-2xl font-black text-white">{world.iconChar}</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{world.name}</h2>
                <p className="text-xs text-white/80">جدول الضرب رقم {tableNumber}</p>
              </div>
            </div>
            <p className="text-sm text-white/80 mt-3">{world.description}</p>
          </div>

          <CardContent className="p-5">
            {/* Mastery */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-700">مستوى الإتقان</span>
                <span className="text-sm font-black text-amber-600">{masteryPercent}%</span>
              </div>
              <Progress value={masteryPercent} className="h-3" />
              <div className="flex items-center gap-1 mt-1">
                {masteryPercent >= 80 ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                    <CheckCircle className="w-3 h-3 ml-0.5" /> متقن
                  </Badge>
                ) : masteryPercent >= 40 ? (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">يتعلم</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">يحتاج تدريب</Badge>
                )}
              </div>
            </div>

            {/* You vs Average */}
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                أنت مقابل المتوسط
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="font-bold text-amber-600">أنت</span>
                    <span className="font-bold text-amber-600">{masteryPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-amber-200 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${masteryPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="font-bold text-slate-400">المتوسط</span>
                    <span className="font-bold text-slate-400">{avgPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-slate-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${avgPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
              <p className={`text-[10px] font-bold mt-1.5 ${isAhead ? 'text-emerald-600' : 'text-red-500'}`}>
                {isAhead ? '🎉 أنت فوق المتوسط!' : '💪 تدرّب أكثر لتتجاوز المتوسط!'}
              </p>
            </div>

            {/* Reward preview */}
            <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>إتقان هذا العالم = <strong className="text-amber-600">+50 نقطة</strong> و <strong className="text-purple-600">+2 جوهرة</strong></span>
            </div>

            {/* Play button */}
            <Button
              onClick={onPlay}
              className={`w-full h-12 text-base font-black bg-gradient-to-l ${world.gradientFrom} ${world.gradientTo} hover:opacity-90 shadow-lg border-0 rounded-xl`}
            >
              🎮 ابدأ المغامرة!
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── World Node ──────────────────────────────────────────────────────────────

function WorldNode({
  worldInfo,
  tableNumber,
  masteryLevel,
  isUnlocked,
  isCurrent,
  isRecommended,
  index,
  onClick,
}: {
  worldInfo: WorldInfo;
  tableNumber: number;
  masteryLevel: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  isRecommended: boolean;
  index: number;
  onClick: () => void;
}) {
  const masteryPct = Math.round(masteryLevel * 100);
  const isMastered = masteryPct >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, x: isUnlocked ? 30 : 10, scale: isUnlocked ? 0.8 : 0.6 }}
      animate={{ opacity: isUnlocked ? 1 : 0.5, x: 0, scale: isUnlocked ? 1 : 0.85 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.08 }}
      className="relative"
    >
      {/* Current glow */}
      {isCurrent && (
        <motion.div
          className={`absolute -inset-3 rounded-3xl ${worldInfo.glowColor} shadow-[0_0_30px_8px] opacity-50`}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      )}

      <motion.div
        whileHover={isUnlocked ? { scale: 1.03, y: -3 } : {}}
        whileTap={isUnlocked ? { scale: 0.98 } : {}}
        onClick={isUnlocked ? onClick : undefined}
        className={`relative cursor-${isUnlocked ? 'pointer' : 'not-allowed'}`}
      >
        <Card className={`overflow-hidden border-0 shadow-xl ${
          isUnlocked
            ? `bg-gradient-to-br ${worldInfo.gradientFrom} ${worldInfo.gradientTo}`
            : 'bg-gradient-to-br from-gray-300 to-gray-400'
        } ${isCurrent ? 'ring-4 ring-white/60' : ''}`}>
          <CardContent className="p-4 flex items-center gap-4 relative z-10">
            {/* 3D-style Icon */}
            <div className="relative">
              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center ${
                  isUnlocked ? worldInfo.iconBg : 'bg-gray-500'
                }`}
                style={{
                  boxShadow: isUnlocked
                    ? 'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.15)'
                    : 'none',
                }}
              >
                <span className={`text-2xl md:text-3xl font-black ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                  {worldInfo.iconChar}
                </span>
              </div>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-300" />
                </div>
              )}
              {isMastered && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm md:text-base font-black text-white drop-shadow-sm">
                  {worldInfo.name}
                </span>
                {isRecommended && (
                  <Badge className="bg-white/30 text-white border-0 text-[9px] font-bold px-1.5 py-0">
                    <Sparkles className="w-3 h-3 ml-0.5" /> موصى به
                  </Badge>
                )}
              </div>

              {isUnlocked ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white/80">
                      {isMastered ? 'متقن ✅' : masteryPct >= 40 ? 'يتعلم 📖' : 'يحتاج تدريب 💪'}
                    </span>
                    <span className="text-xs font-extrabold text-white">{masteryPct}%</span>
                  </div>
                  <Progress
                    value={masteryPct}
                    className="h-2.5 rounded-full bg-white/25"
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-200 font-semibold">مقفل — أتقن العالم السابق أكثر من 50%</span>
              )}
            </div>

            {/* Play button */}
            {isUnlocked && (
              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mastery crown */}
      {isMastered && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: index * 0.08 + 0.3 }}
          className="absolute -top-2 -right-2"
        >
          <Badge className="bg-yellow-400 text-yellow-900 border-0 font-bold text-xs px-2 shadow-lg">
            <Star className="w-3 h-3 ml-0.5 fill-yellow-700" /> متقن
          </Badge>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Animated Dots Path ──────────────────────────────────────────────────────

function AnimatedDotsPath({ isActive, color }: { isActive: boolean; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${color} ${isActive ? 'opacity-100' : 'opacity-25'}`}
          animate={isActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProgressMap({
  tableProgress,
  onSelectTable,
  onBack,
}: ProgressMapProps) {
  const [selectedWorld, setSelectedWorld] = useState<number | null>(null);

  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    tableProgress.forEach(tp => map.set(tp.tableNumber, tp.masteryLevel));
    return map;
  }, [tableProgress]);

  const unlockStatus = useMemo(() => {
    const status = new Map<number, boolean>();
    TABLE_ORDER.forEach((tableNum, idx) => {
      if (idx === 0) {
        status.set(tableNum, true);
      } else {
        const prevTable = TABLE_ORDER[idx - 1];
        const prevMastery = progressMap.get(prevTable) ?? 0;
        status.set(tableNum, prevMastery > 0.5);
      }
    });
    return status;
  }, [progressMap]);

  const currentWorld = useMemo(() => {
    for (const tableNum of TABLE_ORDER) {
      if (unlockStatus.get(tableNum)) {
        const mastery = progressMap.get(tableNum) ?? 0;
        if (mastery < 0.8) return tableNum;
      }
    }
    return 9;
  }, [unlockStatus, progressMap]);

  // Recommended world: first unlocked with lowest mastery
  const recommendedWorld = useMemo(() => {
    let lowest = 1;
    let lowestMastery = 1;
    for (const tableNum of TABLE_ORDER) {
      if (unlockStatus.get(tableNum)) {
        const m = progressMap.get(tableNum) ?? 0;
        if (m < lowestMastery) {
          lowestMastery = m;
          lowest = tableNum;
        }
      }
    }
    return lowest;
  }, [unlockStatus, progressMap]);

  const totalMastery = useMemo(() => {
    if (tableProgress.length === 0) return 0;
    return Math.round(tableProgress.reduce((acc, tp) => acc + tp.masteryLevel, 0) / 9 * 100);
  }, [tableProgress]);

  const masteredCount = useMemo(() => {
    return tableProgress.filter(tp => tp.masteryLevel >= 0.8).length;
  }, [tableProgress]);

  const selectedWorldInfo = selectedWorld ? WORLDS[selectedWorld] : null;

  return (
    <div dir="rtl" className="min-h-screen w-full pb-8">
      {/* Background */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          background: currentWorld
            ? `linear-gradient(135deg,
                ${currentWorld <= 3 ? '#d1fae5' : currentWorld <= 6 ? '#fce7f3' : '#fef3c7'} 0%,
                ${currentWorld <= 3 ? '#a7f3d0' : currentWorld <= 6 ? '#fbcfe8' : '#fde68a'} 50%,
                ${currentWorld <= 3 ? '#6ee7b7' : currentWorld <= 6 ? '#f9a8d4' : '#fcd34d'} 100%)`
            : 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #d1fae5 100%)',
        }}
      />

      <FloatingParticles />

      {/* World Detail Popup */}
      <AnimatePresence>
        {selectedWorld !== null && selectedWorldInfo && (
          <WorldDetailPopup
            world={selectedWorldInfo}
            tableNumber={selectedWorld}
            mastery={progressMap.get(selectedWorld) ?? 0}
            onClose={() => setSelectedWorld(null)}
            onPlay={() => {
              setSelectedWorld(null);
              onSelectTable(selectedWorld);
            }}
          />
        )}
      </AnimatePresence>

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
                    <MapPin className="w-6 h-6" />
                    خريطة العوالم
                  </h1>
                  <p className="text-xs text-white/60 mt-1">
                    تقدم عبر العوالم واتقن جداول الضرب!
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-lg font-black text-white">{WORLDS[currentWorld]?.iconChar}</span>
                  </div>
                  <span className="text-[9px] text-white/70 font-bold">الحالي</span>
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
                <Trophy className="w-5 h-5 text-emerald-500 mb-1" />
                <span className="text-lg font-black text-emerald-600">{masteredCount}</span>
                <span className="text-[10px] text-gray-500 font-semibold">عوالم متقنة</span>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 flex flex-col items-center">
                <BarChart3 className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-lg font-black text-amber-600">{totalMastery}%</span>
                <span className="text-[10px] text-gray-500 font-semibold">إجمالي التقدم</span>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 flex flex-col items-center">
                <Lock className="w-5 h-5 text-teal-500 mb-1" />
                <span className="text-lg font-black text-teal-600">
                  {Array.from(unlockStatus.values()).filter(Boolean).length}
                </span>
                <span className="text-[10px] text-gray-500 font-semibold">عوالم مفتوحة</span>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* ─── Recommended Banner ─── */}
        {recommendedWorld !== currentWorld && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-0 shadow-md bg-gradient-to-l from-amber-50 to-orange-50 border-r-4 border-r-amber-400">
              <CardContent className="p-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-amber-700">
                    ننصحك بـ {WORLDS[recommendedWorld]?.name}
                  </div>
                  <div className="text-[10px] text-amber-600">
                    هذا العالم يحتاج اهتماماً أكثر!
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelectTable(recommendedWorld)}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs border-0 rounded-lg"
                >
                  ابدأ
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Vertical World Path ─── */}
        <div className="relative">
          <div className="flex flex-col-reverse gap-0">
            {TABLE_ORDER.map((tableNum, idx) => {
              const worldInfo = WORLDS[tableNum];
              const mastery = progressMap.get(tableNum) ?? 0;
              const isUnlocked = unlockStatus.get(tableNum) ?? false;
              const isCurrent = currentWorld === tableNum;
              const isRecommended = recommendedWorld === tableNum;
              const nextTable = TABLE_ORDER[idx + 1];
              const nextUnlocked = nextTable ? (unlockStatus.get(nextTable) ?? false) : false;
              const pathActive = isUnlocked && nextUnlocked;

              return (
                <div key={tableNum} className="flex flex-col items-center">
                  <WorldNode
                    worldInfo={worldInfo}
                    tableNumber={tableNum}
                    masteryLevel={mastery}
                    isUnlocked={isUnlocked}
                    isCurrent={isCurrent}
                    isRecommended={isRecommended}
                    index={idx}
                    onClick={() => setSelectedWorld(tableNum)}
                  />

                  {idx < TABLE_ORDER.length - 1 && (
                    <AnimatedDotsPath isActive={pathActive} color={worldInfo.pathColor} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Victory */}
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
                    <h2 className="text-2xl font-black text-white drop-shadow-sm">مبروك! أتقنت كل العوالم!</h2>
                    <p className="text-sm text-white/80 font-semibold">أنت بطل حقيقي في جداول الضرب!</p>
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
