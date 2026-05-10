'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// ─── Props ───────────────────────────────────────────────────────────────────

interface DailyChallengeProps {
  streak: number;
  lastActiveDate: string | null;
  onStartChallenge: (tables: number[], difficulty: 'easy' | 'medium' | 'hard') => void;
  onBack: () => void;
  childId?: string;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  label: string;
  emoji: string;
  questionCount: number;
  pointMultiplier: number;
  coinMultiplier: number;
  gemReward: number;
  description: string;
  color: string;
  bgGradient: string;
  borderColor: string;
}

interface RewardPreview {
  points: number;
  coins: number;
  gems: number;
  streakBonus: number;
  totalValue: number;
}

interface WeekDayStatus {
  dayName: string;
  dayNameShort: string;
  date: string;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_NAMES_AR: Record<number, string> = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

const DAY_NAMES_SHORT: Record<number, string> = {
  0: 'أحد',
  1: 'إثن',
  2: 'ثلا',
  3: 'أرب',
  4: 'خمي',
  5: 'جمع',
  6: 'سبت',
};

// Day-specific table assignments (deterministic)
const DAY_TABLE_MAP: Record<number, number[]> = {
  0: [2, 4],   // Sunday: tables 2 & 4
  1: [3, 5],   // Monday: tables 3 & 5
  2: [6, 7],   // Tuesday: tables 6 & 7
  3: [8, 9],   // Wednesday: tables 8 & 9
  4: [2, 6],   // Thursday: tables 2 & 6
  5: [3, 7],   // Friday: tables 3 & 7
  6: [4, 8],   // Saturday: tables 4 & 8
};

const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    label: 'سهل',
    emoji: '🟢',
    questionCount: 8,
    pointMultiplier: 1,
    coinMultiplier: 1,
    gemReward: 0,
    description: '8 أسئلة بسيطة',
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-300',
  },
  medium: {
    label: 'متوسط',
    emoji: '🟡',
    questionCount: 12,
    pointMultiplier: 1.5,
    coinMultiplier: 1.5,
    gemReward: 1,
    description: '12 سؤال متوسط الصعوبة',
    color: 'text-amber-700',
    bgGradient: 'from-amber-50 to-yellow-50',
    borderColor: 'border-amber-300',
  },
  hard: {
    label: 'صعب',
    emoji: '🔴',
    questionCount: 16,
    pointMultiplier: 2.5,
    coinMultiplier: 2,
    gemReward: 2,
    description: '16 سؤال صعب مع 3 جداول',
    color: 'text-red-700',
    bgGradient: 'from-red-50 to-rose-50',
    borderColor: 'border-red-300',
  },
};

const STREAK_MILESTONES = [
  { days: 3, emoji: '🔥', title: 'شرارة البداية', reward: 50 },
  { days: 7, emoji: '💫', title: 'نجم الإصرار', reward: 150 },
  { days: 14, emoji: '⚡', title: 'قوة البرق', reward: 300 },
  { days: 30, emoji: '🌟', title: 'نجم الثبات', reward: 750 },
  { days: 60, emoji: '🌈', title: 'قوس قزح', reward: 1500 },
  { days: 100, emoji: '👑', title: 'أسطورة المثابرة', reward: 3000 },
];

// ─── Helper: Cairo Time ─────────────────────────────────────────────────────

function getCairoNow(): Date {
  const now = new Date();
  // Convert to Cairo time string then parse back
  const cairoStr = now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
  return new Date(cairoStr);
}

function getCairoDateStr(): string {
  return getCairoNow().toISOString().split('T')[0];
}

// ─── Helper: Deterministic Challenge Generation ─────────────────────────────

function getDailyTables(dateStr: string, difficulty: DifficultyLevel): number[] {
  const d = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = d.getDay();

  // Base tables from the day map
  const baseTables = [...DAY_TABLE_MAP[dayOfWeek]];

  // For hard difficulty, add a third table using date as seed
  if (difficulty === 'hard') {
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const extraPool = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((t) => !baseTables.includes(t));
    const idx = (seed * 17 + 3) % extraPool.length;
    baseTables.push(extraPool[idx]);
  }

  return baseTables;
}

