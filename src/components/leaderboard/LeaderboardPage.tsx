'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, BarChart3, Flame, Star, Target } from 'lucide-react';
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

// ─── Types ───────────────────────────────────────────────────────────────────

type SortCategory = 'points' | 'level' | 'streak' | 'mastery';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatarId: string;
  points: number;
  level: number;
  streak: number;
  mastery: number;
  isCurrentChild: boolean;
  trend: 'up' | 'down' | 'stable';
  badges: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_NAMES = [
  { name: 'نور', avatarId: 'cat' }, { name: 'أحمد', avatarId: 'lion' },
  { name: 'فاطمة', avatarId: 'rabbit' }, { name: 'عمر', avatarId: 'bear' },
  { name: 'ليلى', avatarId: 'unicorn' }, { name: 'يوسف', avatarId: 'tiger' },
  { name: 'مريم', avatarId: 'owl' }, { name: 'علي', avatarId: 'dragon' },
  { name: 'سارة', avatarId: 'panda' }, { name: 'خالد', avatarId: 'fox' },
  { name: 'هند', avatarId: 'frog' }, { name: 'طارق', avatarId: 'elephant' },
  { name: 'ريم', avatarId: 'penguin' }, { name: 'سليم', avatarId: 'monkey' },
  { name: 'دانة', avatarId: 'dog' },
];

