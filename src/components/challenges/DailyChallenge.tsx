'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Shield, Swords, RotateCcw, Skull, Flame, Star, Clock, Trophy, Heart, ChevronLeft, Sparkles, Target } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────────────────

interface DailyChallengeProps {
  streak: number;
  lastActiveDate: string | null;
  onStartChallenge: (tables: number[], difficulty: 'easy' | 'medium' | 'hard') => void;
  onBack: () => void;
  childId?: string;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ChallengeType = 'speed-round' | 'perfect-score' | 'survival' | 'reverse' | 'boss-battle';

interface ChallengeConfig {
  id: ChallengeType;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  pointMultiplier: number;
  coinReward: number;
  gemReward: number;
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

const CHALLENGE_TYPES: ChallengeConfig[] = [
  {
    id: 'speed-round',
    name: 'جولة السرعة',
    description: 'أجب على 10 أسئلة بأسرع وقت!',
    icon: '⚡',
    gradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-400',
    glowColor: 'shadow-yellow-400/50',
    difficulty: 'easy',
    questionCount: 10,
    pointMultiplier: 1.2,
    coinReward: 15,
    gemReward: 0,
  },
  {
    id: 'perfect-score',
    name: 'نتيجة مثالية',
    description: 'أجب على كل الأسئلة بدون خطأ!',
    icon: '🎯',
    gradient: 'from-emerald-400 to-green-500',
    borderColor: 'border-emerald-400',
    glowColor: 'shadow-emerald-400/50',
    difficulty: 'medium',
    questionCount: 10,
    pointMultiplier: 1.8,
    coinReward: 25,
    gemReward: 1,
  },
  {
    id: 'survival',
    name: 'البقاء',
    description: 'استمر حتى تخطئ 3 مرات!',
    icon: '🛡️',
    gradient: 'from-red-400 to-rose-500',
    borderColor: 'border-red-400',
    glowColor: 'shadow-red-400/50',
    difficulty: 'hard',
    questionCount: 20,
    pointMultiplier: 2.0,
    coinReward: 35,
    gemReward: 2,
  },
  {
    id: 'reverse',
    name: 'المعكوس',
    description: 'أعطِ الناتج واختر العملية الصحيحة!',
    icon: '🔄',
    gradient: 'from-purple-400 to-violet-500',
    borderColor: 'border-purple-400',
    glowColor: 'shadow-purple-400/50',
    difficulty: 'medium',
    questionCount: 12,
    pointMultiplier: 1.5,
    coinReward: 20,
    gemReward: 1,
  },
  {
    id: 'boss-battle',
    name: 'معركة الزعيم',
    description: 'أسئلة صعبة من جداولك الضعيفة!',
    icon: '👾',
    gradient: 'from-slate-700 to-slate-900',
    borderColor: 'border-slate-500',
    glowColor: 'shadow-slate-400/50',
    difficulty: 'hard',
    questionCount: 15,
    pointMultiplier: 3.0,
    coinReward: 50,
    gemReward: 3,
  },
];

const DAY_NAMES_AR: Record<number, string> = {
  0: 'الأحد', 1: 'الإثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
  4: 'الخميس', 5: 'الجمعة', 6: 'السبت',
};

const DAY_NAMES_SHORT: Record<number, string> = {
  0: 'أحد', 1: 'إثن', 2: 'ثلا', 3: 'أرب', 4: 'خمي', 5: 'جمع', 6: 'سبت',
};

const DAY_TABLE_MAP: Record<number, number[]> = {
  0: [2, 4], 1: [3, 5], 2: [6, 7], 3: [8, 9], 4: [2, 6], 5: [3, 7], 6: [4, 8],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCairoNow(): Date {
  const now = new Date();
  const cairoStr = now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
  return new Date(cairoStr);
}

function getCairoDateStr(): string {
  return getCairoNow().toISOString().split('T')[0];
}

function getDailyTables(dateStr: string): number[] {
  const d = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = d.getDay();
  return [...DAY_TABLE_MAP[dayOfWeek]];
}

function getWeeklyStatus(lastActiveDate: string | null, streak: number): WeekDayStatus[] {
  const cairoNow = getCairoNow();
  const todayStr = getCairoDateStr();
  const days: WeekDayStatus[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(cairoNow);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayIdx = d.getDay();
    const isToday = dateStr === todayStr;
    const isFuture = d > cairoNow;

    let isCompleted = false;
    if (isToday && lastActiveDate === todayStr) {
      isCompleted = true;
    } else if (!isFuture) {
      const daysDiff = Math.floor((cairoNow.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= streak && daysDiff > 0) isCompleted = true;
    }

    days.push({
      dayName: DAY_NAMES_AR[dayIdx],
      dayNameShort: DAY_NAMES_SHORT[dayIdx],
      date: dateStr,
      isCompleted, isToday, isFuture,
    });
  }
  return days;
}

function getTodayChallengeType(): ChallengeType {
  const d = getCairoNow();
  const idx = d.getDay() % CHALLENGE_TYPES.length;
  return CHALLENGE_TYPES[idx].id;
}

// ─── 3D CSS Trophy Component ────────────────────────────────────────────────

function Trophy3D({ size = 80 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Trophy cup */}
      <div
        className="absolute rounded-b-3xl"
        style={{
          left: '15%', right: '15%', top: '5%', height: '55%',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)',
          boxShadow: 'inset -4px -4px 8px rgba(0,0,0,0.2), inset 4px 4px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(251,191,36,0.4)',
        }}
      />
      {/* Trophy rim */}
      <div
        className="absolute rounded-t-2xl"
        style={{
          left: '10%', right: '10%', top: '0%', height: '15%',
          background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #d97706 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      />
      {/* Trophy base */}
      <div
        className="absolute rounded-lg"
        style={{
          left: '30%', right: '30%', top: '58%', height: '12%',
          background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
        }}
      />
      <div
        className="absolute rounded-b-lg"
        style={{
          left: '20%', right: '20%', top: '68%', height: '14%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
      />
      {/* Star on cup */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '35%', top: '18%', width: '30%', height: '25%' }}
      >
        <Star className="w-full h-full text-amber-900/40" fill="currentColor" />
      </div>
    </div>
  );
}

// ─── Health Bar Component ────────────────────────────────────────────────────

function HealthBar({ lives, maxLives = 3 }: { lives: number; maxLives?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: maxLives }).map((_, i) => (
        <motion.div
          key={i}
          animate={i < lives ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ repeat: i < lives ? Infinity : 0, duration: 1.2, ease: 'easeInOut' }}
        >
          <Heart
            className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Streak Counter with Fire ────────────────────────────────────────────────

function StreakCounter({ streak }: { streak: number }) {
  const flameSize = Math.min(24 + streak * 3, 56);
  const glowIntensity = Math.min(streak * 8, 60);

  return (
    <div className="flex flex-col items-center gap-1 relative">
      {streak > 0 && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(251,146,60,${glowIntensity / 100}) 0%, transparent 70%)`,
            filter: `blur(${6 + streak}px)`,
            transform: 'scale(2.5)',
          }}
        />
      )}
      <motion.div
        animate={{ scale: [1, 1.12, 1], rotate: [0, -2, 2, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        className="relative z-10"
        style={{ fontSize: flameSize }}
      >
        🔥
      </motion.div>
      <div className="relative z-10">
        <motion.div
          animate={streak > 0 ? {
            textShadow: ['0 0 5px rgba(251,146,60,0.3)', '0 0 20px rgba(251,146,60,0.6)', '0 0 5px rgba(251,146,60,0.3)'],
          } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-3xl md:text-4xl font-black text-orange-600"
        >
          {streak}
        </motion.div>
        <div className="text-[10px] font-bold text-orange-400 text-center">يوم متتالي</div>
      </div>
    </div>
  );
}

// ─── Countdown Timer ────────────────────────────────────────────────────────

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const cairoNow = getCairoNow();
      const midnight = new Date(cairoNow);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      const diff = midnight.getTime() - cairoNow.getTime();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 30;

  return (
    <div className="flex items-center justify-center gap-1.5">
      {[
        { val: timeLeft.hours, label: 'ساعة' },
        { val: timeLeft.minutes, label: 'دقيقة' },
        { val: timeLeft.seconds, label: 'ثانية' },
      ].map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-1.5">
          <motion.div
            className="bg-black/15 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px] text-center"
            animate={isUrgent && i === 2 ? { scale: [1, 1.05, 1] } : {}}
            transition={isUrgent ? { repeat: Infinity, duration: 0.5 } : {}}
          >
            <div className={`text-lg font-black tabular-nums ${isUrgent ? 'text-red-200' : 'text-white'}`}>{pad(unit.val)}</div>
            <div className="text-[8px] text-white/50 font-semibold -mt-0.5">{unit.label}</div>
          </motion.div>
          {i < 2 && <span className="text-white/40 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Weekly Progress Grid ────────────────────────────────────────────────────

function WeeklyProgressGrid({ weeklyStatus }: { weeklyStatus: WeekDayStatus[] }) {
  const completedCount = weeklyStatus.filter(d => d.isCompleted).length;

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-500" />
            تقدّم الأسبوع
          </h3>
          <Badge className="bg-amber-100 text-amber-700 border-0 font-bold text-xs">
            {completedCount}/7 أيام
          </Badge>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyStatus.map(day => (
            <motion.div key={day.date} className="flex flex-col items-center gap-1" whileHover={{ scale: 1.1 }}>
              <span className="text-[9px] font-bold text-slate-400">{day.dayNameShort}</span>
              <motion.div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black transition-all ${
                  day.isCompleted
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-200'
                    : day.isToday
                    ? 'bg-gradient-to-br from-amber-200 to-orange-200 text-amber-700 ring-2 ring-amber-400 ring-offset-1'
                    : 'bg-slate-100 text-slate-300'
                }`}
                animate={day.isToday && !day.isCompleted ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                {day.isCompleted ? '✓' : day.isToday ? '?' : '·'}
              </motion.div>
            </motion.div>
          ))}
        </div>
        {completedCount === 7 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center">
            <span className="text-sm font-black text-emerald-600">أسبوع كامل! مكافأة قادمة!</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Challenge Type Card ─────────────────────────────────────────────────────

function ChallengeTypeCard({
  config,
  isSelected,
  onSelect,
  isCompleted,
  index,
}: {
  config: ChallengeConfig;
  isSelected: boolean;
  onSelect: () => void;
  isCompleted: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.07 }}
      whileHover={!isCompleted ? { scale: 1.04, y: -3 } : {}}
      whileTap={!isCompleted ? { scale: 0.97 } : {}}
      onClick={!isCompleted ? onSelect : undefined}
      className={`cursor-${isCompleted ? 'not-allowed' : 'pointer'}`}
    >
      <Card className={`border-2 overflow-hidden shadow-lg relative transition-all ${
        isSelected ? `${config.borderColor} shadow-xl` : 'border-transparent'
      } ${isCompleted ? 'opacity-60' : ''}`}>
        {/* Glow */}
        {isSelected && (
          <motion.div
            className={`absolute -inset-1 rounded-xl ${config.glowColor} shadow-[0_0_20px_4px] opacity-40`}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        )}

        <div className={`bg-gradient-to-br ${config.gradient} p-3 relative z-10`}>
          <div className="flex items-center gap-3">
            <motion.div
              className="text-3xl"
              animate={isSelected ? { rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: isSelected ? Infinity : 0, duration: 2, ease: 'easeInOut' }}
            >
              {config.icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-white truncate">{config.name}</h3>
              <p className="text-[10px] text-white/70 line-clamp-1">{config.description}</p>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-bold text-white/60">{config.questionCount} سؤال</span>
              <span className="text-[9px] font-bold text-yellow-200">×{config.pointMultiplier}</span>
            </div>
          </div>
        </div>

        {/* Rewards row */}
        <CardContent className="p-2 bg-white/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs flex items-center gap-0.5 font-bold text-amber-600">⭐ {config.coinReward * 5}</span>
              <span className="text-xs flex items-center gap-0.5 font-bold text-yellow-600">🪙 {config.coinReward}</span>
              {config.gemReward > 0 && (
                <span className="text-xs flex items-center gap-0.5 font-bold text-purple-600">💎 {config.gemReward}</span>
              )}
            </div>
            {isCompleted ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px]">✅ مُنجز</Badge>
            ) : isSelected ? (
              <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px]">✓ مختار</Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Reward Preview Card ─────────────────────────────────────────────────────

function RewardPreviewCard({ config, streak }: { config: ChallengeConfig; streak: number }) {
  const streakBonus = Math.min(streak * 5, 100);

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <h3 className="text-sm font-black text-slate-700 flex items-center gap-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          المكافآت المتوقعة
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Star className="w-5 h-5" />, label: 'نقاط', value: Math.round(config.coinReward * 5 * config.pointMultiplier), color: 'text-amber-600' },
            { icon: <span className="text-lg">🪙</span>, label: 'عملات', value: config.coinReward, color: 'text-yellow-600' },
            ...(config.gemReward > 0 ? [{ icon: <span className="text-lg">💎</span>, label: 'جواهر', value: config.gemReward, color: 'text-purple-600' }] : []),
          ].map(item => (
            <motion.div
              key={item.label}
              className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-2.5 flex items-center gap-2 border border-slate-100"
              whileHover={{ scale: 1.03 }}
            >
              <div className={item.color}>{item.icon}</div>
              <div>
                <div className={`text-sm font-black ${item.color}`}>{item.value}</div>
                <div className="text-[9px] text-slate-400 font-semibold">{item.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
        {streakBonus > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 bg-gradient-to-l from-orange-50 to-amber-50 rounded-xl p-2.5 border border-orange-100"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-700">
                مكافأة السلسلة: +{streakBonus}% إضافي!
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Boss Battle Intro ───────────────────────────────────────────────────────

function BossBattleIntro({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #1e1b4b 100%)',
      }}
      dir="rtl"
    >
      {/* Dramatic particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-400"
          style={{
            left: `${10 + (i * 4) % 80}%`,
            top: `${5 + (i * 7) % 90}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: 'easeInOut', delay: i * 0.2 }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.3 }}
        className="text-8xl md:text-9xl mb-6"
      >
        👾
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          معركة الزعيم!
        </h1>
        <p className="text-purple-300 text-sm md:text-base max-w-sm mx-auto mb-6">
          أسئلة صعبة من جداولك الضعيفة — هل أنت مستعد للمواجهة؟
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button
          onClick={onStart}
          className="h-14 text-lg font-black bg-gradient-to-l from-red-500 to-rose-600 hover:opacity-90 shadow-2xl border-0 rounded-2xl text-white"
        >
          <Swords className="w-5 h-5 ml-2" />
          ابدأ المعركة!
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 ml-1" />
          تراجع
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Stars Rating Component ─────────────────────────────────────────────────

function StarsRating({ count, total = 3 }: { count: number; total?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5 + i * 0.2, type: 'spring', stiffness: 300, damping: 15 }}
        >
          <Star
            className={`w-8 h-8 ${i < count ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Completion Celebration ──────────────────────────────────────────────────

function CompletionCelebration({ stars }: { stars: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="text-center py-4"
    >
      {/* 3D Trophy */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="flex justify-center mb-4"
      >
        <Trophy3D size={90} />
      </motion.div>

      <StarsRating count={stars} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
        <h3 className="text-xl font-black text-white mt-3">أحسنت! أنجزت تحدّي اليوم!</h3>
        <p className="text-white/70 text-sm mt-1">تعال غداً لتحدّي جديد!</p>
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
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType>(getTodayChallengeType());
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const todayStr = useMemo(() => getCairoDateStr(), []);
  const todayTables = useMemo(() => getDailyTables(todayStr), [todayStr]);

  const isTodayCompleted = useMemo(() => {
    if (!lastActiveDate) return false;
    return lastActiveDate === todayStr;
  }, [lastActiveDate, todayStr]);

  const currentConfig = useMemo(
    () => CHALLENGE_TYPES.find(c => c.id === selectedChallenge) ?? CHALLENGE_TYPES[0],
    [selectedChallenge]
  );

  const weeklyStatus = useMemo(() => getWeeklyStatus(lastActiveDate, streak), [lastActiveDate, streak]);

  const formattedDate = useMemo(() => {
    const d = new Date(todayStr + 'T00:00:00');
    return d.toLocaleDateString('ar-EG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo',
    });
  }, [todayStr]);

  const handleStart = useCallback(() => {
    if (selectedChallenge === 'boss-battle') {
      setShowBossIntro(true);
      return;
    }
    onStartChallenge(todayTables, currentConfig.difficulty);
  }, [selectedChallenge, todayTables, currentConfig.difficulty, onStartChallenge]);

  const handleBossStart = useCallback(() => {
    setShowBossIntro(false);
    onStartChallenge(todayTables, 'hard');
  }, [todayTables, onStartChallenge]);

  const handleBossBack = useCallback(() => {
    setShowBossIntro(false);
  }, []);

  const completionStars = useMemo(() => {
    if (streak >= 7) return 3;
    if (streak >= 3) return 2;
    return 1;
  }, [streak]);

  // Boss battle intro screen
  if (showBossIntro) {
    return <BossBattleIntro onStart={handleBossStart} onBack={handleBossBack} />;
  }

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
          ⚡
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
          👾
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
                    <Zap className="w-6 h-6" />
                    التحدّي اليومي
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

              {/* Countdown */}
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="text-[10px] text-white/50 text-center mb-1.5 font-semibold">
                  التحدّي القادم بعد
                </div>
                <CountdownTimer />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Streak Counter ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                <StreakCounter streak={streak} />
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-black text-orange-800 flex items-center gap-1.5">
                    <Flame className="w-5 h-5" />
                    سلسلة الأيام المتتالية
                  </h3>
                  <p className="text-xs text-orange-600">
                    العب كل يوم لتحافظ على السلسلة وتربح مكافآت أكبر!
                  </p>
                  {streak > 0 && (
                    <Badge className="bg-orange-500 text-white border-0 font-bold">
                      مستمر منذ {streak} يوم
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Weekly Progress Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <WeeklyProgressGrid weeklyStatus={weeklyStatus} />
        </motion.div>

        {/* ─── Challenge Types ─── */}
        {!isTodayCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Swords className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-black text-slate-700">اختر نوع التحدّي</h2>
            </div>
            <div className="space-y-3">
              {CHALLENGE_TYPES.map((config, idx) => (
                <ChallengeTypeCard
                  key={config.id}
                  config={config}
                  isSelected={selectedChallenge === config.id}
                  onSelect={() => setSelectedChallenge(config.id)}
                  isCompleted={false}
                  index={idx}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Today's Challenge Summary ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card
            className={`border-0 shadow-2xl overflow-hidden relative ${
              isTodayCompleted
                ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                : `bg-gradient-to-br ${currentConfig.gradient}`
            }`}
          >
            {/* Decorative */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-6 text-6xl rotate-12">{currentConfig.icon}</div>
              <div className="absolute bottom-2 right-8 text-5xl -rotate-6">🔥</div>
            </div>

            <CardContent className="p-5 md:p-6 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={isTodayCompleted ? {} : { scale: [1, 1.1, 1] }}
                  transition={isTodayCompleted ? {} : { repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-4xl"
                >
                  {isTodayCompleted ? '✅' : currentConfig.icon}
                </motion.div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {isTodayCompleted ? 'تمّ الإنجاز!' : currentConfig.name}
                  </h2>
                  <span className="text-xs text-white/60 font-semibold">{formattedDate}</span>
                </div>
              </div>

              {/* Challenge details */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <Clock className="w-5 h-5 text-white/80 mb-1" />
                  <span className="text-lg font-black text-white">{currentConfig.questionCount}</span>
                  <span className="text-[10px] text-white/70 font-semibold">سؤال</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <span className="text-xl mb-1">📊</span>
                  <span className="text-sm font-black text-white">{todayTables.join('، ')}</span>
                  <span className="text-[10px] text-white/70 font-semibold">الجداول</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <Shield className="w-5 h-5 text-white/80 mb-1" />
                  <span className="text-lg font-black text-white">×{currentConfig.pointMultiplier}</span>
                  <span className="text-[10px] text-white/70 font-semibold">مضاعف</span>
                </div>
              </div>

              {/* Tables included */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {todayTables.map(t => (
                  <Badge key={t} className="bg-white/25 text-white border-0 font-bold text-sm px-3 py-1 backdrop-blur-sm">
                    جدول {t}
                  </Badge>
                ))}
              </div>

              {/* Survival mode health bar preview */}
              {selectedChallenge === 'survival' && !isTodayCompleted && (
                <div className="mb-4 flex items-center gap-3 justify-center">
                  <span className="text-xs text-white/70 font-semibold">حياة:</span>
                  <HealthBar lives={3} maxLives={3} />
                </div>
              )}

              {/* Play button or celebration */}
              {!isTodayCompleted ? (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleStart}
                    className="w-full h-14 text-lg font-black rounded-2xl shadow-xl bg-white text-orange-600 hover:bg-white/90 border-0 transition-all"
                  >
                    {selectedChallenge === 'boss-battle' ? (
                      <><Skull className="w-5 h-5 ml-2" />ابدأ المعركة!</>
                    ) : (
                      <><Zap className="w-5 h-5 ml-2" />ابدأ التحدّي!</>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <CompletionCelebration stars={completionStars} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Reward Preview ─── */}
        {!isTodayCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RewardPreviewCard config={currentConfig} streak={streak} />
          </motion.div>
        )}

        {/* ─── Toggle Past Challenges ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(getCairoNow());
                  d.setDate(d.getDate() - (i + 1));
                  const dateStr = d.toISOString().split('T')[0];
                  const dayName = DAY_NAMES_AR[d.getDay()];
                  const completed = i + 1 <= streak;
                  const challengeType = CHALLENGE_TYPES[(d.getDay()) % CHALLENGE_TYPES.length];

                  return (
                    <motion.div
                      key={dateStr}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className={`border-0 shadow-md ${
                        completed
                          ? 'bg-gradient-to-l from-emerald-50 to-green-50 border-r-4 border-r-emerald-400'
                          : 'bg-gradient-to-l from-gray-50 to-slate-100 border-r-4 border-r-gray-300'
                      }`}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="text-2xl">{challengeType.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-700 truncate">
                              {challengeType.name} — {dayName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <Badge className={`${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} border-0 text-[9px]`}>
                            {completed ? '✅ مُنجز' : '⏭️ فائت'}
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
