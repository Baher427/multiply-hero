'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AvatarImage, { getAvatarEmoji } from '@/components/shared/AvatarImage';
import { useSound } from '@/hooks/use-sound';
import { BADGE_DEFINITIONS } from '@/lib/game-engine/constants';

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
    lastActiveDate?: string | null;
  };
  tableProgress: Array<{
    tableNumber: number;
    masteryLevel: number;
    correctAnswers: number;
    wrongAnswers: number;
    totalAttempts: number;
    avgSpeed?: number;
    lastPracticed?: string;
  }>;
  earnedBadges?: Array<{ badgeType: string; earnedAt: string }>;
  onStartGame: () => void;
  onDailyChallenge: () => void;
  onAchievements: () => void;
  onWorldMap: () => void;
  onStoryMode: () => void;
  onProfile: () => void;
  onBack: () => void;
  onSettings: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000];

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

const GAME_TYPE_ICONS: Record<string, string> = {
  'multiple-choice': '🎯',
  'true-false': '✅',
  'matching': '🔗',
  'fill-blank': '✏️',
};

const GAME_TYPE_NAMES: Record<string, string> = {
  'multiple-choice': 'اختيار متعدد',
  'true-false': 'صح أو خطأ',
  'matching': 'توصيل',
  'fill-blank': 'أكمل الفراغ',
};

const DAY_NAMES_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

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

// ─── Level Calculation ───────────────────────────────────────────────────────

function getLevelInfo(points: number) {
  const level = LEVEL_THRESHOLDS.reduce((lvl, threshold, i) => {
    return points >= threshold ? i + 1 : lvl;
  }, 1);

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpInLevel = points - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progress = xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 100;

  return { level, currentThreshold, nextThreshold, xpInLevel, xpNeeded, progress };
}

// ─── Time-based Greeting ─────────────────────────────────────────────────────

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'صباح الخير', emoji: '🌅' };
  if (hour >= 12 && hour < 17) return { text: 'مساء الخير', emoji: '☀️' };
  if (hour >= 17 && hour < 21) return { text: 'مساء النور', emoji: '🌆' };
  return { text: 'أهلاً وسهلاً', emoji: '🌙' };
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
      // Ease-out cubic
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

// ─── Floating Particle Component ─────────────────────────────────────────────

const PARTICLE_CONFIGS = [
  { emoji: '✨', size: 'text-lg', x: '5%', y: '10%', duration: 7, delay: 0 },
  { emoji: '⭐', size: 'text-sm', x: '15%', y: '25%', duration: 9, delay: 1 },
  { emoji: '💫', size: 'text-base', x: '85%', y: '15%', duration: 6, delay: 2 },
  { emoji: '✨', size: 'text-xs', x: '75%', y: '35%', duration: 8, delay: 0.5 },
  { emoji: '🌟', size: 'text-sm', x: '25%', y: '55%', duration: 10, delay: 3 },
  { emoji: '⭐', size: 'text-xs', x: '60%', y: '70%', duration: 7, delay: 1.5 },
  { emoji: '💫', size: 'text-lg', x: '40%', y: '80%', duration: 8, delay: 2.5 },
  { emoji: '✨', size: 'text-sm', x: '90%', y: '60%', duration: 9, delay: 0.8 },
  { emoji: '🌟', size: 'text-xs', x: '50%', y: '45%', duration: 11, delay: 4 },
  { emoji: '⭐', size: 'text-base', x: '35%', y: '90%', duration: 7, delay: 2 },
  { emoji: '✨', size: 'text-sm', x: '70%', y: '5%', duration: 8, delay: 1.2 },
  { emoji: '💫', size: 'text-xs', x: '10%', y: '75%', duration: 10, delay: 3.5 },
];

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLE_CONFIGS.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} opacity-15 select-none`}
          style={{ left: p.x, top: p.y }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 10, -5, 8, 0],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.25, 0.1, 0.2, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
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

// ─── Stat Item Component (with animated counter) ─────────────────────────────

function StatItem({ emoji, value, label, color, delay }: { emoji: string; value: number; label: string; color: string; delay: number }) {
  const safeValue = value ?? 0;
  const animatedValue = useAnimatedCounter(safeValue, 1200);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
      className="flex flex-col items-center gap-1"
    >
      <div className="text-2xl md:text-3xl">{emoji}</div>
      <div className={`text-lg md:text-xl font-extrabold ${color}`}>
        {animatedValue.toLocaleString('ar-EG')}
      </div>
      <div className="text-xs text-white/70 font-medium">{label}</div>
    </motion.div>
  );
}

// ─── Table Card Component (with click for detail) ────────────────────────────

function TableCard({
  tableNumber,
  mastery,
  correctAnswers,
  wrongAnswers,
  totalAttempts,
  avgSpeed,
  theme,
  index,
  onClick,
}: {
  tableNumber: number;
  mastery: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalAttempts: number;
  avgSpeed?: number;
  theme: WorldTheme;
  index: number;
  onClick: () => void;
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
      onClick={onClick}
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

// ─── Weekly Activity Heatmap ─────────────────────────────────────────────────

function WeeklyActivityHeatmap({ streak, lastActiveDate }: { streak: number; lastActiveDate: string | null }) {
  const days = useMemo(() => {
    const result: Array<{ date: string; dayName: string; active: boolean }> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = DAY_NAMES_AR[d.getDay()];

      // Determine if active: use lastActiveDate and streak to infer
      let active = false;
      if (lastActiveDate) {
        // If this day is within the streak range ending at lastActiveDate
        const lastActive = new Date(lastActiveDate);
        const diffDays = Math.round((lastActive.getTime() - d.getTime()) / 86400000);
        if (diffDays >= 0 && diffDays < streak) {
          active = true;
        }
        // Also mark today if lastActiveDate is today
        if (dateStr === lastActiveDate) {
          active = true;
        }
      }

      result.push({ date: dateStr, dayName: dayName.slice(0, 3), active });
    }
    return result;
  }, [streak, lastActiveDate]);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-700">نشاط الأسبوع 📅</span>
          <Badge variant="secondary" className="text-xs">
            {streak > 0 ? `${streak} أيام متتالية 🔥` : 'ابدأ سلسلة!'}
          </Badge>
        </div>
        <div className="flex gap-2 justify-between">
          {days.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 300 }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  day.active
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-md shadow-green-200'
                    : 'bg-slate-100'
                }`}
              >
                {day.active ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05, type: 'spring' }}
                    className="text-white text-xs md:text-sm"
                  >
                    ✓
                  </motion.span>
                ) : (
                  <span className="text-slate-300 text-xs">—</span>
                )}
              </div>
              <span className="text-[10px] md:text-xs text-slate-500 font-medium">
                {day.dayName}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent Games Summary ────────────────────────────────────────────────────

