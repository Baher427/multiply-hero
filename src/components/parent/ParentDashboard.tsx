'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight, Clock, Flame, Trophy, BookOpen, Sparkles, AlertCircle,
  CheckCircle2, TrendingUp, TrendingDown, Minus, Send, Target,
  Heart, Star, Gem, Coins, Shield, Calendar, BarChart3, Eye,
  Lightbulb, Brain, MessageSquare, Bell, Download, Settings,
  Activity, Zap, Save, Gift
} from 'lucide-react';

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
  'star-face': '⭐', 'cool-face': '😎', 'heart-face': '😍', 'party-face': '🥳', 'nerd-face': '🤓',
  apple: '🍎', strawberry: '🍓', watermelon: '🍉', banana: '🍌',
  rocket: '🚀', crown: '👑', gem: '💎', trophy: '🏆', rainbow: '🌈', balloon: '🎈',
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
  'streak-3': { name: '٣ أيام', icon: '🔥' },
  'streak-7': { name: 'أسبوع', icon: '🔥' },
  'streak-14': { name: 'أسبوعان', icon: '🔥' },
  'streak-30': { name: 'شهر', icon: '🔥' },
  'points-100': { name: '١٠٠ نقطة', icon: '⭐' },
  'points-500': { name: '٥٠٠ نقطة', icon: '⭐' },
  'points-1000': { name: '١٠٠٠ نقطة', icon: '💎' },
  'points-5000': { name: '٥٠٠٠ نقطة', icon: '💎' },
  'perfect-game': { name: 'لعبة مثالية', icon: '✨' },
  'explorer': { name: 'مستكشف', icon: '🧭' },
  'all-tables': { name: 'كل الجداول', icon: '👑' },
  'story-chapter-1': { name: 'فصل القصة', icon: '📖' },
};

