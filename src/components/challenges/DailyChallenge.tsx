'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// ─── Props ───────────────────────────────────────────────────────────────────

interface DailyChallengeProps {
  streak: number;
  lastActiveDate: string | null;
  onStartChallenge: (tables: number[]) => void;
  onBack: () => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface PastChallengeResult {
  date: string;
  tables: number[];
  score: number;
  totalQuestions: number;
  reward: number;
  completed: boolean;
}

interface TodayChallenge {
  date: string;
  tables: number[];
  numQuestions: number;
  reward: number;
  dayOfWeek: string;
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

const STREAK_MILESTONES = [
  { days: 3, emoji: '🔥', title: 'شرارة البداية', reward: 50 },
  { days: 7, emoji: '💫', title: 'نجم الإصرار', reward: 150 },
  { days: 14, emoji: '⚡', title: 'قوة البرق', reward: 300 },
  { days: 30, emoji: '🌟', title: 'نجم الثبات', reward: 750 },
  { days: 60, emoji: '🌈', title: 'قوس قزح', reward: 1500 },
  { days: 100, emoji: '👑', title: 'أسطورة المثابرة', reward: 3000 },
];

// Generate today's challenge based on the date
function generateTodayChallenge(): TodayChallenge {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const dayOfWeek = DAY_NAMES_AR[today.getDay()];

  // Deterministic "random" tables based on date
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const tables: number[] = [];
  const tablePool = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = 0; i < 3; i++) {
    const idx = (seed * (i + 7) + i * 13) % tablePool.length;
    tables.push(tablePool[idx]);
    tablePool.splice(idx, 1);
  }

  // More questions on harder days
  const numQuestions = tables.some((t) => t >= 7) ? 15 : 12;
  const reward = tables.reduce((acc, t) => acc + t, 0) * 5;

  return { date: dateStr, tables, numQuestions, reward, dayOfWeek };
}

// Generate past challenge results for demo
function generatePastChallenges(): PastChallengeResult[] {
  const results: PastChallengeResult[] = [];
  const now = new Date();

  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

    const tables: number[] = [];
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let j = 0; j < 3; j++) {
      const idx = (seed * (j + 7) + j * 13) % pool.length;
      tables.push(pool[idx]);
      pool.splice(idx, 1);
    }

    const completed = i > 2; // last 2 days "missed"
    const totalQuestions = tables.some((t) => t >= 7) ? 15 : 12;
    const score = completed ? Math.floor(totalQuestions * (0.6 + ((seed % 40) / 100))) : 0;
    const reward = completed ? Math.floor(score * 5) : 0;

    results.push({
      date: d.toISOString().split('T')[0],
      tables,
      score,
      totalQuestions,
      reward,
      completed,
    });
  }

  return results;
}

// ─── Streak Flame Component ──────────────────────────────────────────────────

function StreakFlame({ streak }: { streak: number }) {
  const flameSize = Math.min(40 + streak * 2, 80);

  return (
    <div className="flex flex-col items-center gap-2">
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
        className="relative"
      >
        <span style={{ fontSize: flameSize }}>🔥</span>
        {streak >= 7 && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            ⭐
          </motion.div>
        )}
      </motion.div>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-black text-orange-600">
          {streak}
        </div>
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DailyChallenge({
  streak,
  lastActiveDate,
  onStartChallenge,
  onBack,
}: DailyChallengeProps) {
  const [showPast, setShowPast] = useState(false);

  const todayChallenge = useMemo(() => generateTodayChallenge(), []);
  const pastChallenges = useMemo(() => generatePastChallenges(), []);

  // Check if already completed today
  const isTodayCompleted = useMemo(() => {
    if (!lastActiveDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return lastActiveDate === today;
  }, [lastActiveDate]);

  // Format date in Arabic
  const formattedDate = useMemo(() => {
    const d = new Date(todayChallenge.date);
    return d.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [todayChallenge.date]);

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
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={isTodayCompleted ? {} : { scale: [1, 1.1, 1] }}
                  transition={isTodayCompleted ? {} : { repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-4xl"
                >
                  {isTodayCompleted ? '✅' : '🎯'}
                </motion.div>
                <h2 className="text-xl md:text-2xl font-black text-white">
                  {isTodayCompleted ? 'تمّ الإنجاز!' : 'تحدّي اليوم'}
                </h2>
              </div>

              {/* Challenge details */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <span className="text-2xl mb-1">📝</span>
                  <span className="text-lg font-black text-white">{todayChallenge.numQuestions}</span>
                  <span className="text-[10px] text-white/70 font-semibold">سؤال</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <span className="text-2xl mb-1">📊</span>
                  <span className="text-sm font-black text-white">
                    {todayChallenge.tables.join('، ')}
                  </span>
                  <span className="text-[10px] text-white/70 font-semibold">الجداول</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                  <span className="text-2xl mb-1">🪙</span>
                  <span className="text-lg font-black text-white">{todayChallenge.reward}</span>
                  <span className="text-[10px] text-white/70 font-semibold">مكافأة</span>
                </div>
              </div>

              {/* Tables included */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {todayChallenge.tables.map((t) => (
                  <Badge
                    key={t}
                    className="bg-white/25 text-white border-0 font-bold text-sm px-3 py-1 backdrop-blur-sm"
                  >
                    جدول {t}
                  </Badge>
                ))}
              </div>

              {/* Play button */}
              {!isTodayCompleted ? (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={() => onStartChallenge(todayChallenge.tables)}
                    className="w-full h-14 text-lg font-black rounded-2xl shadow-xl bg-white text-orange-600 hover:bg-white/90 border-0 transition-all"
                  >
                    <motion.span
                      animate={{ rotate: [0, 15, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="text-2xl ml-2"
                    >
                      🎮
                    </motion.span>
                    ابدأ التحدّي!
                  </Button>
                </motion.div>
              ) : (
                <div className="text-center py-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-3xl mb-2"
                  >
                    🎉
                  </motion.div>
                  <p className="text-white font-bold">أحسنت! أنجزت تحدّي اليوم!</p>
                  <p className="text-white/70 text-sm mt-1">تعال غداً لتحدّي جديد!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Toggle Past Challenges ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
                  const d = new Date(challenge.date);
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
          transition={{ delay: 0.3 }}
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
                <div className="text-xs font-bold text-rose-600 mb-1">
                  نصيحة اليوم
                </div>
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
