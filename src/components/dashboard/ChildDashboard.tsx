'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AvatarImage, { getAvatarEmoji } from '@/components/shared/AvatarImage';
import { useSound } from '@/hooks/use-sound';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ChildDashboardProps {
  child: {
    id: string;
    name: string;
    displayName: string;
    age: number;
    avatarId: string;
    favoriteColor: string;
    points: number;
    level: number;
    stars: number;
    gems: number;
    coins: number;
    streak: number;
  };
  tableProgress: Array<{
    tableNumber: number;
    masteryLevel: number;
    correctAnswers: number;
    wrongAnswers: number;
    totalAttempts: number;
  }>;
  onStartGame: () => void;
  onDailyChallenge: () => void;
  onAchievements: () => void;
  onWorldMap: () => void;
  onStoryMode: () => void;
  onProfile: () => void;
  onBack: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AVATAR_MAP: Record<string, string> = {
  lion: '🦁',
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  bear: '🐻',
  fox: '🦊',
  panda: '🐼',
  unicorn: '🦄',
  dragon: '🐲',
  monkey: '🐵',
  owl: '🦉',
  penguin: '🐧',
  tiger: '🐯',
  frog: '🐸',
  dolphin: '🐬',
  star: '⭐',
  rocket: '🚀',
  flower: '🌸',
};

const LEVEL_BADGES: Record<number, string> = {
  1: '🌱',
  2: '🌿',
  3: '🌳',
  4: '⭐',
  5: '🌟',
  6: '💎',
  7: '👑',
  8: '🏆',
  9: '🎯',
  10: '🚀',
};

interface WorldTheme {
  emoji: string;
  name: string;
  gradient: string;
  bgColor: string;
  textColor: string;
}

const WORLD_THEMES: Record<number, WorldTheme> = {
  1: {
    emoji: '🏝️',
    name: 'جزيرة الأرقام',
    gradient: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-900',
  },
  2: {
    emoji: '🌳',
    name: 'غابة الضرب',
    gradient: 'from-lime-400 to-emerald-500',
    bgColor: 'bg-lime-500',
    textColor: 'text-lime-900',
  },
  3: {
    emoji: '🌊',
    name: 'محيط الثلاثة',
    gradient: 'from-teal-400 to-cyan-500',
    bgColor: 'bg-teal-500',
    textColor: 'text-teal-900',
  },
  4: {
    emoji: '⛰️',
    name: 'جبل الأربعة',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-900',
  },
  5: {
    emoji: '🍬',
    name: 'وادي الحلوى',
    gradient: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-500',
    textColor: 'text-pink-900',
  },
  6: {
    emoji: '🚀',
    name: 'فضاء الستة',
    gradient: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-500',
    textColor: 'text-violet-900',
  },
  7: {
    emoji: '🏰',
    name: 'قلعة السبعة',
    gradient: 'from-orange-400 to-red-400',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-900',
  },
  8: {
    emoji: '🎨',
    name: 'عالم الألوان',
    gradient: 'from-rose-400 to-pink-500',
    bgColor: 'bg-rose-500',
    textColor: 'text-rose-900',
  },
  9: {
    emoji: '👑',
    name: 'مملكة التسعة',
    gradient: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-900',
  },
};

const MOTIVATIONAL_TIPS = [
  'أنت بطل حقيقي! استمر في التدريب! 💪',
  'كل يوم تتعلم شيئاً جديداً! 🌟',
  'الممارسة تصنع المعجزات! ✨',
  'أنت أقرب مما تظن إلى إتقان جميع الجداول! 🎯',
  'لا تستسلم أبداً، أنت رائع! 🌈',
  'التحدّيات تجعلك أقوى! 🔥',
  'كل إجابة صحيحة هي خطوة للأمام! 👣',
  'ذكاؤك يتزايد مع كل سؤال! 🧠',
];

function getMasteryColor(mastery: number): { bg: string; text: string; label: string } {
  if (mastery >= 80) return { bg: 'bg-green-500', text: 'text-green-600', label: 'متقن ✅' };
  if (mastery >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'يتعلم 📖' };
  return { bg: 'bg-red-500', text: 'text-red-600', label: 'يحتاج تدريب 💪' };
}

// ─── Circular Progress Component ─────────────────────────────────────────────

function CircularProgress({
  value,
  size = 72,
  strokeWidth = 6,
  color,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-white drop-shadow-sm">
        {Math.round(value)}%
      </span>
    </div>
  );
}

// ─── Stat Item Component ─────────────────────────────────────────────────────

function StatItem({ emoji, value, label, color }: { emoji: string; value: number | undefined; label: string; color: string }) {
  const safeValue = value ?? 0;
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-1"
    >
      <div className={`text-2xl md:text-3xl`}>{emoji}</div>
      <div className={`text-lg md:text-xl font-extrabold ${color}`}>{safeValue.toLocaleString('ar-EG')}</div>
      <div className="text-xs text-white/70 font-medium">{label}</div>
    </motion.div>
  );
}