interface GameSession {
  id: string;
  gameType: string;
  tableNumber: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  duration: number;
  completedAt: string;
}

function RecentGamesSummary({ sessions }: { sessions: GameSession[] }) {
  if (sessions.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <span className="text-sm font-bold text-slate-700">آخر الألعاب 🎮</span>
          <p className="text-sm text-slate-400 mt-2 text-center">لا توجد ألعاب بعد — ابدأ اللعب!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <span className="text-sm font-bold text-slate-700 mb-3 block">آخر الألعاب 🎮</span>
        <div className="flex flex-col gap-2">
          {sessions.slice(0, 3).map((session, i) => {
            const total = session.correctCount + session.wrongCount;
            const accuracy = total > 0 ? Math.round((session.correctCount / total) * 100) : 0;
            const icon = GAME_TYPE_ICONS[session.gameType] || '🎮';
            const name = GAME_TYPE_NAMES[session.gameType] || session.gameType;
            const tableLabel = session.tableNumber > 0 ? `جدول ${session.tableNumber}` : 'مختلط';
            const timeAgo = getTimeAgo(session.completedAt);

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="text-2xl shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 truncate">{name}</span>
                    <span className="text-xs font-bold text-amber-600">{session.score} نقطة</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">{tableLabel}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400">{timeAgo}</span>
                  </div>
                  {/* Mini accuracy bar */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracy}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                        className={`h-full rounded-full ${
                          accuracy >= 80
                            ? 'bg-green-500'
                            : accuracy >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-400'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{accuracy}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHr < 24) return `منذ ${diffHr} ساعة`;
    if (diffDay < 7) return `منذ ${diffDay} يوم`;
    return `منذ ${Math.floor(diffDay / 7)} أسبوع`;
  } catch {
    return '';
  }
}

// ─── Daily Challenge Status Card ─────────────────────────────────────────────

function DailyChallengeStatusCard({
  onPlay,
}: {
  onPlay: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [completed, setCompleted] = useState(() => {
    if (typeof window === 'undefined') return false;
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`daily-challenge-${today}`) === 'completed';
  });

  useEffect(() => {
    // Countdown to midnight
    function updateTime() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card className={`border-0 shadow-lg overflow-hidden ${
        completed
          ? 'bg-gradient-to-l from-green-50 to-emerald-50'
          : 'bg-gradient-to-l from-amber-50 to-orange-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={completed ? { scale: [1, 1.2, 1] } : { rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: completed ? 2 : 3, ease: 'easeInOut' }}
                className="text-3xl"
              >
                {completed ? '✅' : '📅'}
              </motion.div>
              <div>
                <div className="text-sm font-bold text-slate-700">
                  {completed ? 'تم إكمال تحدي اليوم!' : 'تحدي اليوم ينتظرك!'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  التحدي التالي بعد: <span className="font-mono font-bold text-amber-600">{timeLeft}</span>
                </div>
              </div>
            </div>
            {!completed && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onPlay}
                className="px-4 py-2 rounded-xl bg-gradient-to-l from-amber-400 to-orange-500 text-white text-sm font-bold shadow-md"
              >
                يلا! 🚀
              </motion.button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Level Progress Bar ──────────────────────────────────────────────────────

function LevelProgressBar({ points, level }: { points: number; level: number }) {
  const info = useMemo(() => getLevelInfo(points), [points]);
  const levelBadge = LEVEL_BADGES[Math.min(level, 10)] || '🏆';
  const nextLevelBadge = LEVEL_BADGES[Math.min(level + 1, 10)] || '🏆';
  const xpRemaining = info.xpNeeded - info.xpInLevel;

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-700">تقدم المستوى 📈</span>
          <span className="text-xs text-slate-500">
            <span className="font-bold text-amber-600">{xpRemaining.toLocaleString('ar-EG')}</span> نقطة للمستوى التالي
          </span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-2xl"
          >
            {levelBadge}
          </motion.div>
          <div className="flex-1">
            <Progress
              value={Math.min(info.progress, 100)}
              className="h-4 rounded-full bg-slate-200 [&>div]:bg-gradient-to-l [&>div]:from-amber-400 [&>div]:to-orange-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400">مستوى {level}</span>
              <span className="text-[10px] text-slate-400">مستوى {level + 1} {nextLevelBadge}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Achievement Spotlight ───────────────────────────────────────────────────

function AchievementSpotlight({ earnedBadges }: { earnedBadges: Array<{ badgeType: string; earnedAt: string }> }) {
  const latestBadge = useMemo(() => {
    if (!earnedBadges || earnedBadges.length === 0) return null;
    const sorted = [...earnedBadges].sort(
      (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    );
    return sorted[0];
  }, [earnedBadges]);

  const badgeInfo = useMemo(() => {
    if (!latestBadge) return null;
    return BADGE_DEFINITIONS.find((b) => b.type === latestBadge.badgeType) || null;
  }, [latestBadge]);

  if (!badgeInfo || !latestBadge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-l from-yellow-50 to-amber-50 overflow-hidden relative">
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-yellow-200/30"
        />
        <CardContent className="p-4 flex items-center gap-3 relative z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="text-4xl md:text-5xl drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }}
          >
            {badgeInfo.icon}
          </motion.div>
          <div className="flex-1">
            <div className="text-xs font-bold text-amber-600 mb-0.5">أحدث إنجاز ✨</div>
            <div className="text-base font-black text-slate-800">{badgeInfo.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{badgeInfo.description}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Table Detail Dialog ─────────────────────────────────────────────────────

function TableDetailDialog({
  tableNumber,
  tableData,
  theme,
  open,
  onOpenChange,
}: {
  tableNumber: number;
  tableData: {
    masteryLevel: number;
    correctAnswers: number;
    wrongAnswers: number;
    totalAttempts: number;
    avgSpeed?: number;
    lastPracticed?: string;
  } | undefined;
  theme: WorldTheme;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!tableData) return null;

  const masteryInfo = getMasteryColor(tableData.masteryLevel);
  const accuracy =
    tableData.totalAttempts > 0
      ? Math.round((tableData.correctAnswers / tableData.totalAttempts) * 100)
      : 0;
  const avgSpeed = tableData.avgSpeed ? Math.round(tableData.avgSpeed / 1000) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-3xl">{theme.emoji}</span>
            <span>
              جدول {tableNumber} — {theme.name}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          {/* Mastery */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600">مستوى الإتقان</span>
            <Badge
              className={`${masteryInfo.bg} text-white border-0`}
            >
              {masteryInfo.label}
            </Badge>
          </div>
          <Progress
            value={tableData.masteryLevel}
            className="h-3 rounded-full bg-slate-200 [&>div]:bg-gradient-to-l [&>div]:from-emerald-400 [&>div]:to-green-500"
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-green-600">
                {tableData.correctAnswers}
              </div>
              <div className="text-xs text-green-700 font-medium">إجابات صحيحة</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-red-500">
                {tableData.wrongAnswers}
              </div>
              <div className="text-xs text-red-600 font-medium">إجابات خاطئة</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-amber-600">{accuracy}%</div>
              <div className="text-xs text-amber-700 font-medium">الدقة</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-blue-600">
                {avgSpeed > 0 ? `${avgSpeed}ث` : '—'}
              </div>
              <div className="text-xs text-blue-700 font-medium">متوسط السرعة</div>
            </div>
          </div>

          {/* Total Attempts */}
          <div className="text-center text-sm text-slate-500">
            إجمالي المحاولات: <span className="font-bold">{tableData.totalAttempts}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChildDashboard({
  child,
  tableProgress,
  earnedBadges = [],
  onStartGame,
  onDailyChallenge,
  onAchievements,
  onWorldMap,
  onStoryMode,
  onProfile,
  onBack,
  onSettings,
}: ChildDashboardProps) {
  // Derived data
  const levelBadge = LEVEL_BADGES[Math.min(child.level, 10)] || '🏆';
  const { play } = useSound();
  const greeting = getGreeting();

  // State for recent game sessions
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([]);
  const [selectedTable, setSelectedTable] = useState<{
    number: number;
    data: ChildDashboardProps['tableProgress'][0] | undefined;
  } | null>(null);

  // Fetch recent sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(`/api/game-session?childId=${child.id}&limit=3`);
        const data = await res.json();
        if (data.success) {
          setRecentSessions(data.data);
        }
      } catch {
        // Silently fail
      }
    }
    fetchSessions();
  }, [child.id]);

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
    const map = new Map<number, ChildDashboardProps['tableProgress'][0]>();
    tableProgress.forEach((tp) => map.set(tp.tableNumber, tp));
    return map;
  }, [tableProgress]);

  const totalMastery = useMemo(() => {
    if (tableProgress.length === 0) return 0;
    return Math.round(
      tableProgress.reduce((acc, tp) => acc + tp.masteryLevel, 0) / tableProgress.length
    );
  }, [tableProgress]);

  // Handle table card click
  const handleTableClick = useCallback((tableNumber: number) => {
    play('click');
    setSelectedTable({
      number: tableNumber,
      data: progressMap.get(tableNumber),
    });
  }, [play, progressMap]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full pb-8"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #e0f2fe 60%, #d1fae5 100%)',
      }}
    >
      {/* ─── Floating Particle Background ─── */}
      <FloatingParticles />

      {/* ─── Original Background Decorations (kept for compatibility) ─── */}
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
                    {greeting.text}، {child.displayName}! {greeting.emoji}
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

                {/* Settings + Back buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => { play('click'); onSettings(); }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white backdrop-blur-sm"
                    aria-label="الإعدادات"
                  >
                    <Settings size={18} />
                  </motion.button>
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Stats Bar (with animated counters) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-l from-slate-800 to-slate-700">
            <CardContent className="p-4 md:p-5">
              <div className="grid grid-cols-5 gap-2 md:gap-4">
                <StatItem emoji="⭐" value={child.points} label="نقاط" color="text-amber-400" delay={0.2} />
                <StatItem emoji="🌟" value={child.stars} label="نجوم" color="text-yellow-400" delay={0.25} />
                <StatItem emoji="🪙" value={child.coins} label="عملات" color="text-amber-300" delay={0.3} />
                <StatItem emoji="💎" value={child.gems} label="جواهر" color="text-cyan-300" delay={0.35} />
                <StatItem emoji="🔥" value={child.streak} label="متتالي" color="text-orange-400" delay={0.4} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Level Progress Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LevelProgressBar points={child.points} level={child.level} />
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

        {/* ─── Daily Challenge Status Card ─── */}
        <DailyChallengeStatusCard onPlay={onDailyChallenge} />

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

        {/* ─── Weekly Activity Heatmap ─── */}
        <WeeklyActivityHeatmap streak={child.streak} lastActiveDate={child.lastActiveDate ?? null} />

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
              const tp = progressMap.get(tableNum);
              const mastery = tp?.masteryLevel ?? 0;
              const theme = WORLD_THEMES[tableNum];
              return (
                <TableCard
                  key={tableNum}
                  tableNumber={tableNum}
                  mastery={mastery}
                  correctAnswers={tp?.correctAnswers ?? 0}
                  wrongAnswers={tp?.wrongAnswers ?? 0}
                  totalAttempts={tp?.totalAttempts ?? 0}
                  avgSpeed={tp?.avgSpeed}
                  theme={theme}
                  index={idx}
                  onClick={() => handleTableClick(tableNum)}
                />
              );
            })}
          </div>
        </div>

        {/* ─── Recent Games Summary ─── */}
        <RecentGamesSummary sessions={recentSessions} />

        {/* ─── Achievement Spotlight ─── */}
        <AchievementSpotlight earnedBadges={earnedBadges} />

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

      {/* ─── Table Detail Dialog ─── */}
      {selectedTable && (
        <TableDetailDialog
          tableNumber={selectedTable.number}
          tableData={selectedTable.data}
          theme={WORLD_THEMES[selectedTable.number]}
          open={!!selectedTable}
          onOpenChange={(open) => {
            if (!open) setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
}
