'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvatarImage from '@/components/shared/AvatarImage';

// ─── Props ───────────────────────────────────────────────────────────────────

interface LeaderboardPageProps {
  currentChild: {
    id: string;
    name: string;
    displayName: string;
    avatarId: string;
    points: number;
    level: number;
  };
  onBack: () => void;
}

// ─── Mock Data Generator ─────────────────────────────────────────────────────

const MOCK_NAMES = [
  { name: 'نور', avatarId: 'cat' },
  { name: 'أحمد', avatarId: 'lion' },
  { name: 'فاطمة', avatarId: 'rabbit' },
  { name: 'عمر', avatarId: 'bear' },
  { name: 'ليلى', avatarId: 'unicorn' },
  { name: 'يوسف', avatarId: 'tiger' },
  { name: 'مريم', avatarId: 'owl' },
  { name: 'علي', avatarId: 'dragon' },
  { name: 'سارة', avatarId: 'panda' },
  { name: 'خالد', avatarId: 'fox' },
  { name: 'هند', avatarId: 'frog' },
  { name: 'طارق', avatarId: 'elephant' },
  { name: 'ريم', avatarId: 'penguin' },
  { name: 'سليم', avatarId: 'monkey' },
  { name: 'دانة', avatarId: 'dog' },
];

interface LeaderboardEntry {
  id: string;
  name: string;
  avatarId: string;
  points: number;
  level: number;
  isCurrentChild: boolean;
}

function generateMockLeaderboard(currentChild: LeaderboardPageProps['currentChild']): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  // Add mock players
  const shuffled = [...MOCK_NAMES].sort(() => Math.random() - 0.5);
  shuffled.forEach((m, i) => {
    entries.push({
      id: `mock-${i}`,
      name: m.name,
      avatarId: m.avatarId,
      points: Math.floor(Math.random() * 5000) + 100,
      level: Math.floor(Math.random() * 8) + 1,
      isCurrentChild: false,
    });
  });

  // Add current child
  entries.push({
    id: currentChild.id,
    name: currentChild.displayName,
    avatarId: currentChild.avatarId,
    points: currentChild.points,
    level: currentChild.level,
    isCurrentChild: true,
  });

  // Sort by points descending
  entries.sort((a, b) => b.points - a.points);

  return entries;
}

function generateWeeklyLeaderboard(currentChild: LeaderboardPageProps['currentChild']): LeaderboardEntry[] {
  const entries = generateMockLeaderboard(currentChild);
  // Simulate weekly scores (fraction of total)
  return entries.map(e => ({
    ...e,
    points: Math.floor(e.points * (0.1 + Math.random() * 0.3)),
  })).sort((a, b) => b.points - a.points);
}

function generateMonthlyLeaderboard(currentChild: LeaderboardPageProps['currentChild']): LeaderboardEntry[] {
  const entries = generateMockLeaderboard(currentChild);
  // Simulate monthly scores (fraction of total)
  return entries.map(e => ({
    ...e,
    points: Math.floor(e.points * (0.3 + Math.random() * 0.5)),
  })).sort((a, b) => b.points - a.points);
}

// ─── Animated Counter Hook ───────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    const startValue = 0;

    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const currentValue = Math.round(startValue + (target - startValue) * eased);
      setCount(currentValue);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// ─── Podium Component ────────────────────────────────────────────────────────