const TABLE_EMOJIS = ['🏝️', '🌳', '🌊', '⛰️', '🍬', '🚀', '🏰', '🎨', '👑'];
const TABLE_NAMES = ['جزيرة الواحد', 'غابة الاثنين', 'محيط الثلاثة', 'جبل الأربعة', 'حلوى الخمسة', 'فضاء الستة', 'قلعة السبعة', 'ألوان الثمانية', 'تساعية التاج'];
const GAME_TYPE_NAMES: Record<string, string> = { 'multiple-choice': 'اختيار متعدد', 'true-false': 'صح أو خطأ', 'matching': 'توصيل', 'fill-blank': 'أكمل الفراغ' };

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} ساعة ${minutes} دقيقة`;
  return `${minutes} دقيقة`;
}

function formatDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }); }
  catch { return dateStr; }
}

function formatDateTime(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return dateStr; }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ParentDashboard({ childId, onBack }: ParentDashboardProps) {
  const [data, setData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [encouragingMessage, setEncouragingMessage] = useState('');
  const [dailyGoal, setDailyGoal] = useState(20);
  const [playTimeLimit, setPlayTimeLimit] = useState(60);
  const [allowedFrom, setAllowedFrom] = useState('08:00');
  const [allowedTo, setAllowedTo] = useState('20:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/children/${childId}`);
        const json = await res.json();
        if (json.success) setData(json.data);
        else setError(json.error || 'فشل في تحميل البيانات');
      } catch { setError('فشل في الاتصال بالخادم'); }
      finally { setLoading(false); }
    }
    if (childId) fetchData();
  }, [childId]);

  const weakTables = useMemo(() => {
    if (!data?.child.tableProgress) return [];
    return [...data.child.tableProgress].filter(p => p.masteryLevel < 0.4).sort((a, b) => a.masteryLevel - b.masteryLevel);
  }, [data?.child.tableProgress]);

  const strongTables = useMemo(() => {
    if (!data?.child.tableProgress) return [];
    return [...data.child.tableProgress].filter(p => p.masteryLevel >= 0.8).sort((a, b) => b.masteryLevel - a.masteryLevel);
  }, [data?.child.tableProgress]);

  const recentBadges = useMemo(() => {
    if (!data?.child.badges) return [];
    return [...data.child.badges].sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()).slice(0, 8);
  }, [data?.child.badges]);

  const maxDailyQuestions = useMemo(() => {
    if (!data?.dailyActivity) return 1;
    return Math.max(...data.dailyActivity.map(d => d.totalQuestions), 1);
  }, [data?.dailyActivity]);

  // ─── Learning Intelligence ───
  const learningRecommendations = useMemo(() => {
    if (!data?.child) return [];
    const recs: Array<{ text: string; type: 'focus' | 'practice' | 'celebrate' | 'schedule' }> = [];

    if (weakTables.length > 0) {
      recs.push({ text: `التركيز على جدول ${weakTables[0].tableNumber} — يحتاج تدريب مكثف (${Math.round(weakTables[0].masteryLevel * 100)}% إتقان)`, type: 'focus' });
    }
    if (weakTables.length > 2) {
      recs.push({ text: `يُنصح بتخصيص ١٠ دقائق يومياً للجداول الضعيفة (${weakTables.map(t => t.tableNumber).join('، ')})`, type: 'schedule' });
    }
    if (strongTables.length > 0) {
      recs.push({ text: `أداء ممتاز في جدول ${strongTables[0].tableNumber}! يمكن الانتقال لمستوى أصعب`, type: 'celebrate' });
    }
    if (data.child.streak === 0) {
      recs.push({ text: 'تشجيع الطفل على اللعب يومياً للحفاظ على السلسلة', type: 'practice' });
    }
    if (data.weekSessionCount < 3) {
      recs.push({ text: 'زيادة جلسات اللعب — ٣ جلسات أسبوعياً على الأقل للحصول على نتائج أفضل', type: 'schedule' });
    }
    recs.push({ text: `المستوى المناسب حالياً: ${data.overallMastery >= 70 ? 'متوسط' : 'سهل'} — بناءً على نسبة الإتقان`, type: 'practice' });

    return recs;
  }, [data, weakTables, strongTables]);

  // ─── Mastery Trend ───
  const masteryTrends = useMemo(() => {
    if (!data?.child.tableProgress) return [];
    return data.child.tableProgress.map(p => {
      const trend = p.totalAttempts < 5 ? 'new' : p.masteryLevel >= 0.7 ? 'up' : p.masteryLevel >= 0.3 ? 'stable' : 'down';
      return { tableNumber: p.tableNumber, mastery: p.masteryLevel, trend };
    });
  }, [data?.child.tableProgress]);

  // ─── Time of day analysis ───
  const timeOfDayAnalysis = useMemo(() => {
    if (!data?.child.gameSessions) return { preferred: 'غير محدد', morning: 0, afternoon: 0, evening: 0 };
    let morning = 0, afternoon = 0, evening = 0;
    for (const session of data.child.gameSessions) {
      const hour = new Date(session.completedAt).getHours();
      if (hour >= 6 && hour < 12) morning++;
      else if (hour >= 12 && hour < 18) afternoon++;
      else evening++;
    }
    const preferred = morning >= afternoon && morning >= evening ? 'الصباح 🌅' : afternoon >= evening ? 'بعد الظهر ☀️' : 'المساء 🌙';
    return { preferred, morning, afternoon, evening };
  }, [data?.child.gameSessions]);

  // ─── Progress prediction ───
  const progressPredictions = useMemo(() => {
    if (!data?.child.tableProgress) return [];
    return data.child.tableProgress.map(p => {
      const rate = p.totalAttempts > 0 ? p.masteryLevel / p.totalAttempts : 0;
      const remaining = 1 - p.masteryLevel;
      const sessionsToMastery = rate > 0 ? Math.ceil(remaining / rate) : Infinity;
      const daysEstimate = sessionsToMastery === Infinity ? 'غير محدد' : sessionsToMastery <= 7 ? `${sessionsToMastery} جلسات` : sessionsToMastery <= 30 ? `${Math.ceil(sessionsToMastery / 3)} أسابيع` : `${Math.ceil(sessionsToMastery / 10)} أشهر`;
      return { tableNumber: p.tableNumber, mastery: p.masteryLevel, prediction: daysEstimate, isMastered: p.masteryLevel >= 0.8 };
    });
  }, [data?.child.tableProgress]);

  // ─── Age group comparison ───
  const ageGroupComparison = useMemo(() => {
    if (!data?.child) return null;
    // Simulated averages for age groups (5-12)
    const avgByAge: Record<number, number> = { 5: 15, 6: 25, 7: 35, 8: 45, 9: 55, 10: 65, 11: 72, 12: 78 };
    const ageAvg = avgByAge[data.child.age] || 50;
    const childMastery = data.overallMastery;
    const comparison = childMastery >= ageAvg + 15 ? 'above' : childMastery >= ageAvg - 15 ? 'average' : 'below';
    return { childMastery, ageAvg, comparison };
  }, [data]);

  // ─── Loading ───
  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #d1fae5 50%, #e0f2fe 100%)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data || !childId) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #d1fae5 50%, #e0f2fe 100%)' }}>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">😔</motion.div>
        <p className="text-xl font-bold text-slate-700">{error || 'لا توجد بيانات — يرجى اختيار طفل أولاً'}</p>
        <Button onClick={onBack} variant="outline">العودة</Button>
      </div>
    );
  }

  const child = data.child;

  return (
    <div dir="rtl" className="min-h-screen pb-8" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #d1fae5 50%, #e0f2fe 100%)' }}>
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { emoji: '✨', top: '10%', right: '5%', delay: 0 },
          { emoji: '🌟', top: '30%', left: '10%', delay: 2 },
          { emoji: '🎈', bottom: '20%', right: '15%', delay: 4 },
        ].map((dec, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl opacity-10"
            style={{ top: dec.top, right: dec.right, left: dec.left, bottom: dec.bottom }}
            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5 + i, delay: dec.delay, ease: 'easeInOut' }}
          >
            {dec.emoji}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Button onClick={onBack} variant="ghost" className="mb-4 gap-2 text-slate-600 hover:text-slate-900 hover:bg-white/50">
            <ArrowRight className="w-4 h-4" /> العودة
          </Button>
        </motion.div>

        {/* ─── 1. Child Overview Section ─── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #059669, #0d9488, #0891b2)' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 left-8 w-3 h-3 rounded-full bg-white" />
              <div className="absolute bottom-4 right-12 w-2 h-2 rounded-full bg-white" />
            </div>
            <CardContent className="p-5 sm:p-6 relative z-10">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-5xl shadow-lg border-3 border-white/40 shrink-0"
                >
                  {AVATAR_MAP[child.avatarId] || '🧒'}
                </motion.div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm">{child.displayName} 👋</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-0">🌟 المستوى {child.level}</Badge>
                    <Badge className="bg-white/20 text-white border-0">{child.age} سنوات</Badge>
                    {child.lastActiveDate && <Badge className="bg-white/20 text-white border-0">آخر نشاط: {formatDate(child.lastActiveDate)}</Badge>}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
                {[
                  { emoji: '⏱️', label: 'وقت اللعب', value: formatPlayTime(child.totalPlayTime) },
                  { emoji: '🔥', label: 'الأيام المتتالية', value: `${child.streak} يوم` },
                  { emoji: '📊', label: 'الإتقان', value: `${data.overallMastery}%` },
                  { emoji: '⭐', label: 'النقاط', value: child.points.toLocaleString('ar-EG') },
                  { emoji: '🏆', label: 'أفضل كومبو', value: child.bestCombo },
                ].map((stat, idx) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.08 }} className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                    <div className="text-xl">{stat.emoji}</div>
                    <div className="text-base font-bold text-white mt-1">{stat.value}</div>
                    <div className="text-[11px] text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Streak flame animation */}
              {child.streak >= 3 && (
                <motion.div className="flex items-center justify-center gap-2 mt-4" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <span className="text-3xl">🔥</span>
                  <span className="text-white font-bold">سلسلة رائعة من {child.streak} أيام!</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Tabs ─── */}
        <Tabs defaultValue="progress" className="mt-6 space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm border border-white/30 p-1 h-auto flex-wrap w-full">
            {[
              { value: 'progress', label: 'التقدم الأكاديمي', icon: BookOpen },
              { value: 'timeline', label: 'سجل النشاط', icon: Calendar },
              { value: 'intelligence', label: 'ذكاء تعليمي', icon: Brain },
              { value: 'safety', label: 'سلامة وتحكم', icon: Shield },
              { value: 'communication', label: 'تواصل', icon: MessageSquare },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-600 gap-1.5 flex-1">
                <tab.icon className="w-4 h-4" /> <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── 2. Academic Progress Section ─── */}
          <TabsContent value="progress">
            {/* Overall mastery ring */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">الإتقان الكلي</h3>
                  <div className="relative w-40 h-40">
                    <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                      <motion.circle
                        cx="60" cy="60" r="50" stroke="url(#masteryGrad)" strokeWidth="10" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - data.overallMastery / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id="masteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        className="text-3xl font-black text-emerald-600"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                      >
                        {data.overallMastery}%
                      </motion.span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {data.overallMastery >= 80 ? 'مستوى متقدم 🌟' : data.overallMastery >= 50 ? 'مستوى جيد 👍' : 'يحتاج تحسين 💪'}
                  </p>
                </CardContent>
              </Card>

              {/* Weak areas */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> نقاط الضعف</CardTitle></CardHeader>
                <CardContent>
                  {weakTables.length === 0 ? (
                    <p className="text-emerald-600 text-center py-4">لا توجد نقاط ضعف! 🎉</p>
                  ) : (
                    <div className="space-y-3">
                      {weakTables.slice(0, 4).map((t) => (
                        <div key={t.tableNumber} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-100">
                          <span className="text-xl">{TABLE_EMOJIS[t.tableNumber - 1]}</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">×{t.tableNumber}</span>
                              <span className="text-red-600 text-sm font-bold">{Math.round(t.masteryLevel * 100)}%</span>
                            </div>
                            <Progress value={t.masteryLevel * 100} className="h-2 mt-1" />
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-slate-400 mt-2">💡 يُنصح بالتركيز على هذه الجداول</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Strength areas */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> نقاط القوة</CardTitle></CardHeader>
                <CardContent>
                  {strongTables.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">لم يتقن أي جدول بعد</p>
                  ) : (
                    <div className="space-y-3">
                      {strongTables.slice(0, 4).map((t) => (
                        <div key={t.tableNumber} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                          <span className="text-xl">{TABLE_EMOJIS[t.tableNumber - 1]}</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">×{t.tableNumber}</span>
                              <span className="text-emerald-600 text-sm font-bold">{Math.round(t.masteryLevel * 100)}%</span>
                            </div>
                            <Progress value={t.masteryLevel * 100} className="h-2 mt-1" />
                          </div>
                          <span className="text-lg">🎉</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Visual table mastery grid */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">📊 شبكة إتقان الجداول</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tableNum, idx) => {
                    const prog = child.tableProgress.find(p => p.tableNumber === tableNum);
                    const mastery = prog?.masteryLevel ?? 0;
                    const trend = masteryTrends.find(m => m.tableNumber === tableNum);
                    const TrendIcon = trend?.trend === 'up' ? TrendingUp : trend?.trend === 'down' ? TrendingDown : Minus;

                    let borderColor = 'border-slate-200';
                    let bgColor = 'bg-white';
                    let label = 'لم يبدأ';

                    if (mastery >= 0.8) { borderColor = 'border-green-300'; bgColor = 'bg-green-50'; label = 'متقن ✅'; }
                    else if (mastery >= 0.4) { borderColor = 'border-amber-300'; bgColor = 'bg-amber-50'; label = 'يتعلم 📖'; }
                    else if (mastery > 0) { borderColor = 'border-red-300'; bgColor = 'bg-red-50'; label = 'يحتاج تدريب 💪'; }

                    return (
                      <motion.div key={tableNum} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + idx * 0.05 }} whileHover={{ scale: 1.05 }} className={`rounded-2xl border-2 ${borderColor} ${bgColor} p-3 sm:p-4 flex flex-col items-center gap-1.5 relative`}>
                        <div className="text-xl">{TABLE_EMOJIS[tableNum - 1]}</div>
                        <div className="text-3xl font-black text-slate-800">×{tableNum}</div>
                        <Progress value={mastery * 100} className="h-2.5 w-full" />
                        <span className="text-xs font-bold text-slate-600">{Math.round(mastery * 100)}%</span>
                        <span className="text-[10px] text-slate-500">{label}</span>
                        {/* Trend indicator */}
                        {trend && trend.trend !== 'new' && (
                          <div className={`absolute top-1 left-1 rounded-full p-0.5 ${trend.trend === 'up' ? 'bg-green-100' : trend.trend === 'down' ? 'bg-red-100' : 'bg-slate-100'}`}>
                            <TrendIcon className={`w-3 h-3 ${trend.trend === 'up' ? 'text-green-600' : trend.trend === 'down' ? 'text-red-600' : 'text-slate-400'}`} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── 3. Activity Timeline ─── */}
          <TabsContent value="timeline">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Activity Heatmap */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">📅 خريطة النشاط الأسبوعي</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 justify-between" style={{ height: '160px' }}>
                    {data.dailyActivity.map((day, idx) => {
                      const barHeight = Math.max((day.totalQuestions / maxDailyQuestions) * 100, 4);
                      const hasActivity = day.totalQuestions > 0;
                      return (
                        <motion.div key={day.date} initial={{ height: 0 }} animate={{ height: `${barHeight}%` }} transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }} className="flex flex-col items-center gap-1 flex-1">
                          {hasActivity && <span className="text-[10px] font-bold text-slate-500">{day.totalQuestions}</span>}
                          <div className={`w-full rounded-t-lg ${hasActivity ? day.accuracy >= 80 ? 'bg-gradient-to-t from-emerald-500 to-teal-400' : day.accuracy >= 50 ? 'bg-gradient-to-t from-amber-500 to-yellow-400' : 'bg-gradient-to-t from-red-400 to-orange-400' : 'bg-slate-200'}`} style={{ minHeight: hasActivity ? '8px' : '4px' }} />
                          <span className="text-[10px] font-bold text-slate-600">{day.dayName}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                    <span>إجمالي الأسئلة: {data.weekTotalQuestions}</span>
                    <span>الدقة: {data.weekAccuracy}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Time of Day Analysis */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">⏰ تحليل أوقات اللعب</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">الوقت المفضل للعب: <span className="font-bold text-emerald-600">{timeOfDayAnalysis.preferred}</span></p>
                  <div className="space-y-3">
                    {[
                      { label: 'الصباح 🌅', value: timeOfDayAnalysis.morning, color: 'from-amber-400 to-yellow-300' },
                      { label: 'بعد الظهر ☀️', value: timeOfDayAnalysis.afternoon, color: 'from-orange-400 to-amber-300' },
                      { label: 'المساء 🌙', value: timeOfDayAnalysis.evening, color: 'from-purple-400 to-indigo-300' },
                    ].map((period) => {
                      const total = timeOfDayAnalysis.morning + timeOfDayAnalysis.afternoon + timeOfDayAnalysis.evening || 1;
                      const pct = Math.round((period.value / total) * 100);
                      return (
                        <div key={period.label} className="flex items-center gap-3">
                          <span className="text-sm w-28 text-slate-600">{period.label}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className={`h-full rounded-full bg-gradient-to-l ${period.color}`} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 w-12 text-left">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Session History */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm md:col-span-2">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">📋 سجل الجلسات</CardTitle></CardHeader>
                <CardContent>
                  {child.gameSessions.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">لا توجد جلسات لعب بعد</p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {child.gameSessions.slice(0, 20).map((session, idx) => {
                        const accuracy = session.correctCount + session.wrongCount > 0 ? Math.round((session.correctCount / (session.correctCount + session.wrongCount)) * 100) : 0;
                        return (
                          <motion.div key={session.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${accuracy >= 80 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}>
                                {accuracy}%
                              </div>
                              <div>
                                <p className="font-medium text-slate-700">{GAME_TYPE_NAMES[session.gameType] || session.gameType} — ×{session.tableNumber}</p>
                                <p className="text-xs text-slate-400">{formatDateTime(session.completedAt)}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-emerald-600">{session.score} نقطة</p>
                              <p className="text-xs text-slate-400">{session.correctCount}✓ {session.wrongCount}✗ · {Math.round(session.duration)}ث</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── 4. Learning Intelligence Section ─── */}
          <TabsContent value="intelligence">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Recommendations */}
              <Card className="border-0 shadow-lg bg-gradient-to-bl from-emerald-50 to-cyan-50 border-r-4 border-r-emerald-400">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> توصيات ذكية</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningRecommendations.map((rec, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className={`flex items-start gap-3 p-3 rounded-xl ${rec.type === 'focus' ? 'bg-red-50 border border-red-200' : rec.type === 'celebrate' ? 'bg-emerald-50 border border-emerald-200' : rec.type === 'schedule' ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="mt-0.5 shrink-0">{rec.type === 'focus' ? <Target className="w-5 h-5 text-red-500" /> : rec.type === 'celebrate' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : rec.type === 'schedule' ? <Calendar className="w-5 h-5 text-blue-500" /> : <Sparkles className="w-5 h-5 text-amber-500" />}</div>
                        <p className="text-sm font-semibold text-slate-700">{rec.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Progress Predictions */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">🔮 توقعات التقدم</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {progressPredictions.map((pred) => (
                      <div key={pred.tableNumber} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span>{TABLE_EMOJIS[pred.tableNumber - 1]}</span>
                          <span className="font-bold text-slate-700">×{pred.tableNumber}</span>
                        </div>
                        <div className="text-left">
                          {pred.isMastered ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">متقن ✅</Badge>
                          ) : (
                            <span className="text-xs text-slate-500">الإتقان المتوقع: {pred.prediction}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Age Group Comparison */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">📊 مقارنة مع الفئة العمرية</CardTitle></CardHeader>
                <CardContent>
                  {ageGroupComparison && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center flex-1">
                          <p className="text-3xl font-black text-emerald-600">{ageGroupComparison.childMastery}%</p>
                          <p className="text-xs text-slate-500">طفلك</p>
                        </div>
                        <div className="text-slate-300">vs</div>
                        <div className="text-center flex-1">
                          <p className="text-3xl font-black text-slate-400">{ageGroupComparison.ageAvg}%</p>
                          <p className="text-xs text-slate-500">متوسط عمر {child.age} سنوات</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl text-center" style={{ background: ageGroupComparison.comparison === 'above' ? '#ecfdf5' : ageGroupComparison.comparison === 'average' ? '#fffbeb' : '#fef2f2' }}>
                        <p className={`text-sm font-bold ${ageGroupComparison.comparison === 'above' ? 'text-emerald-700' : ageGroupComparison.comparison === 'average' ? 'text-amber-700' : 'text-red-700'}`}>
                          {ageGroupComparison.comparison === 'above' ? 'فوق المتوسط! 🌟' : ageGroupComparison.comparison === 'average' ? 'ضمن المتوسط 👍' : 'دون المتوسط — يحتاج دعم 💪'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Suggested Schedule */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">📋 جدول مقترح</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { day: 'السبت', task: `تمرين جدول ${weakTables[0]?.tableNumber || 1} — ١٠ دقائق`, done: false },
                      { day: 'الأحد', task: 'لعبة اختيار متعدد — مختلط', done: false },
                      { day: 'الإثنين', task: `تمرين جدول ${weakTables[1]?.tableNumber || 2} — ١٠ دقائق`, done: false },
                      { day: 'الثلاثاء', task: 'اختبار السرعة — ٥ دقائق', done: false },
                      { day: 'الأربعاء', task: `تحدّي جدول ${weakTables[0]?.tableNumber || 1}`, done: false },
                      { day: 'الخميس', task: 'لعبة توصيل — مختلط', done: false },
                      { day: 'الجمعة', task: 'راحة أو مراجعة حرة 🎮', done: false },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-100">
                        <div className="w-16 text-center">
                          <span className="text-sm font-bold text-emerald-600">{item.day}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-600">{item.task}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── 5. Safety & Controls Section ─── */}
          <TabsContent value="safety">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> حد وقت اللعب اليومي</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600">الحد الأقصى (بالدقائق)</Label>
                    <Input type="number" value={playTimeLimit} onChange={(e) => setPlayTimeLimit(parseInt(e.target.value) || 60)} className="border-slate-200" />
                    <p className="text-xs text-slate-400">سيتم تنبيه الطفل عند اقتراب الوقت</p>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"><Save className="w-4 h-4" /> حفظ</Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-500" /> أوقات اللعب المسموحة</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-slate-600">من</Label>
                      <Input type="time" value={allowedFrom} onChange={(e) => setAllowedFrom(e.target.value)} className="border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600">إلى</Label>
                      <Input type="time" value={allowedTo} onChange={(e) => setAllowedTo(e.target.value)} className="border-slate-200" />
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-2"><Save className="w-4 h-4" /> حفظ</Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Target className="w-5 h-5 text-purple-500" /> الهدف اليومي</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600">عدد الأسئلة اليومي</Label>
                    <Input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(parseInt(e.target.value) || 20)} className="border-slate-200" />
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"><Save className="w-4 h-4" /> حفظ</Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" /> الإشعارات</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-600">إشعارات التقدم</Label>
                    <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-600">تنبيه وقت اللعب</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-600">تقرير أسبوعي</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm md:col-span-2">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Download className="w-5 h-5 text-slate-500" /> تصدير البيانات</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 mb-3">تصدير سجل نشاط طفلك كملف JSON</p>
                  <Button variant="outline" className="gap-2" onClick={() => {
                    const exportData = { child: child.displayName, exportDate: new Date().toISOString(), sessions: child.gameSessions, progress: child.tableProgress };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `${child.displayName}-report.json`;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="w-4 h-4" /> تصدير التقرير
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── 6. Communication Section ─── */}
          <TabsContent value="communication">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Send encouraging message */}
              <Card className="border-0 shadow-lg bg-gradient-to-bl from-amber-50 to-yellow-50">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Send className="w-5 h-5 text-amber-500" /> رسالة تشجيعية</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="اكتب رسالة تشجيعية لطفلك..."
                    value={encouragingMessage}
                    onChange={(e) => setEncouragingMessage(e.target.value)}
                    className="min-h-[100px] border-amber-200 focus:border-amber-400"
                  />
                  <div className="flex flex-wrap gap-2">
                    {['أنت رائع! 🌟', 'استمر في التمرين! 💪', 'أنا فخور بك! ❤️', 'بطل الضرب! 🏆'].map((msg) => (
                      <Button key={msg} variant="outline" size="sm" onClick={() => setEncouragingMessage(msg)} className="border-amber-200 text-amber-700 hover:bg-amber-100">
                        {msg}
                      </Button>
                    ))}
                  </div>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2" onClick={() => {
                    if (encouragingMessage) {
                      try {
                        const messages = JSON.parse(localStorage.getItem(`mh_messages_${child.id}`) || '[]');
                        messages.push({ text: encouragingMessage, time: new Date().toISOString() });
                        localStorage.setItem(`mh_messages_${child.id}`, JSON.stringify(messages));
                        setEncouragingMessage('');
                      } catch { /* ignore */ }
                    }
                  }}>
                    <Heart className="w-4 h-4" /> إرسال الرسالة
                  </Button>
                </CardContent>
              </Card>

              {/* Set daily goals & rewards */}
              <Card className="border-0 shadow-lg bg-gradient-to-bl from-purple-50 to-pink-50">
                <CardHeader><CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Gift className="w-5 h-5 text-purple-500" /> أهداف ومكافآت</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600">الهدف اليومي</Label>
                    <Input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(parseInt(e.target.value) || 20)} className="border-purple-200" />
                    <p className="text-xs text-slate-400">عدد الأسئلة المطلوبة يومياً</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-slate-600">المكافأة عند تحقيق الهدف</Label>
                    <div className="flex gap-2">
                      {[
                        { label: '٢٠ عملة', value: 'coins' },
                        { label: '٥ جواهر', value: 'gems' },
                        { label: '⭐ نجمة', value: 'star' },
                      ].map((reward) => (
                        <Button key={reward.value} variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-100">
                          {reward.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badge showcase */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm md:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> عرض الشارات</CardTitle>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">{child.badges.length} شارة</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentBadges.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">لم يتم الحصول على شارات بعد</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {child.badges.map((badge, idx) => {
                        const info = BADGE_NAMES[badge.badgeType] || { name: badge.badgeType, icon: '🎖️' };
                        return (
                          <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
                            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-b from-amber-50 to-yellow-50 border border-amber-200 min-w-[80px]"
                          >
                            <span className="text-2xl">{info.icon}</span>
                            <span className="text-xs font-bold text-amber-700 text-center">{info.name}</span>
                            <span className="text-[9px] text-slate-400">{formatDate(badge.earnedAt)}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <motion.p className="mt-6 text-center text-xs text-slate-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          © ٢٠٢٦ MultiplyHero — بطل الضرب 💚
        </motion.p>
      </div>
    </div>
  );
}