// ─── Table Card Component ────────────────────────────────────────────────────

function TableCard({
  tableNumber,
  mastery,
  theme,
  index,
}: {
  tableNumber: number;
  mastery: number;
  theme: WorldTheme;
  index: number;
}) {
  const masteryInfo = getMasteryColor(mastery);
  const progressColor = mastery >= 80 ? '#22c55e' : mastery >= 40 ? '#eab308' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.06,
      }}
      whileHover={{ scale: 1.06, rotate: -1 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer"
    >
      <Card
        className={`overflow-hidden border-0 shadow-lg bg-gradient-to-br ${theme.gradient} relative`}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1 right-2 text-4xl rotate-12">{theme.emoji}</div>
          <div className="absolute bottom-1 left-2 text-3xl -rotate-6">{theme.emoji}</div>
        </div>

        <CardContent className="p-3 md:p-4 flex flex-col items-center gap-2 relative z-10">
          {/* Table Number */}
          <div className="text-4xl md:text-5xl font-black text-white drop-shadow-md">
            {tableNumber}
          </div>

          {/* World Emoji */}
          <div className="text-2xl md:text-3xl">{theme.emoji}</div>

          {/* Circular Progress */}
          <CircularProgress value={mastery} size={64} strokeWidth={5} color={progressColor} />

          {/* Status Badge */}
          <div
            className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm`}
          >
            {masteryInfo.label}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChildDashboard({
  child,
  tableProgress,
  onStartGame,
  onDailyChallenge,
  onAchievements,
  onWorldMap,
  onStoryMode,
  onProfile,
  onBack,
}: ChildDashboardProps) {
  // Derived data
  const avatarEmoji = getAvatarEmoji(child.avatarId);
  const levelBadge = LEVEL_BADGES[Math.min(child.level, 10)] || '🏆';
  const { play } = useSound();

  const motivationalTip = useMemo(() => {
    const idx = Math.floor(Date.now() / 86400000) % MOTIVATIONAL_TIPS.length;
    return MOTIVATIONAL_TIPS[idx];
  }, []);

  // Find weakest table
  const weakestTable = useMemo(() => {
    if (tableProgress.length === 0) return null;
    const sorted = [...tableProgress].sort((a, b) => a.masteryLevel - b.masteryLevel);
    return sorted[0].masteryLevel < 80 ? sorted[0] : null;
  }, [tableProgress]);

  // Build a progress map for quick lookup
  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    tableProgress.forEach((tp) => map.set(tp.tableNumber, tp.masteryLevel));
    return map;
  }, [tableProgress]);

  const totalMastery = useMemo(() => {
    if (tableProgress.length === 0) return 0;
    return Math.round(
      tableProgress.reduce((acc, tp) => acc + tp.masteryLevel, 0) / tableProgress.length
    );
  }, [tableProgress]);

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
          ✨
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-40 left-16 text-5xl opacity-15"
        >
          🌟
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute bottom-32 right-24 text-4xl opacity-15"
        >
          🎈
        </motion.div>
        <motion.div
          animate={{ y: [0, 18, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute bottom-48 left-10 text-5xl opacity-15"
        >
          🦋
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 md:px-6 flex flex-col gap-5">
        {/* ─── Welcome Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-amber-400 via-orange-400 to-rose-400 overflow-hidden relative">
            {/* Confetti dots */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-3 left-8 w-3 h-3 rounded-full bg-white" />
              <div className="absolute top-6 right-20 w-2 h-2 rounded-full bg-yellow-200" />
              <div className="absolute bottom-4 left-24 w-2.5 h-2.5 rounded-full bg-white" />
              <div className="absolute bottom-6 right-12 w-2 h-2 rounded-full bg-yellow-100" />
            </div>

            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <motion.button
                  onClick={onProfile}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg border-3 border-white/50 cursor-pointer overflow-hidden"
                  aria-label="الملف الشخصي"
                >
                  <AvatarImage avatarId={child.avatarId} size={64} />
                </motion.button>

                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm">
                    مرحباً، {child.displayName}! 👋
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-white/25 text-white border-0 backdrop-blur-sm text-sm font-bold px-3 py-1">
                      {levelBadge} المستوى {child.level}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs px-2 py-0.5">
                      {child.age} سنوات
                    </Badge>
                  </div>
                </div>

                {/* Back button */}
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white text-lg backdrop-blur-sm"
                  aria-label="رجوع"
                >
                  →
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Stats Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-l from-slate-800 to-slate-700">
            <CardContent className="p-4 md:p-5">
              <div className="grid grid-cols-5 gap-2 md:gap-4">
                <StatItem emoji="⭐" value={child.points} label="نقاط" color="text-amber-400" />
                <StatItem emoji="🌟" value={child.stars} label="نجوم" color="text-yellow-400" />
                <StatItem emoji="🪙" value={child.coins} label="عملات" color="text-amber-300" />
                <StatItem emoji="💎" value={child.gems} label="جواهر" color="text-cyan-300" />
                <StatItem emoji="🔥" value={child.streak} label="متتالي" color="text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Overall Progress ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">التقدم الكامل 📊</span>
                <span className="text-sm font-extrabold text-emerald-600">{totalMastery}%</span>
              </div>
              <Progress
                value={totalMastery}
                className="h-4 rounded-full bg-slate-200 [&>div]:bg-gradient-to-l [&>div]:from-emerald-400 [&>div]:to-green-500"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Weak Table Indicator ─── */}
        <AnimatePresence>
          {weakestTable && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-l from-red-50 to-orange-50 border-r-4 border-r-red-400">
                <CardContent className="p-4 flex items-center gap-3">
                  <motion.span
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-3xl"
                  >
                    💪
                  </motion.span>
                  <p className="text-base md:text-lg font-bold text-red-700">
                    يجب أن تتدرب أكثر على جدول {weakestTable.tableNumber} 💪
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Table Progress Grid ─── */}
        <div>
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-2xl font-black text-slate-800 mb-3 flex items-center gap-2"
          >
            🗺️ عوالم الجداول
          </motion.h2>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tableNum, idx) => {
              const mastery = progressMap.get(tableNum) ?? 0;
              const theme = WORLD_THEMES[tableNum];
              return (
                <TableCard
                  key={tableNum}
                  tableNumber={tableNum}
                  mastery={mastery}
                  theme={theme}
                  index={idx}
                />
              );
            })}
          </div>
        </div>

        {/* ─── Quick Actions ─── */}
        <div>
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-2xl font-black text-slate-800 mb-3 flex items-center gap-2"
          >
            🎯 ألعاب سريعة
          </motion.h2>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Start Playing - Primary Action */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="col-span-2"
            >
              <Button
                onClick={() => { play('click'); onStartGame(); }}
                className="w-full h-20 md:h-24 text-xl md:text-2xl font-black rounded-2xl shadow-xl bg-gradient-to-l from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white border-0 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-2xl md:text-3xl ml-2"
                >
                  🎮
                </motion.span>
                ابدأ اللعب
              </Button>
            </motion.div>

            {/* Daily Challenge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <Button
                onClick={onDailyChallenge}
                className="w-full h-20 md:h-24 text-base md:text-lg font-black rounded-2xl shadow-lg bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-2xl ml-1">📅</span>
                التحدي اليومي
              </Button>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.25 }}
            >
              <Button
                onClick={onAchievements}
                className="w-full h-20 md:h-24 text-base md:text-lg font-black rounded-2xl shadow-lg bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white border-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-2xl ml-1">🏆</span>
                الإنجازات
              </Button>
            </motion.div>

            {/* World Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              <Button
                onClick={onWorldMap}
                className="w-full h-20 md:h-24 text-base md:text-lg font-black rounded-2xl shadow-lg bg-gradient-to-br from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white border-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-2xl ml-1">🗺️</span>
                خريطة العالم
              </Button>
            </motion.div>

            {/* Story Mode */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.35 }}
            >
              <Button
                onClick={onStoryMode}
                className="w-full h-20 md:h-24 text-base md:text-lg font-black rounded-2xl shadow-lg bg-gradient-to-br from-purple-400 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-600 text-white border-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-2xl ml-1">📖</span>
                وضع القصة
              </Button>
            </motion.div>
          </div>
        </div>

        {/* ─── AI Coach Tip ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-l from-cyan-50 to-emerald-50 border-r-4 border-r-emerald-400">
            <CardContent className="p-4 flex items-start gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-4xl shrink-0"
              >
                🤖
              </motion.div>
              <div className="flex-1">
                <div className="text-xs font-bold text-emerald-600 mb-1">مدربك الذكي يقول:</div>
                <p className="text-sm md:text-base font-semibold text-slate-700 leading-relaxed">
                  {motivationalTip}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Footer spacer ─── */}
        <div className="h-4" />
      </div>
    </div>
  );
}