function calculateRewardPreview(
  tables: number[],
  difficulty: DifficultyLevel,
  streak: number
): RewardPreview {
  const config = DIFFICULTY_CONFIG[difficulty];
  const basePoints = tables.reduce((acc, t) => acc + t * 10, 0);
  const points = Math.round(basePoints * config.pointMultiplier);
  const coins = Math.round((tables.reduce((acc, t) => acc + t * 3, 0)) * config.coinMultiplier);
  const gems = config.gemReward;

  // Streak bonus: 5% per streak day, capped at 100%
  const streakBonusPercent = Math.min(streak * 5, 100);
  const streakBonus = Math.round(points * (streakBonusPercent / 100));

  return {
    points,
    coins,
    gems,
    streakBonus,
    totalValue: points + coins * 2 + gems * 50 + streakBonus,
  };
}

// ─── Helper: Weekly Status ───────────────────────────────────────────────────

function getWeeklyStatus(lastActiveDate: string | null, streak: number): WeekDayStatus[] {
  const cairoNow = getCairoNow();
  const todayStr = getCairoDateStr();
  const currentDay = cairoNow.getDay();

  // Start of week (Saturday in Arabic calendar, but let's use Monday as start for simplicity)
  // Actually, let's use the last 7 days including today
  const days: WeekDayStatus[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(cairoNow);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayIdx = d.getDay();
    const isToday = dateStr === todayStr;
    const isFuture = d > cairoNow;

    // Determine if completed: use lastActiveDate for today, and infer from streak for past days
    let isCompleted = false;

    if (isToday && lastActiveDate === todayStr) {
      isCompleted = true;
    } else if (!isFuture) {
      // For past days: if within the streak range, assume completed
      const daysDiff = Math.floor((cairoNow.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= streak && daysDiff > 0) {
        isCompleted = true;
      } else if (daysDiff === 0 && lastActiveDate === todayStr) {
        isCompleted = true;
      }
    }

    days.push({
      dayName: DAY_NAMES_AR[dayIdx],
      dayNameShort: DAY_NAMES_SHORT[dayIdx],
      date: dateStr,
      isCompleted,
      isToday,
      isFuture,
    });
  }

  return days;
}

// ─── Countdown Timer Hook ────────────────────────────────────────────────────

function useCountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const cairoNow = getCairoNow();
      const midnight = new Date(cairoNow);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);

      const diff = midnight.getTime() - cairoNow.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

// ─── Streak Flame Component (Enhanced with glow) ────────────────────────────

