'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Clock, Flame, Trophy, BookOpen, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ParentDashboardProps {
  childId: string;
  onBack: () => void;
}

interface TableProgressItem {
  id: string;
  tableNumber: number;
  masteryLevel: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalAttempts: number;
  avgSpeed: number;
  lastPracticed: string;
}

interface BadgeItem {
  id: string;
  badgeType: string;
  earnedAt: string;
}

interface GameSessionItem {
  id: string;
  gameType: string;
  tableNumber: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  duration: number;
  completedAt: string;
}

interface ChildData {
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
  lastActiveDate: string | null;
  totalPlayTime: number;
  comboCount: number;
  bestCombo: number;
  createdAt: string;
  updatedAt: string;
  tableProgress: TableProgressItem[];
  badges: BadgeItem[];
  gameSessions: GameSessionItem[];
}

interface DailyActivity {
  date: string;
  dayName: string;
  sessionCount: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalDuration: number;
}

interface ParentData {
  child: ChildData;
  dailyActivity: DailyActivity[];
  weekTotalQuestions: number;
  weekCorrectAnswers: number;
  weekAccuracy: number;
  overallMastery: number;
  recommendations: string[];
  weekSessionCount: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const AVATAR_MAP: Record<string, string> = {
  lion: '🦁', cat: '🐱', dog: '🐶', rabbit: '🐰', bear: '🐻',
  fox: '🦊', panda: '🐼', unicorn: '🦄', dragon: '🐲', monkey: '🐵',
  owl: '🦉', penguin: '🐧', tiger: '🐯', frog: '🐸', dolphin: '🐬',
  star: '⭐', rocket: '🚀', flower: '🌸',
};

const BADGE_NAMES: Record<string, { name: string; icon: string }> = {
  'first-game': { name: 'أول لعبة', icon: '🎮' },
  'table-master-1': { name: 'بطل جدول ١', icon: '🏆' },
  'table-master-2': { name: 'بطل جدول ٢', icon: '🏆' },
  'table-master-3': { name: 'بطل جدول ٣', icon: '🏆' },
  'table-master-4': { name: 'بطل جدول ٤', icon: '🏆' },
  'table-master-5': { name: 'بطل جدول ٥', icon: '🏆' },
  'table-master-6': { name: 'بطل جدول ٦', icon: '🏆' },
  'table-master-7': { name: 'بطل جدول ٧', icon: '🏆' },
  'table-master-8': { name: 'بطل جدول ٨', icon: '🏆' },
  'table-master-9': { name: 'بطل جدول ٩', icon: '🏆' },
  'combo-5': { name: 'كومبو ٥', icon: '⚡' },
  'combo-10': { name: 'كومبو ١٠', icon: '⚡' },
  'combo-25': { name: 'كومبو ٢٥', icon: '⚡' },
  'combo-50': { name: 'كومبو ٥٠', icon: '⚡' },
  'speed-demon': { name: 'صاروخي', icon: '🚀' },
  'daily-warrior': { name: 'محارب يومي', icon: '⚔️' },
  'streak-3': { name: '٣ أيام متتالية', icon: '🔥' },
  'streak-7': { name: 'أسبوع متتالي', icon: '🔥' },
  'streak-14': { name: 'أسبوعان متتاليان', icon: '🔥' },
  'streak-30': { name: 'شهر متتالي', icon: '🔥' },
  'points-100': { name: '١٠٠ نقطة', icon: '⭐' },
  'points-500': { name: '٥٠٠ نقطة', icon: '⭐' },
  'points-1000': { name: '١٠٠٠ نقطة', icon: '💎' },
  'points-5000': { name: '٥٠٠٠ نقطة', icon: '💎' },
  'perfect-game': { name: 'لعبة مثالية', icon: '✨' },
  'explorer': { name: 'مستكشف', icon: '🧭' },
  'all-tables': { name: 'كل الجداول', icon: '👑' },
};

const TABLE_EMOJIS = ['🏝️', '🌳', '🌊', '⛰️', '🍬', '🚀', '🏰', '🎨', '👑'];

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} ساعة ${minutes} دقيقة`;
  return `${minutes} دقيقة`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ParentDashboard({ childId, onBack }: ParentDashboardProps) {
  const [data, setData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/children/${childId}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || 'فشل في تحميل البيانات');
        }
      } catch {
        setError('فشل في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [childId]);

  // Derived data
  const weakTables = useMemo(() => {
    if (!data?.child.tableProgress) return [];
    return [...data.child.tableProgress]
      .filter(p => p.masteryLevel < 0.4)
      .sort((a, b) => a.masteryLevel - b.masteryLevel);
  }, [data?.child.tableProgress]);

  const strongTables = useMemo(() => {
    if (!data?.child.tableProgress) return [];
    return [...data.child.tableProgress]
      .filter(p => p.masteryLevel >= 0.8)
      .sort((a, b) => b.masteryLevel - a.masteryLevel);
  }, [data?.child.tableProgress]);

  const recentBadges = useMemo(() => {
    if (!data?.child.badges) return [];
    return [...data.child.badges].sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()).slice(0, 6);
  }, [data?.child.badges]);

  const maxDailyQuestions = useMemo(() => {
    if (!data?.dailyActivity) return 1;
    return Math.max(...data.dailyActivity.map(d => d.totalQuestions), 1);
  }, [data?.dailyActivity]);

  // ─── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #d1fae5 50%, #e0f2fe 100%)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #d1fae5 50%, #e0f2fe 100%)' }}>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">
          😔
        </motion.div>
        <p className="text-xl font-bold text-slate-700">{error || 'لا توجد بيانات'}</p>
        <Button onClick={onBack} variant="outline">العودة</Button>
      </div>
    );
  }

  const child = data.child;

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-8"
      style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #d1fae5 50%, #e0f2fe 100%)' }}
    >
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute top-20 right-10 text-5xl opacity-15"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute top-40 left-16 text-4xl opacity-10"
        >
          🌟
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute bottom-32 right-24 text-3xl opacity-10"
        >
          🎈
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* ─── Back Button ─── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 gap-2 text-slate-600 hover:text-slate-900 hover:bg-white/50"
          >
            <ArrowRight className="w-4 h-4" />
            العودة
          </Button>
        </motion.div>

        {/* ─── Child Overview Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden relative">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 left-8 w-3 h-3 rounded-full bg-white" />
              <div className="absolute top-6 right-20 w-2 h-2 rounded-full bg-yellow-200" />
              <div className="absolute bottom-4 left-24 w-2.5 h-2.5 rounded-full bg-white" />
              <div className="absolute bottom-6 right-12 w-2 h-2 rounded-full bg-yellow-100" />
            </div>

            <CardContent className="p-5 sm:p-6 relative z-10">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-4xl sm:text-5xl shadow-lg border-3 border-white/40 shrink-0"
                  style={{ width: '5rem', height: '5rem' }}
                >
                  {AVATAR_MAP[child.avatarId] || '🧒'}
                </motion.div>

                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm">
                    {child.displayName} 👋
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      🌟 المستوى {child.level}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {child.age} سنوات
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {[
                  { emoji: '⏱️', label: 'وقت اللعب', value: formatPlayTime(child.totalPlayTime) },
                  { emoji: '🔥', label: 'الأيام المتتالية', value: `${child.streak} يوم` },
                  { emoji: '📊', label: 'الإتقان الكلي', value: `${data.overallMastery}%` },
                  { emoji: '⭐', label: 'النقاط', value: child.points.toLocaleString('ar-EG') },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.08 }}
                    className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm"
                  >
                    <div className="text-xl">{stat.emoji}</div>
                    <div className="text-base sm:text-lg font-bold text-white mt-1">{stat.value}</div>
                    <div className="text-[11px] text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Table Progress Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mt-5 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📊 تقدم الجداول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tableNum, idx) => {
                  const prog = child.tableProgress.find(p => p.tableNumber === tableNum);
                  const mastery = prog?.masteryLevel ?? 0;
                  const isWeak = weakTables.length > 0 && weakTables[0].tableNumber === tableNum;
                  const isStrong = strongTables.length > 0 && strongTables[0].tableNumber === tableNum;

                  let borderColor = 'border-slate-200';
                  let bgColor = 'bg-white';
                  let labelBg = 'bg-slate-100 text-slate-600';
                  let label = 'لم يبدأ';

                  if (mastery >= 0.8) {
                    borderColor = 'border-green-300';
                    bgColor = 'bg-green-50';
                    labelBg = 'bg-green-100 text-green-700';
                    label = 'متقن ✅';
                  } else if (mastery >= 0.4) {
                    borderColor = 'border-amber-300';
                    bgColor = 'bg-amber-50';
                    labelBg = 'bg-amber-100 text-amber-700';
                    label = 'يتعلم 📖';
                  } else if (mastery > 0) {
                    borderColor = 'border-red-300';
                    bgColor = 'bg-red-50';
                    labelBg = 'bg-red-100 text-red-700';
                    label = 'يحتاج تدريب 💪';
                  }

                  if (isWeak) {
                    borderColor = 'border-red-400';
                    bgColor = 'bg-red-50';
                  }
                  if (isStrong) {
                    borderColor = 'border-emerald-400';
                    bgColor = 'bg-emerald-50';
                  }

                  return (
                    <motion.div
                      key={tableNum}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05, type: 'spring', stiffness: 200 }}
                      whileHover={{ scale: 1.05 }}
                      className={`rounded-2xl border-2 ${borderColor} ${bgColor} p-3 sm:p-4 flex flex-col items-center gap-2 relative overflow-hidden`}
                    >
                      {/* Highlight indicators */}
                      {isWeak && (
                        <div className="absolute top-1 left-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                          الأضعف
                        </div>
                      )}
                      {isStrong && (
                        <div className="absolute top-1 left-1 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                          الأقوى
                        </div>
                      )}

                      <div className="text-2xl">{TABLE_EMOJIS[tableNum - 1]}</div>
                      <div className="text-3xl sm:text-4xl font-black text-slate-800">×{tableNum}</div>
                      <Progress
                        value={mastery * 100}
                        className="h-2.5 w-full bg-slate-200 [&>div]:transition-all [&>div]:duration-700"
                      />
                      <span className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${labelBg}`}>
                        {label}
                      </span>
                      <span className="text-sm font-bold text-slate-600">{Math.round(mastery * 100)}%</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Weekly Report ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mt-5 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📅 التقرير الأسبوعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Weekly summary stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-cyan-50 rounded-xl p-3 text-center border border-cyan-200">
                  <div className="text-2xl mb-1">📝</div>
                  <div className="text-xl font-black text-cyan-700">{data.weekTotalQuestions}</div>
                  <div className="text-[11px] text-cyan-600">سؤال هذا الأسبوع</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xl font-black text-emerald-700">{data.weekAccuracy}%</div>
                  <div className="text-[11px] text-emerald-600">دقة الإجابات</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
                  <div className="text-2xl mb-1">🎮</div>
                  <div className="text-xl font-black text-amber-700">{data.weekSessionCount}</div>
                  <div className="text-[11px] text-amber-600">جلسة لعب</div>
                </div>
              </div>

              {/* Daily activity bars */}
              <div className="flex items-end gap-2 justify-between" style={{ height: '160px' }}>
                {data.dailyActivity.map((day, idx) => {
                  const barHeight = Math.max((day.totalQuestions / maxDailyQuestions) * 100, 4);
                  const hasActivity = day.totalQuestions > 0;

                  return (
                    <motion.div
                      key={day.date}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      {hasActivity && (
                        <span className="text-[10px] font-bold text-slate-500">{day.totalQuestions}</span>
                      )}
                      <div
                        className={`w-full rounded-t-lg ${
                          hasActivity
                            ? day.accuracy >= 80
                              ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                              : day.accuracy >= 50
                              ? 'bg-gradient-to-t from-amber-500 to-yellow-400'
                              : 'bg-gradient-to-t from-red-400 to-orange-400'
                            : 'bg-slate-200'
                        }`}
                        style={{ minHeight: hasActivity ? '8px' : '4px' }}
                      />
                      <span className="text-[10px] sm:text-xs font-bold text-slate-600">{day.dayName}</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Achievements ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mt-5 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  🏅 الإنجازات
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  {child.badges.length} شارة
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {recentBadges.length === 0 ? (
                <p className="text-center text-slate-500 py-4">لم يتم الحصول على شارات بعد</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {recentBadges.map((badge, idx) => {
                      const info = BADGE_NAMES[badge.badgeType] || { name: badge.badgeType, icon: '🎖️' };
                      return (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.08, type: 'spring', stiffness: 200 }}
                        >
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-sm gap-1.5 hover:bg-emerald-100 transition-colors">
                            <span className="text-base">{info.icon}</span>
                            {info.name}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {child.badges.length > 6 && (
                <p className="text-xs text-slate-400 mt-2 text-center">
                  و {child.badges.length - 6} شارة أخرى...
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Recommendations ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mt-5 border-0 shadow-lg bg-gradient-to-l from-emerald-50 to-cyan-50 border-r-4 border-r-emerald-400 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                💡 توصيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {data.recommendations.map((rec, idx) => {
                  const isWarning = rec.includes('تمرن') || rec.includes('يحتاج') || rec.includes('صعبة');
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-xl ${
                        isWarning ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      <div className="text-xl mt-0.5 shrink-0">
                        {isWarning ? <AlertCircle className="w-5 h-5 text-amber-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <p className={`text-sm font-semibold leading-relaxed ${
                        isWarning ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {rec}
                      </p>
                    </motion.div>
                  );
                })}

                {data.recommendations.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-2">
                    لا توجد توصيات حالياً. طفلك يبذل جهداً رائعاً! 🌟
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Footer ─── */}
        <motion.p
          className="mt-6 text-center text-xs text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          © ٢٠٢٦ MultiplyHero — بطل الضرب 💚
        </motion.p>
      </div>
    </div>
  );
}
