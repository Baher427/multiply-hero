'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, ArrowRight, Trash2, ChevronDown, ChevronUp, Users, Gamepad2, Award, TrendingUp } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  onBack: () => void;
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

interface TableStat {
  table: number;
  avgMastery: number;
  totalWrong: number;
  totalCorrect: number;
}

interface AdminData {
  children: ChildData[];
  totalSessions: number;
  totalBadges: number;
  tableStats: TableStat[];
  totalChildren: number;
  avgMastery: number;
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

const GAME_TYPE_NAMES: Record<string, string> = {
  'multiple-choice': 'اختيار متعدد',
  'true-false': 'صح أو خطأ',
  'matching': 'توصيل',
  'fill-blank': 'أكمل الفراغ',
};

function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return 'bg-green-500';
  if (mastery >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function getMasteryBg(mastery: number): string {
  if (mastery >= 80) return 'bg-green-50 border-green-200';
  if (mastery >= 40) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} س ${minutes} د`;
  return `${minutes} دقيقة`;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'age' | 'level' | 'points'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [deleteDialogChild, setDeleteDialogChild] = useState<ChildData | null>(null);
  const [detailChild, setDetailChild] = useState<ChildData | null>(null);

  // Fetch admin data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin');
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
  }, []);

  // Filtered and sorted children
  const filteredChildren = useMemo(() => {
    if (!data?.children) return [];
    let list = [...data.children];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.displayName.toLowerCase().includes(q));
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name, 'ar'); break;
        case 'age': cmp = a.age - b.age; break;
        case 'level': cmp = a.level - b.level; break;
        case 'points': cmp = a.points - b.points; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [data?.children, searchQuery, sortField, sortDir]);

  // Delete child
  const handleDelete = useCallback(async (childId: string) => {
    try {
      const res = await fetch(`/api/admin?childId=${childId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setData(prev => prev ? {
          ...prev,
          children: prev.children.filter(c => c.id !== childId),
          totalChildren: prev.totalChildren - 1,
        } : prev);
        setDeleteDialogChild(null);
      }
    } catch {
      // silently fail
    }
  }, []);

  const toggleSort = (field: 'name' | 'age' | 'level' | 'points') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: 'name' | 'age' | 'level' | 'points' }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />;
  };

  // ─── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-50 to-slate-100">
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
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-bl from-slate-50 to-slate-100">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">
          😔
        </motion.div>
        <p className="text-xl font-bold text-slate-700">{error || 'لا توجد بيانات'}</p>
        <Button onClick={onBack} variant="outline">العودة</Button>
      </div>
    );
  }

  // ─── Detail View ────────────────────────────────────────────────────────
  if (detailChild) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-bl from-slate-50 via-white to-emerald-50"
      >
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Back button */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button
              onClick={() => setDetailChild(null)}
              variant="ghost"
              className="mb-4 gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للقائمة
            </Button>
          </motion.div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-l from-emerald-500 to-teal-600 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-5xl shadow-lg">
                    {AVATAR_MAP[detailChild.avatarId] || '🧒'}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-black text-white">{detailChild.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className="bg-white/20 text-white border-0">{detailChild.age} سنوات</Badge>
                      <Badge className="bg-white/20 text-white border-0">المستوى {detailChild.level}</Badge>
                      <Badge className="bg-amber-400/80 text-amber-900 border-0">{detailChild.points} نقطة</Badge>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  {[
                    { label: 'النجوم', value: detailChild.stars, emoji: '🌟' },
                    { label: 'الجواهر', value: detailChild.gems, emoji: '💎' },
                    { label: 'العملات', value: detailChild.coins, emoji: '🪙' },
                    { label: 'أفضل كومبو', value: detailChild.bestCombo, emoji: '⚡' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                      <div className="text-2xl">{stat.emoji}</div>
                      <div className="text-lg font-bold text-white">{stat.value.toLocaleString('ar-EG')}</div>
                      <div className="text-xs text-white/70">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mt-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  📊 تقدم الجداول
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tableNum) => {
                    const prog = detailChild.tableProgress.find(p => p.tableNumber === tableNum);
                    const mastery = prog?.masteryLevel ?? 0;
                    return (
                      <motion.div
                        key={tableNum}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + tableNum * 0.04 }}
                        className={`rounded-xl border-2 p-3 text-center ${getMasteryBg(mastery)}`}
                      >
                        <div className="text-2xl font-black text-slate-800">×{tableNum}</div>
                        <div className="mt-2">
                          <Progress
                            value={mastery}
                            className="h-2 bg-slate-200"
                          />
                        </div>
                        <div className={`text-sm font-bold mt-1 ${mastery >= 80 ? 'text-green-600' : mastery >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Math.round(mastery)}%
                        </div>
                        {prog && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            {prog.correctAnswers}/{prog.totalAttempts} صحيح
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="mt-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  🏅 الشارات المكتسبة ({detailChild.badges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detailChild.badges.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">لم يتم الحصول على شارات بعد</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {detailChild.badges.map((badge) => {
                      const info = BADGE_NAMES[badge.badgeType] || { name: badge.badgeType, icon: '🎖️' };
                      return (
                        <Badge
                          key={badge.id}
                          className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-sm gap-1"
                        >
                          <span>{info.icon}</span>
                          {info.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="mt-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  🎮 جلسات اللعب الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detailChild.gameSessions.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">لا توجد جلسات لعب</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">النوع</TableHead>
                          <TableHead className="text-right">الجدول</TableHead>
                          <TableHead className="text-right">النتيجة</TableHead>
                          <TableHead className="text-right">الصح/الخطأ</TableHead>
                          <TableHead className="text-right">المدة</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailChild.gameSessions.slice(0, 10).map((session) => (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium">{GAME_TYPE_NAMES[session.gameType] || session.gameType}</TableCell>
                            <TableCell>×{session.tableNumber}</TableCell>
                            <TableCell className="font-bold text-emerald-600">{session.score}</TableCell>
                            <TableCell>
                              <span className="text-green-600">{session.correctCount}</span>
                              {' / '}
                              <span className="text-red-500">{session.wrongCount}</span>
                            </TableCell>
                            <TableCell>{Math.round(session.duration)}ث</TableCell>
                            <TableCell className="text-slate-500">{formatDate(session.completedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Main Dashboard View ───────────────────────────────────────────────
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-bl from-slate-50 via-white to-emerald-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
              ⚙️ لوحة تحكم المشرف
            </h1>
            <p className="text-sm text-slate-500 mt-1">إدارة ومتابعة تقدّم الأطفال</p>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowRight className="w-4 h-4" />
            العودة
          </Button>
        </motion.div>

        {/* ─── Stats Overview ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { icon: <Users className="w-6 h-6" />, label: 'إجمالي الأطفال', value: data.totalChildren, color: 'from-emerald-500 to-teal-600', emoji: '👥' },
            { icon: <Gamepad2 className="w-6 h-6" />, label: 'جلسات اللعب', value: data.totalSessions, color: 'from-cyan-500 to-teal-500', emoji: '🎮' },
            { icon: <Award className="w-6 h-6" />, label: 'الشارات المكتسبة', value: data.totalBadges, color: 'from-amber-500 to-orange-500', emoji: '🏅' },
            { icon: <TrendingUp className="w-6 h-6" />, label: 'متوسط الإتقان', value: `${data.avgMastery}%`, color: 'from-rose-400 to-pink-500', emoji: '📈' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 200 }}
            >
              <Card className={`border-0 shadow-lg bg-gradient-to-l ${stat.color} overflow-hidden relative`}>
                {/* Decorative circles */}
                <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-white/10" />
                <CardContent className="p-4 sm:p-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-xs sm:text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString('ar-EG') : stat.value}
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl opacity-80">{stat.emoji}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Table Difficulty Chart ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📊 صعوبة الجداول (متوسط الإتقان)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 sm:gap-3 justify-center" style={{ height: '200px' }}>
                {data.tableStats.map((ts, idx) => {
                  const isMostDifficult = idx >= 7;
                  const barHeight = Math.max(ts.avgMastery, 5);
                  return (
                    <motion.div
                      key={ts.table}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ delay: 0.4 + idx * 0.08, duration: 0.6, ease: 'easeOut' }}
                      className="flex flex-col items-center gap-1 flex-1 max-w-[60px]"
                    >
                      <span className={`text-xs font-bold ${isMostDifficult ? 'text-red-500' : 'text-slate-600'}`}>
                        {ts.avgMastery}%
                      </span>
                      <div
                        className={`w-full rounded-t-lg transition-colors ${
                          isMostDifficult
                            ? 'bg-gradient-to-t from-red-500 to-rose-400'
                            : ts.avgMastery >= 70
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                            : ts.avgMastery >= 40
                            ? 'bg-gradient-to-t from-amber-500 to-yellow-400'
                            : 'bg-gradient-to-t from-orange-500 to-amber-400'
                        }`}
                        style={{ minHeight: '8px' }}
                      />
                      <span className={`text-xs font-bold ${isMostDifficult ? 'text-red-600' : 'text-slate-700'}`}>
                        ×{ts.table}
                      </span>
                      {isMostDifficult && (
                        <span className="text-[10px] text-red-500">⚠️</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> متقن (٧٠٪+)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> متوسط</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> صعب ⚠️</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Children Management Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  👥 إدارة الأطفال ({filteredChildren.length})
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="بحث بالاسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 border-slate-200 focus:border-emerald-400"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredChildren.length === 0 ? (
                <p className="text-center text-slate-500 py-8">لا يوجد أطفال مطابقون للبحث</p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('name')}>
                          الاسم <SortIcon field="name" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('age')}>
                          العمر <SortIcon field="age" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('level')}>
                          المستوى <SortIcon field="level" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('points')}>
                          النقاط <SortIcon field="points" />
                        </TableHead>
                        <TableHead className="text-right">آخر نشاط</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredChildren.map((child, idx) => (
                          <motion.tr
                            key={child.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: idx * 0.03 }}
                            className="hover:bg-emerald-50/50 border-b border-slate-100 transition-colors cursor-pointer"
                            onClick={() => setExpandedChildId(expandedChildId === child.id ? null : child.id)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{AVATAR_MAP[child.avatarId] || '🧒'}</span>
                                <span className="font-bold text-slate-800">{child.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{child.age} سنوات</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                                {child.level}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-bold text-amber-600">{child.points.toLocaleString('ar-EG')}</TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {child.lastActiveDate ? formatDate(child.lastActiveDate) : '—'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                  onClick={() => setDetailChild(child)}
                                >
                                  التفاصيل
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setDeleteDialogChild(child)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Delete Confirmation Dialog ─── */}
      <AlertDialog open={!!deleteDialogChild} onOpenChange={(open) => !open && setDeleteDialogChild(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الطفل <strong>{deleteDialogChild?.name}</strong>؟
              سيتم حذف جميع بياناته بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="ml-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogChild && handleDelete(deleteDialogChild.id)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