function generateLeaderboard(currentChild: LeaderboardPageProps['currentChild'], category: SortCategory): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const shuffled = [...MOCK_NAMES].sort(() => Math.random() - 0.5);
  shuffled.forEach((m, i) => {
    entries.push({
      id: `mock-${i}`, name: m.name, avatarId: m.avatarId,
      points: Math.floor(Math.random() * 5000) + 100,
      level: Math.floor(Math.random() * 8) + 1,
      streak: Math.floor(Math.random() * 30),
      mastery: Math.floor(Math.random() * 100),
      isCurrentChild: false,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'stable' : 'down',
      badges: Math.floor(Math.random() * 15) + 1,
    });
  });
  entries.push({
    id: currentChild.id, name: currentChild.displayName, avatarId: currentChild.avatarId,
    points: currentChild.points, level: currentChild.level,
    streak: Math.floor(Math.random() * 15) + 1,
    mastery: Math.floor(Math.random() * 60) + 20,
    isCurrentChild: true, trend: 'up', badges: Math.floor(Math.random() * 8) + 2,
  });

  const sortKey: Record<SortCategory, (e: LeaderboardEntry) => number> = {
    points: e => e.points,
    level: e => e.level,
    streak: e => e.streak,
    mastery: e => e.mastery,
  };
  entries.sort((a, b) => sortKey[category](b) - sortKey[category](a));
  return entries;
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    let startTime: number | null = null;
    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const progressRatio = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.round(target * (1 - Math.pow(1 - progressRatio, 3))));
      if (progressRatio < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

// ─── Podium Component ────────────────────────────────────────────────────────

function Podium({ top3 }: { top3: LeaderboardEntry[] }) {
  const podiumHeights = ['h-36 md:h-44', 'h-28 md:h-36', 'h-24 md:h-32'];
  const podiumColors = ['from-yellow-300 to-amber-400', 'from-slate-300 to-slate-400', 'from-orange-300 to-amber-600'];
  const displayOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const displayHeights = top3.length >= 3 ? [podiumHeights[1], podiumHeights[0], podiumHeights[2]] : podiumHeights.slice(0, top3.length);
  const displayColors = top3.length >= 3 ? [podiumColors[1], podiumColors[0], podiumColors[2]] : podiumColors.slice(0, top3.length);
  const originalIndices = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i);

  return (
    <div className="flex items-end justify-center gap-2 md:gap-4 mb-4" dir="rtl">
      {displayOrder.map((entry, displayIdx) => {
        const originalIdx = originalIndices[displayIdx];
        const isFirst = originalIdx === 0;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: displayIdx * 0.15 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2">
              {isFirst && (
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2"
                >
                  <Crown className="w-7 h-7 text-yellow-400" />
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-14 h-14 md:w-18 md:h-18 rounded-full bg-white/90 shadow-xl overflow-hidden border-3 ${
                  isFirst ? 'border-yellow-400' : originalIdx === 1 ? 'border-slate-300' : 'border-orange-400'
                }`}
              >
                <AvatarImage avatarId={entry.avatarId} size={isFirst ? 60 : 48} />
              </motion.div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl md:text-2xl">
                {['🥇', '🥈', '🥉'][originalIdx] || `#${originalIdx + 1}`}
              </div>
            </div>
            <div className="text-xs font-black text-slate-700 mt-2 text-center max-w-20 truncate">{entry.name}</div>
            <div className="text-[10px] font-bold text-amber-600">{entry.points.toLocaleString('ar-EG')} نقطة</div>

            {/* Trend indicator */}
            <div className="flex items-center gap-0.5 mt-1">
              {entry.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              {entry.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
              {entry.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
            </div>

            {/* Podium Block */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + displayIdx * 0.15, duration: 0.5, ease: 'easeOut' }}
              className={`w-16 md:w-24 ${displayHeights[displayIdx]} bg-gradient-to-t ${displayColors[displayIdx]} rounded-t-xl mt-2 shadow-lg origin-bottom`}
              style={{ boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.1), inset 2px 0 4px rgba(255,255,255,0.2)' }}
            >
              <div className="flex items-center justify-center pt-3">
                <span className="text-white font-black text-lg md:text-2xl drop-shadow-md">{originalIdx + 1}</span>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Rank Item ───────────────────────────────────────────────────────────────

function RankItem({ entry, rank, index }: { entry: LeaderboardEntry; rank: number; index: number }) {
  const animatedPoints = useAnimatedCounter(entry.points, 800 + index * 50);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 + index * 0.04 }}
      whileHover={{ scale: 1.01, x: -4 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        entry.isCurrentChild
          ? 'bg-gradient-to-l from-amber-50 to-orange-50 shadow-md border-2 border-amber-300'
          : 'bg-white/60 hover:bg-white/80'
      }`}
    >
      {/* Rank */}
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm ${
        rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-amber-400 text-white' :
        rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
        rank === 3 ? 'bg-gradient-to-br from-orange-300 to-amber-600 text-white' :
        'bg-slate-100 text-slate-500'
      }`}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-white shadow-sm overflow-hidden shrink-0">
        <AvatarImage avatarId={entry.avatarId} size={40} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-700 truncate">{entry.name}</span>
          {entry.isCurrentChild && (
            <Badge className="bg-amber-400 text-white border-0 text-[10px] px-1.5 py-0 shrink-0">أنت ✨</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>المستوى {entry.level}</span>
          <span>•</span>
          <span>🔥 {entry.streak}</span>
          <span>•</span>
          <span>🏅 {entry.badges}</span>
        </div>
      </div>

      {/* Trend */}
      <div className="shrink-0">
        {entry.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
        {entry.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
        {entry.trend === 'stable' && <Minus className="w-4 h-4 text-slate-300" />}
      </div>

      {/* Points */}
      <div className="text-left shrink-0">
        <div className="text-sm font-black text-amber-600">{animatedPoints.toLocaleString('ar-EG')}</div>
        <div className="text-[10px] text-slate-400">نقطة</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LeaderboardPage({ currentChild, onBack }: LeaderboardPageProps) {
  const [activeTab, setActiveTab] = useState('weekly');
  const [sortCategory, setSortCategory] = useState<SortCategory>('points');

  const allTimeData = useMemo(() => generateLeaderboard(currentChild, sortCategory), [currentChild, sortCategory]);
  const weeklyData = useMemo(() => allTimeData.map(e => ({ ...e, points: Math.floor(e.points * (0.1 + Math.random() * 0.3)) })).sort((a, b) => b.points - a.points), [allTimeData]);
  const monthlyData = useMemo(() => allTimeData.map(e => ({ ...e, points: Math.floor(e.points * (0.3 + Math.random() * 0.5)) })).sort((a, b) => b.points - a.points), [allTimeData]);

  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return allTimeData;
    }
  }, [activeTab, weeklyData, monthlyData, allTimeData]);

  const top3 = currentData.slice(0, 3);
  const rest = currentData.slice(3);

  const currentChildRank = useMemo(() => {
    const idx = currentData.findIndex(e => e.isCurrentChild);
    return idx >= 0 ? idx + 1 : currentData.length;
  }, [currentData]);

  const percentile = useMemo(() => {
    return Math.round((1 - (currentChildRank - 1) / currentData.length) * 100);
  }, [currentChildRank, currentData.length]);

  // Nearby competitors
  const nearbyCompetitors = useMemo(() => {
    const currentIdx = currentData.findIndex(e => e.isCurrentChild);
    if (currentIdx < 0) return [];
    const start = Math.max(0, currentIdx - 1);
    const end = Math.min(currentData.length, currentIdx + 2);
    return currentData.slice(start, end);
  }, [currentData]);

  return (
    <div dir="rtl" className="min-h-screen w-full pb-8" style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #e0f2fe 60%, #d1fae5 100%)',
    }}>
      <div className="relative z-10 max-w-2xl mx-auto px-3 md:px-6 flex flex-col gap-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <Card className="border-0 shadow-xl bg-gradient-to-l from-yellow-400 via-amber-400 to-orange-400 overflow-hidden relative">
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-center gap-3">
                <motion.button onClick={onBack} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white text-lg backdrop-blur-sm" aria-label="رجوع">
                  →
                </motion.button>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm flex items-center gap-2">
                    <Trophy className="w-7 h-7" /> لوحة المتصدرين
                  </h1>
                  <p className="text-white/80 text-xs md:text-sm mt-0.5">
                    ترتيبك: <span className="font-black">#{currentChildRank}</span> — النسبة المئوية: <span className="font-black">{percentile}%</span>
                  </p>
                </div>
                <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="text-4xl">
                  🏅
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="w-full grid grid-cols-3 bg-white/70 backdrop-blur-sm shadow-md rounded-xl h-12">
              {[
                { value: 'weekly', label: 'أسبوعي 📅' },
                { value: 'monthly', label: 'شهري 📆' },
                { value: 'all-time', label: 'الكل ⭐' },
              ].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}
                  className="text-sm font-bold data-[state=active]:bg-gradient-to-l data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white rounded-lg">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Sort Category */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {([
              { key: 'points' as SortCategory, label: 'النقاط', icon: <Star className="w-3.5 h-3.5" /> },
              { key: 'level' as SortCategory, label: 'المستوى', icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { key: 'streak' as SortCategory, label: 'السلسلة', icon: <Flame className="w-3.5 h-3.5" /> },
              { key: 'mastery' as SortCategory, label: 'الإتقان', icon: <Target className="w-3.5 h-3.5" /> },
            ]).map(cat => (
              <Button key={cat.key} size="sm" variant={sortCategory === cat.key ? 'default' : 'outline'}
                onClick={() => setSortCategory(cat.key)}
                className={`rounded-full text-xs font-bold gap-1 ${sortCategory === cat.key ? 'bg-amber-500 text-white border-0' : 'bg-white/80'}`}>
                {cat.icon} {cat.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Podium */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab + sortCategory} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6"><Podium top3={top3} /></CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Rank List */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab + sortCategory + '-list'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">الترتيب الكامل 📊</span>
                  <Badge variant="secondary" className="text-xs">{currentData.length} لاعب</Badge>
                </div>
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {rest.map((entry, i) => (
                    <RankItem key={entry.id} entry={entry} rank={i + 4} index={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Personal Rank + Nearby Competitors */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-xl bg-gradient-to-l from-amber-50 to-orange-50 border-2 border-amber-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg overflow-hidden">
                  <AvatarImage avatarId={currentChild.avatarId} size={48} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-800">{currentChild.displayName} — ترتيبك</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    المستوى {currentChild.level} • {currentChild.points.toLocaleString('ar-EG')} نقطة
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-3xl font-black text-amber-500">#{currentChildRank}</motion.div>
                  <div className="text-[10px] text-slate-400">أفضل من {percentile}%</div>
                </div>
              </div>

              {/* Nearby competitors */}
              {nearbyCompetitors.length > 1 && (
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <div className="text-[10px] font-bold text-slate-500 mb-1.5">المنافسون القريبون:</div>
                  <div className="flex flex-col gap-1.5">
                    {nearbyCompetitors.map((comp, i) => {
                      const compRank = currentData.findIndex(e => e.id === comp.id) + 1;
                      return (
                        <div key={comp.id} className={`flex items-center gap-2 p-1.5 rounded-lg text-xs ${
                          comp.isCurrentChild ? 'bg-amber-100' : 'bg-white/60'
                        }`}>
                          <span className="font-bold text-amber-600 w-6">#{compRank}</span>
                          <div className="w-6 h-6 rounded-full overflow-hidden">
                            <AvatarImage avatarId={comp.avatarId} size={24} />
                          </div>
                          <span className={`font-bold ${comp.isCurrentChild ? 'text-amber-700' : 'text-slate-600'}`}>{comp.name}</span>
                          <span className="text-slate-400 mr-auto">{comp.points.toLocaleString('ar-EG')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Motivation */}
        {currentChildRank > 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-l from-cyan-50 to-emerald-50 border-r-4 border-r-emerald-400">
              <CardContent className="p-4 flex items-center gap-3">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="text-3xl shrink-0">💪</motion.div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-emerald-600 mb-0.5">استمر في التدريب!</div>
                  <p className="text-sm font-semibold text-slate-700">
                    {currentChildRank <= 5 ? 'قريب من منصة التتويج! 🎉' : currentChildRank <= 10 ? 'مرتبة ممتازة! 🌟' : 'كل لعبة تقربك من القمة! 🚀'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