function Podium({ top3 }: { top3: LeaderboardEntry[] }) {
  const medals = ['🥇', '🥈', '🥉'];
  const podiumHeights = ['h-36 md:h-44', 'h-28 md:h-36', 'h-24 md:h-32'];
  const podiumColors = [
    'from-yellow-300 to-amber-400',
    'from-slate-300 to-slate-400',
    'from-orange-300 to-amber-600',
  ];
  const glowColors = [
    'shadow-yellow-300/50',
    'shadow-slate-300/50',
    'shadow-orange-300/50',
  ];

  // Reorder for podium display: 2nd, 1st, 3rd
  const displayOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const displayHeights = top3.length >= 3 ? [podiumHeights[1], podiumHeights[0], podiumHeights[2]] : podiumHeights.slice(0, top3.length);
  const displayColors = top3.length >= 3 ? [podiumColors[1], podiumColors[0], podiumColors[2]] : podiumColors.slice(0, top3.length);
  const displayGlow = top3.length >= 3 ? [glowColors[1], glowColors[0], glowColors[2]] : glowColors.slice(0, top3.length);
  const displayMedals = top3.length >= 3 ? [medals[1], medals[0], medals[2]] : medals.slice(0, top3.length);
  const originalIndices = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i);

  return (
    <div className="flex items-end justify-center gap-2 md:gap-4 mb-6" dir="rtl">
      {displayOrder.map((entry, displayIdx) => {
        const originalIdx = originalIndices[displayIdx];
        const isFirst = originalIdx === 0;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: displayIdx * 0.15,
            }}
            className="flex flex-col items-center"
          >
            {/* Avatar + Medal */}
            <div className="relative mb-2">
              {isFirst && (
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl md:text-3xl"
                >
                  👑
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/90 shadow-xl ${displayGlow[displayIdx]} flex items-center justify-center border-3 ${
                  isFirst ? 'border-yellow-400' : originalIdx === 1 ? 'border-slate-300' : 'border-orange-400'
                } overflow-hidden`}
              >
                <AvatarImage avatarId={entry.avatarId} size={isFirst ? 64 : 48} />
              </motion.div>
              <motion.div
                animate={isFirst ? { scale: [1, 1.3, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl md:text-2xl"
              >
                {displayMedals[displayIdx]}
              </motion.div>
            </div>

            {/* Name */}
            <div className="text-xs md:text-sm font-black text-slate-700 mt-2 text-center max-w-20 md:max-w-28 truncate">
              {entry.name}
            </div>
            <div className="text-[10px] md:text-xs font-bold text-amber-600">
              {entry.points.toLocaleString('ar-EG')} نقطة
            </div>

            {/* Podium Block */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + displayIdx * 0.15, duration: 0.5, ease: 'easeOut' }}
              className={`w-16 md:w-24 ${displayHeights[displayIdx]} bg-gradient-to-t ${displayColors[displayIdx]} rounded-t-xl mt-2 shadow-lg origin-bottom`}
            >
              <div className="flex items-center justify-center pt-3">
                <span className="text-white font-black text-lg md:text-2xl drop-shadow-md">
                  {originalIdx + 1}
                </span>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Rank List Item ──────────────────────────────────────────────────────────

function RankItem({ entry, rank, index }: { entry: LeaderboardEntry; rank: number; index: number }) {
  const animatedPoints = useAnimatedCounter(entry.points, 800 + index * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: 0.3 + index * 0.05,
      }}
      whileHover={{ scale: 1.02, x: -4 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        entry.isCurrentChild
          ? 'bg-gradient-to-l from-amber-50 to-orange-50 shadow-md border-2 border-amber-300'
          : 'bg-white/60 hover:bg-white/80'
      }`}
    >
      {/* Rank */}
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm md:text-base ${
        rank === 1
          ? 'bg-gradient-to-br from-yellow-300 to-amber-400 text-white'
          : rank === 2
          ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
          : rank === 3
          ? 'bg-gradient-to-br from-orange-300 to-amber-600 text-white'
          : 'bg-slate-100 text-slate-500'
      }`}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
        <AvatarImage avatarId={entry.avatarId} size={40} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-black text-slate-700 truncate">
            {entry.name}
          </span>
          {entry.isCurrentChild && (
            <Badge className="bg-amber-400 text-white border-0 text-[10px] px-1.5 py-0 shrink-0">
              أنت ✨
            </Badge>
          )}
        </div>
        <div className="text-[10px] md:text-xs text-slate-400 font-medium">
          المستوى {entry.level}
        </div>
      </div>

      {/* Points */}
      <div className="text-left shrink-0">
        <div className="text-sm md:text-base font-black text-amber-600">
          {animatedPoints.toLocaleString('ar-EG')}
        </div>
        <div className="text-[10px] md:text-xs text-slate-400">نقطة</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LeaderboardPage({ currentChild, onBack }: LeaderboardPageProps) {
  const [activeTab, setActiveTab] = useState('weekly');

  const weeklyData = useMemo(() => generateWeeklyLeaderboard(currentChild), [currentChild]);
  const monthlyData = useMemo(() => generateMonthlyLeaderboard(currentChild), [currentChild]);
  const allTimeData = useMemo(() => generateMockLeaderboard(currentChild), [currentChild]);

  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      case 'all-time': return allTimeData;
      default: return weeklyData;
    }
  }, [activeTab, weeklyData, monthlyData, allTimeData]);

  const top3 = currentData.slice(0, 3);
  const rest = currentData.slice(3);

  const currentChildRank = useMemo(() => {
    const idx = currentData.findIndex(e => e.isCurrentChild);
    return idx >= 0 ? idx + 1 : currentData.length;
  }, [currentData]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full pb-8"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #e0f2fe 60%, #d1fae5 100%)',
      }}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute top-20 right-10 text-5xl opacity-15"
        >
          🏆
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-40 left-16 text-4xl opacity-15"
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute bottom-32 right-24 text-4xl opacity-15"
        >
          🎖️
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute bottom-48 left-10 text-4xl opacity-15"
        >
          🌟
        </motion.div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-3 md:px-6 flex flex-col gap-4">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-yellow-400 via-amber-400 to-orange-400 overflow-hidden relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-3 left-8 w-3 h-3 rounded-full bg-white" />
              <div className="absolute top-6 right-20 w-2 h-2 rounded-full bg-yellow-200" />
              <div className="absolute bottom-4 left-24 w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-center gap-3">
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
                  <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm">
                    لوحة المتصدرين 🏆
                  </h1>
                  <p className="text-white/80 text-xs md:text-sm mt-0.5">
                    ترتيبك: <span className="font-black">#{currentChildRank}</span> من {currentData.length} لاعب
                  </p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-4xl md:text-5xl"
                >
                  🏅
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Tabs ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="w-full grid grid-cols-3 bg-white/70 backdrop-blur-sm shadow-md rounded-xl h-12">
              <TabsTrigger
                value="weekly"
                className="rounded-r-lg text-sm font-bold data-[state=active]:bg-gradient-to-l data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white"
              >
                أسبوعي 📅
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className="text-sm font-bold data-[state=active]:bg-gradient-to-l data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white"
              >
                شهري 📆
              </TabsTrigger>
              <TabsTrigger
                value="all-time"
                className="rounded-l-lg text-sm font-bold data-[state=active]:bg-gradient-to-l data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white"
              >
                الكل ⭐
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* ─── Podium (Top 3) ─── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <Podium top3={top3} />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* ─── Rank List ─── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + '-list'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">الترتيب الكامل 📊</span>
                  <Badge variant="secondary" className="text-xs">
                    {currentData.length} لاعب
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {rest.map((entry, i) => (
                    <RankItem
                      key={entry.id}
                      entry={entry}
                      rank={i + 4}
                      index={i}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* ─── Personal Rank Highlight ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-amber-50 to-orange-50 border-2 border-amber-300 overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg overflow-hidden">
                <AvatarImage avatarId={currentChild.avatarId} size={48} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-slate-800">
                  {currentChild.displayName} — ترتيبك
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  المستوى {currentChild.level} • {currentChild.points.toLocaleString('ar-EG')} نقطة
                </div>
              </div>
              <div className="text-center shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-3xl md:text-4xl font-black text-amber-500"
                >
                  #{currentChildRank}
                </motion.div>
                <div className="text-[10px] text-slate-400 font-medium">من {currentData.length}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Motivational message ─── */}
        {currentChildRank > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-l from-cyan-50 to-emerald-50 border-r-4 border-r-emerald-400">
              <CardContent className="p-4 flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-3xl shrink-0"
                >
                  💪
                </motion.div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-emerald-600 mb-0.5">استمر في التدريب!</div>
                  <p className="text-sm font-semibold text-slate-700">
                    أنت في المركز {currentChildRank} — {currentChildRank <= 5
                      ? 'قريب جداً من منصة التتويج! 🎉'
                      : currentChildRank <= 10
                      ? 'مرتبة ممتازة! واصل التقدم! 🌟'
                      : 'كل لعبة تقربك من القمة! 🚀'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Footer spacer ─── */}
        <div className="h-4" />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.25);
        }
      `}</style>
    </div>
  );
}