function StreakFlame({ streak }: { streak: number }) {
  const flameSize = Math.min(40 + streak * 2, 80);
  const glowIntensity = Math.min(streak * 10, 60);

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Glow effect behind flame */}
      {streak > 0 && (
        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(251,146,60,${glowIntensity / 100}) 0%, transparent 70%)`,
            filter: `blur(${8 + streak}px)`,
            transform: 'scale(2)',
          }}
        />
      )}

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -3, 3, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut',
        }}
        className="relative z-10"
      >
        <span style={{ fontSize: flameSize }}>🔥</span>
        {streak >= 7 && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            ⭐
          </motion.div>
        )}
        {streak >= 30 && (
          <motion.div
            className="absolute -bottom-1 -left-1"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            💎
          </motion.div>
        )}
      </motion.div>

      <div className="text-center relative z-10">
        <motion.div
          animate={streak > 0 ? {
            textShadow: [
              '0 0 5px rgba(251,146,60,0.3)',
              '0 0 20px rgba(251,146,60,0.6)',
              '0 0 5px rgba(251,146,60,0.3)',
            ],
          } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-3xl md:text-4xl font-black text-orange-600"
        >
          {streak}
        </motion.div>
        <div className="text-xs font-bold text-orange-400">يوم متتالي</div>
      </div>
    </div>
  );
}

// ─── Streak Milestone Bar ────────────────────────────────────────────────────

function StreakMilestoneBar({ streak }: { streak: number }) {
  const currentMilestone = STREAK_MILESTONES.filter((m) => m.days <= streak).pop();
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > streak);

  if (!nextMilestone) {
    return (
      <Card className="border-0 shadow-md bg-gradient-to-r from-amber-100 to-yellow-100">
        <CardContent className="p-3 flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <div className="text-sm font-black text-amber-800">أنت أسطورة!</div>
            <div className="text-xs text-amber-600">وصلت أعلى مستوى من المثابرة!</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const prevDays = currentMilestone ? currentMilestone.days : 0;
  const progress = ((streak - prevDays) / (nextMilestone.days - prevDays)) * 100;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-r from-orange-50 to-amber-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{nextMilestone.emoji}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-orange-700">
                التالي: {nextMilestone.title}
              </span>
              <span className="text-xs font-bold text-amber-600">
                +{nextMilestone.reward} 🪙
              </span>
            </div>
            <div className="text-[10px] text-orange-400">
              يوم {streak} من {nextMilestone.days}
            </div>
          </div>
        </div>
        <Progress
          value={progress}
          className="h-3 rounded-full bg-orange-200 [&>div]:bg-gradient-to-l [&>div]:from-orange-400 [&>div]:to-amber-500"
        />
      </CardContent>
    </Card>
  );
}

// ─── Countdown Timer Component ───────────────────────────────────────────────

function CountdownTimer() {
  const { hours, minutes, seconds } = useCountdownToMidnight();

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-1.5">
      <motion.div
        className="bg-black/10 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px] text-center"
        animate={seconds === 0 ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="text-lg font-black text-white tabular-nums">{pad(hours)}</div>
        <div className="text-[8px] text-white/60 font-semibold -mt-0.5">ساعة</div>
      </motion.div>
      <span className="text-white/50 font-bold text-lg">:</span>
      <div className="bg-black/10 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px] text-center">
        <div className="text-lg font-black text-white tabular-nums">{pad(minutes)}</div>
        <div className="text-[8px] text-white/60 font-semibold -mt-0.5">دقيقة</div>
      </div>
      <span className="text-white/50 font-bold text-lg">:</span>
      <motion.div
        className="bg-black/10 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px] text-center"
        key={seconds}
        initial={{ y: -2, opacity: 0.7 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="text-lg font-black text-white tabular-nums">{pad(seconds)}</div>
        <div className="text-[8px] text-white/60 font-semibold -mt-0.5">ثانية</div>
      </motion.div>
    </div>
  );
}

// ─── Weekly Progress Grid ────────────────────────────────────────────────────

function WeeklyProgressGrid({ weeklyStatus }: { weeklyStatus: WeekDayStatus[] }) {
  const completedCount = weeklyStatus.filter((d) => d.isCompleted).length;

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
            📊 تقدّم الأسبوع
          </h3>
          <Badge className="bg-amber-100 text-amber-700 border-0 font-bold text-xs">
            {completedCount}/7 أيام
          </Badge>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyStatus.map((day) => (
            <motion.div
              key={day.date}
              className="flex flex-col items-center gap-1"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-[9px] font-bold text-slate-400">
                {day.dayNameShort}
              </span>
              <motion.div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black transition-all ${
                  day.isCompleted
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-200'
                    : day.isToday
                    ? 'bg-gradient-to-br from-amber-200 to-orange-200 text-amber-700 ring-2 ring-amber-400 ring-offset-1'
                    : 'bg-slate-100 text-slate-300'
                }`}
                animate={
                  day.isToday && !day.isCompleted
                    ? { scale: [1, 1.05, 1] }
                    : day.isCompleted
                    ? { scale: [1, 1.08, 1] }
                    : {}
                }
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              >
                {day.isCompleted ? '✓' : day.isToday ? '?' : '·'}
              </motion.div>
            </motion.div>
          ))}
        </div>
        {completedCount === 7 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center"
          >
            <span className="text-sm font-black text-emerald-600">
              🎉 أسبوع كامل! مكافأة أسبوعية قادمة!
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Difficulty Selector ─────────────────────────────────────────────────────

function DifficultySelector({
  selected,
  onSelect,
  isCompleted,
}: {
  selected: DifficultyLevel;
  onSelect: (d: DifficultyLevel) => void;
  isCompleted: boolean;
}) {
  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-black text-white/90 flex items-center gap-1.5">
        🎯 اختر مستوى الصعوبة
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {difficulties.map((diff) => {
          const config = DIFFICULTY_CONFIG[diff];
          const isSelected = selected === diff;

          return (
            <motion.button
              key={diff}
              onClick={() => !isCompleted && onSelect(diff)}
              whileHover={!isCompleted ? { scale: 1.03 } : {}}
              whileTap={!isCompleted ? { scale: 0.97 } : {}}
              disabled={isCompleted}
              className={`relative rounded-xl p-3 border-2 transition-all text-center ${
                isSelected
                  ? `bg-white/30 ${config.borderColor} shadow-lg`
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              } ${isCompleted ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSelected && (
                <motion.div
                  layoutId="difficultyGlow"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.15), transparent)`,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <div className="relative z-10">
                <div className="text-2xl mb-1">{config.emoji}</div>
                <div className="text-xs font-black text-white">{config.label}</div>
                <div className="text-[9px] text-white/60 mt-0.5">{config.questionCount} سؤال</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reward Preview Card ─────────────────────────────────────────────────────

function RewardPreviewCard({ reward, streak }: { reward: RewardPreview; streak: number }) {
  const items = [
    { emoji: '⭐', label: 'نقاط', value: reward.points, color: 'text-amber-600' },
    { emoji: '🪙', label: 'عملات', value: reward.coins, color: 'text-yellow-600' },
    { emoji: '💎', label: 'جواهر', value: reward.gems, color: 'text-purple-600' },
    ...(reward.streakBonus > 0
      ? [{ emoji: '🔥', label: 'مكافأة السلسلة', value: `+${reward.streakBonus}`, color: 'text-orange-600' as string }]
      : []),
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <h3 className="text-sm font-black text-slate-700 flex items-center gap-1.5 mb-3">
          🎁 المكافآت المتوقعة
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <motion.div
              key={item.label}
              className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-2.5 flex items-center gap-2 border border-slate-100"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-xl">{item.emoji}</span>
              <div>
                <div className={`text-sm font-black ${item.color}`}>{item.value}</div>
                <div className="text-[9px] text-slate-400 font-semibold">{item.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 bg-gradient-to-l from-orange-50 to-amber-50 rounded-xl p-2.5 border border-orange-100"
          >
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-lg"
              >
                🔥
              </motion.span>
              <span className="text-xs font-bold text-orange-700">
                مكافأة السلسلة: +{streak * 5}% إضافي من النقاط!
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Completion Celebration ──────────────────────────────────────────────────

function CompletionCelebration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="text-center py-4"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="text-5xl mb-3"
      >
        🎉
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-black text-white mb-1">أحسنت! أنجزت تحدّي اليوم!</h3>
        <p className="text-white/70 text-sm">تعال غداً لتحدّي جديد!</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-3 flex items-center justify-center gap-1"
      >
        {[...Array(5)].map((_, i) => (
          <motion.span
            key={i}
            className="text-2xl"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          >
            ⭐
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DailyChallenge({
  streak,
  lastActiveDate,
  onStartChallenge,
  onBack,
}: DailyChallengeProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
  const [showPast, setShowPast] = useState(false);

  // Today's challenge tables based on date + difficulty
  const todayStr = useMemo(() => getCairoDateStr(), []);
  const todayTables = useMemo(
    () => getDailyTables(todayStr, selectedDifficulty),
    [todayStr, selectedDifficulty]
  );

  // Check if already completed today
  const isTodayCompleted = useMemo(() => {
    if (!lastActiveDate) return false;
    return lastActiveDate === todayStr;
  }, [lastActiveDate, todayStr]);

  // Reward preview
  const rewardPreview = useMemo(
    () => calculateRewardPreview(todayTables, selectedDifficulty, streak),
    [todayTables, selectedDifficulty, streak]
  );

  // Weekly status
  const weeklyStatus = useMemo(() => getWeeklyStatus(lastActiveDate, streak), [lastActiveDate, streak]);

  // Format date in Arabic
  const formattedDate = useMemo(() => {
    const d = new Date(todayStr + 'T00:00:00');
    return d.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Cairo',
    });
  }, [todayStr]);

  // Day of week
  const dayOfWeek = useMemo(() => {
    const d = new Date(todayStr + 'T00:00:00');
    return DAY_NAMES_AR[d.getDay()];
  }, [todayStr]);

  // Handle start
  const handleStart = useCallback(() => {
    onStartChallenge(todayTables, selectedDifficulty);
  }, [todayTables, selectedDifficulty, onStartChallenge]);

  // Generate past challenge results for demo
  const pastChallenges = useMemo(() => {
    const results: Array<{
      date: string;
      tables: number[];
      completed: boolean;
      score: number;
      totalQuestions: number;
      reward: number;
    }> = [];
    const cairoNow = getCairoNow();

    for (let i = 1; i <= 7; i++) {
      const d = new Date(cairoNow);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const tables = getDailyTables(dateStr, 'medium');
      const daysDiff = i;
      const completed = daysDiff <= streak;
      const totalQuestions = DIFFICULTY_CONFIG.medium.questionCount;
      const score = completed ? Math.floor(totalQuestions * (0.6 + Math.random() * 0.3)) : 0;
      const reward = completed ? Math.round(score * 5 * 1.5) : 0;

      results.push({
        date: dateStr,
        tables,
        completed,
        score,
        totalQuestions,
        reward,
      });
    }

    return results;
  }, [streak]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full pb-8"
      style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 30%, #fce7f3 60%, #f3e8ff 100%)',
      }}
    >
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute top-20 right-10 text-5xl opacity-15"
        >
          📅
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute top-48 left-12 text-4xl opacity-15"
        >
          🔥
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute bottom-32 right-20 text-4xl opacity-15"
        >
          ⚡
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-72 right-32 text-3xl opacity-10"
        >
          💎
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute bottom-48 left-24 text-3xl opacity-10"
        >
          🌟
        </motion.div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-3 md:px-6 flex flex-col gap-4">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-orange-500 via-amber-500 to-yellow-400 overflow-hidden relative">
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
                    📅 التحدّي اليومي
                  </h1>
                  <p className="text-xs text-white/70 mt-1">{formattedDate}</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-4xl"
                >
                  ⚡
                </motion.div>
              </div>

              {/* Countdown to next challenge */}
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="text-[10px] text-white/50 text-center mb-1.5 font-semibold">
                  التحدّي القادم بعد
                </div>
                <CountdownTimer />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Streak Counter (Enhanced with Fire) ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                <StreakFlame streak={streak} />
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-black text-orange-800">
                    سلسلة الأيام المتتالية 🔥
                  </h3>
                  <p className="text-xs text-orange-600">
                    العب كل يوم لتحافظ على السلسلة وتربح مكافآت أكبر!
                  </p>
                  {streak > 0 && (
                    <Badge className="bg-orange-500 text-white border-0 font-bold">
                      🔥 مستمر منذ {streak} يوم
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Streak Milestone ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StreakMilestoneBar streak={streak} />
        </motion.div>

        {/* ─── Weekly Progress Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <WeeklyProgressGrid weeklyStatus={weeklyStatus} />
        </motion.div>

        {/* ─── Today's Challenge Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={`border-0 shadow-2xl overflow-hidden relative ${
              isTodayCompleted
                ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                : 'bg-gradient-to-br from-amber-400 via-orange-400 to-red-400'
            }`}
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-6 text-6xl rotate-12">⚡</div>
              <div className="absolute bottom-2 right-8 text-5xl -rotate-6">🔥</div>
            </div>

            <CardContent className="p-5 md:p-6 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={isTodayCompleted ? {} : { scale: [1, 1.1, 1] }}
                  transition={
                    isTodayCompleted ? {} : { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                  }
                  className="text-4xl"
                >
                  {isTodayCompleted ? '✅' : '🎯'}
                </motion.div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {isTodayCompleted ? 'تمّ الإنجاز!' : 'تحدّي اليوم'}
                  </h2>
                  <span className="text-xs text-white/60 font-semibold">{dayOfWeek}</span>
                </div>
              </div>

              {/* Difficulty selector */}
              {!isTodayCompleted && (
                <div className="mb-4">
                  <DifficultySelector
                    selected={selectedDifficulty}
                    onSelect={setSelectedDifficulty}
                    isCompleted={isTodayCompleted}
                  />
                </div>
              )}

              {/* Challenge details */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <span className="text-2xl mb-1">📝</span>
                  <span className="text-lg font-black text-white">
                    {DIFFICULTY_CONFIG[selectedDifficulty].questionCount}
                  </span>
                  <span className="text-[10px] text-white/70 font-semibold">سؤال</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <span className="text-2xl mb-1">📊</span>
                  <span className="text-sm font-black text-white">
                    {todayTables.join('، ')}
                  </span>
                  <span className="text-[10px] text-white/70 font-semibold">الجداول</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <span className="text-2xl mb-1">🪙</span>
                  <span className="text-lg font-black text-white">{rewardPreview.points}</span>
                  <span className="text-[10px] text-white/70 font-semibold">نقطة</span>
                </div>
              </div>

              {/* Tables included */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {todayTables.map((t) => (
                  <Badge
                    key={t}
                    className="bg-white/25 text-white border-0 font-bold text-sm px-3 py-1 backdrop-blur-sm"
                  >
                    جدول {t}
                  </Badge>
                ))}
              </div>

              {/* Play button or completion celebration */}
              {!isTodayCompleted ? (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleStart}
                    className="w-full h-14 text-lg font-black rounded-2xl shadow-xl bg-white text-orange-600 hover:bg-white/90 border-0 transition-all"
                  >
                    <motion.span
                      animate={{ rotate: [0, 15, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="text-2xl ml-2"
                    >
                      🎮
                    </motion.span>
                    ابدأ التحدّي! {DIFFICULTY_CONFIG[selectedDifficulty].emoji}
                  </Button>
                </motion.div>
              ) : (
                <CompletionCelebration />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Reward Preview ─── */}
        {!isTodayCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <RewardPreviewCard reward={rewardPreview} streak={streak} />
          </motion.div>
        )}

        {/* ─── Toggle Past Challenges ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => setShowPast(!showPast)}
            variant="ghost"
            className="w-full text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-xl"
          >
            {showPast ? '🔼 إخفاء التحدّيات السابقة' : '🔽 عرض التحدّيات السابقة'}
          </Button>
        </motion.div>

        {/* ─── Past Challenges ─── */}
        <AnimatePresence>
          {showPast && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pastChallenges.map((challenge, idx) => {
                  const d = new Date(challenge.date + 'T00:00:00');
                  const dayName = DAY_NAMES_AR[d.getDay()];
                  const formattedDateStr = d.toLocaleDateString('ar-EG', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <motion.div
                      key={challenge.date}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card
                        className={`border-0 shadow-md ${
                          challenge.completed
                            ? 'bg-gradient-to-l from-emerald-50 to-green-50 border-r-4 border-r-emerald-400'
                            : 'bg-gradient-to-l from-gray-50 to-slate-100 border-r-4 border-r-gray-300'
                        }`}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="text-2xl">
                            {challenge.completed ? '✅' : '❌'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">
                                {dayName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formattedDateStr}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {challenge.tables.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 text-slate-600"
                                >
                                  {t}×
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            {challenge.completed ? (
                              <>
                                <span className="text-sm font-black text-emerald-600">
                                  {challenge.score}/{challenge.totalQuestions}
                                </span>
                                <span className="text-xs text-amber-600 font-bold">
                                  +{challenge.reward} 🪙
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 font-semibold">
                                لم يُنجز
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Motivation Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-l from-rose-50 to-pink-50 border-r-4 border-r-rose-400">
            <CardContent className="p-4 flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-3xl shrink-0"
              >
                💪
              </motion.div>
              <div>
                <div className="text-xs font-bold text-rose-600 mb-1">نصيحة اليوم</div>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                  التحدّي اليومي يساعدك على التعزيز والممارسة المستمرة. حافظ على سلسلتك اليومية لتحصل على مكافآت أكبر! 🌟
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
