'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Search, ArrowRight, Trash2, ChevronDown, ChevronUp, Users, Gamepad2,
  Award, TrendingUp, Edit3, RotateCcw, Download, Shield, Lock,
  ArrowUpRight, ArrowDownRight, Activity, Clock, Zap, Star,
  Coins, Gem, BarChart3, Eye, X,
} from 'lucide-react';

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

interface ActivityItem {
  id: string;
  childId: string;
  childName: string;
  childDisplayName: string;
  childAvatarId: string;
  gameType: string;
  tableNumber: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  duration: number;
  completedAt: string;
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

const ADMIN_PIN = '1234';

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

const GAME_TYPE_ICONS: Record<string, string> = {
  'multiple-choice': '🎯',
  'true-false': '✅',
  'matching': '🔗',
  'fill-blank': '✏️',
};

function getMasteryColor(mastery: number): string {
  if (mastery >= 0.8) return 'bg-green-500';
  if (mastery >= 0.4) return 'bg-amber-500';
  return 'bg-red-500';
}

function getMasteryBg(mastery: number): string {
  if (mastery >= 0.8) return 'bg-green-50 border-green-200';
  if (mastery >= 0.4) return 'bg-amber-50 border-amber-200';
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

function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function getTimeAgo(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHr < 24) return `منذ ${diffHr} ساعة`;
    return `منذ ${diffDay} يوم`;
  } catch {
    return '';
  }
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} س ${minutes} د`;
  return `${minutes} دقيقة`;
}

// ─── Admin PIN Gate ─────────────────────────────────────────────────────────

function AdminPinGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      onAuthenticated();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => { setError(false); setPin(''); }, 1500);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-[340px] border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">لوحة تحكم المشرف</h2>
              <p className="text-sm text-white/60 mb-6">أدخل رمز PIN للدخول</p>

              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={pin.length > i ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.2 }}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      pin.length > i
                        ? 'bg-emerald-400 border-emerald-400 shadow-md shadow-emerald-400/50'
                        : 'bg-transparent border-white/30'
                    } ${error ? 'border-red-400 bg-red-400' : ''}`}
                  />
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mb-4"
                >
                  رمز PIN غير صحيح
                </motion.p>
              )}

              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(val);
                  setError(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="text-center text-2xl tracking-[1em] bg-white/10 border-white/20 text-white placeholder:text-white/30 mb-4 h-14"
                placeholder="••••"
                autoFocus
              />

              <div className="grid grid-cols-3 gap-2">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key) => (
                  <Button
                    key={key || 'empty'}
                    variant="ghost"
                    disabled={key === ''}
                    onClick={() => {
                      if (key === '⌫') {
                        setPin(p => p.slice(0, -1));
                      } else if (key && pin.length < 4) {
                        const newPin = pin + key;
                        setPin(newPin);
                        if (newPin.length === 4) {
                          setTimeout(() => {
                            if (newPin === ADMIN_PIN) {
                              onAuthenticated();
                            } else {
                              setError(true);
                              setShake(true);
                              setTimeout(() => setShake(false), 500);
                              setTimeout(() => { setError(false); setPin(''); }, 1500);
                            }
                          }, 150);
                        }
                      }
                    }}
                    className={`h-14 text-xl font-bold ${
                      key === '⌫'
                        ? 'text-red-300 hover:bg-red-500/20'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {key === '⌫' ? '⌫' : key}
                  </Button>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'age' | 'level' | 'points'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [deleteDialogChild, setDeleteDialogChild] = useState<ChildData | null>(null);
  const [detailChild, setDetailChild] = useState<ChildData | null>(null);

  // Edit dialog state
  const [editChild, setEditChild] = useState<ChildData | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', age: 0, points: 0, level: 1, stars: 0, coins: 0, gems: 0 });
  const [editSaving, setEditSaving] = useState(false);

  // Reset progress state
  const [resetDialogChild, setResetDialogChild] = useState<ChildData | null>(null);
  const [resetting, setResetting] = useState(false);

  // Bulk actions state
  const [bulkResetDialog, setBulkResetDialog] = useState(false);
  const [bulkResetting, setBulkResetting] = useState(false);

  // Activity log state
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch admin data
  const fetchData = useCallback(async () => {
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
  }, []);

  // Fetch activity log
  const fetchActivity = useCallback(async () => {
    try {
      setActivityLoading(true);
      const res = await fetch('/api/admin/activity');
      const json = await res.json();
      if (json.success) {
        setActivityLog(json.data);
      }
    } catch {
      // silently fail
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchActivity();
    }
  }, [isAuthenticated, fetchData, fetchActivity]);

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

  // Compute trend indicators for stats
  const statTrends = useMemo(() => {
    if (!data?.children) return { childrenTrend: 0, sessionsTrend: 0, masteryTrend: 0, badgesTrend: 0 };
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let thisWeekSessions = 0;
    let lastWeekSessions = 0;
    let thisWeekBadges = 0;
    let lastWeekBadges = 0;

    for (const child of data.children) {
      for (const session of child.gameSessions) {
        const sessionDate = new Date(session.completedAt);
        if (sessionDate >= weekAgo) thisWeekSessions++;
        else if (sessionDate >= twoWeeksAgo) lastWeekSessions++;
      }
      for (const badge of child.badges) {
        const badgeDate = new Date(badge.earnedAt);
        if (badgeDate >= weekAgo) thisWeekBadges++;
        else if (badgeDate >= twoWeeksAgo) lastWeekBadges++;
      }
    }

    const sessionsTrend = lastWeekSessions > 0 ? Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100) : (thisWeekSessions > 0 ? 100 : 0);
    const badgesTrend = lastWeekBadges > 0 ? Math.round(((thisWeekBadges - lastWeekBadges) / lastWeekBadges) * 100) : (thisWeekBadges > 0 ? 100 : 0);

    // Children trend (new children this week)
    const newChildrenThisWeek = data.children.filter(c => new Date(c.createdAt) >= weekAgo).length;

    return {
      childrenTrend: newChildrenThisWeek,
      sessionsTrend,
      masteryTrend: data.avgMastery >= 50 ? 1 : -1,
      badgesTrend,
    };
  }, [data]);

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
        showToast('تم حذف الطفل بنجاح');
      }
    } catch {
      showToast('فشل في حذف الطفل', 'error');
    }
  }, [showToast]);

  // Edit child save
  const handleEditSave = useCallback(async () => {
    if (!editChild) return;
    try {
      setEditSaving(true);
      const res = await fetch(`/api/children/${editChild.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editForm.displayName,
          age: editForm.age,
          points: editForm.points,
          level: editForm.level,
          stars: editForm.stars,
          coins: editForm.coins,
          gems: editForm.gems,
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Update local data
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            children: prev.children.map(c =>
              c.id === editChild.id
                ? { ...c, displayName: editForm.displayName, age: editForm.age, points: editForm.points, level: editForm.level, stars: editForm.stars, coins: editForm.coins, gems: editForm.gems }
                : c
            ),
          };
        });
        // Also update detailChild if viewing this child
        setDetailChild(prev => prev && prev.id === editChild.id
          ? { ...prev, displayName: editForm.displayName, age: editForm.age, points: editForm.points, level: editForm.level, stars: editForm.stars, coins: editForm.coins, gems: editForm.gems }
          : prev
        );
        setEditChild(null);
        showToast('تم تحديث بيانات الطفل بنجاح');
      } else {
        showToast('فشل في تحديث البيانات', 'error');
      }
    } catch {
      showToast('فشل في الاتصال بالخادم', 'error');
    } finally {
      setEditSaving(false);
    }
  }, [editChild, editForm, showToast]);

  // Reset child progress
  const handleResetProgress = useCallback(async (childId: string) => {
    try {
      setResetting(true);
      const res = await fetch(`/api/progress?childId=${childId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            children: prev.children.map(c =>
              c.id === childId
                ? { ...c, points: 0, level: 1, stars: 0, coins: 0, gems: 0, streak: 0, bestCombo: 0, totalPlayTime: 0, comboCount: 0, tableProgress: c.tableProgress.map(tp => ({ ...tp, masteryLevel: 0, correctAnswers: 0, wrongAnswers: 0, totalAttempts: 0, avgSpeed: 0 })) }
                : c
            ),
          };
        });
        setDetailChild(prev => prev && prev.id === childId
          ? { ...prev, points: 0, level: 1, stars: 0, coins: 0, gems: 0, streak: 0, bestCombo: 0, totalPlayTime: 0, comboCount: 0, tableProgress: prev.tableProgress.map(tp => ({ ...tp, masteryLevel: 0, correctAnswers: 0, wrongAnswers: 0, totalAttempts: 0, avgSpeed: 0 })) }
          : prev
        );
        setResetDialogChild(null);
        showToast('تم إعادة تعيين التقدم بنجاح');
      }
    } catch {
      showToast('فشل في إعادة تعيين التقدم', 'error');
    } finally {
      setResetting(false);
    }
  }, [showToast]);

  // Bulk reset all children
  const handleBulkReset = useCallback(async () => {
    if (!data?.children) return;
    try {
      setBulkResetting(true);
      await Promise.all(
        data.children.map(c => fetch(`/api/progress?childId=${c.id}`, { method: 'DELETE' }))
      );
      // Refresh data
      await fetchData();
      setBulkResetDialog(false);
      showToast('تم إعادة تعيين تقدم جميع الأطفال');
    } catch {
      showToast('فشل في إعادة تعيين التقدم', 'error');
    } finally {
      setBulkResetting(false);
    }
  }, [data?.children, fetchData, showToast]);

  // Export data as JSON
  const handleExport = useCallback(() => {
    if (!data) return;
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalChildren: data.totalChildren,
        totalSessions: data.totalSessions,
        totalBadges: data.totalBadges,
        avgMastery: data.avgMastery,
      },
      tableStats: data.tableStats,
      children: data.children.map(c => ({
        id: c.id,
        name: c.name,
        displayName: c.displayName,
        age: c.age,
        avatarId: c.avatarId,
        points: c.points,
        level: c.level,
        stars: c.stars,
        coins: c.coins,
        gems: c.gems,
        streak: c.streak,
        lastActiveDate: c.lastActiveDate,
        totalPlayTime: c.totalPlayTime,
        bestCombo: c.bestCombo,
        createdAt: c.createdAt,
        tableProgress: c.tableProgress,
        badges: c.badges,
        recentSessions: c.gameSessions.slice(0, 10),
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multiply-hero-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تصدير البيانات بنجاح');
  }, [data, showToast]);

  // Open edit dialog
  const openEditDialog = useCallback((child: ChildData) => {
    setEditChild(child);
    setEditForm({
      displayName: child.displayName,
      age: child.age,
      points: child.points,
      level: child.level,
      stars: child.stars,
      coins: child.coins,
      gems: child.gems,
    });
  }, []);

  // ─── PIN Gate ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <AdminPinGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

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
          {/* Back button + actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setDetailChild(null)}
              variant="ghost"
              className="gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للقائمة
            </Button>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => openEditDialog(detailChild)}
                variant="outline"
                className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Edit3 className="w-4 h-4" />
                تعديل البيانات
              </Button>
              <Button
                onClick={() => setResetDialogChild(detailChild)}
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4" />
                إعادة تعيين التقدم
              </Button>
            </div>
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
                    <p className="text-white/70 text-sm">{detailChild.displayName !== detailChild.name ? detailChild.displayName : ''}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className="bg-white/20 text-white border-0">{detailChild.age} سنوات</Badge>
                      <Badge className="bg-white/20 text-white border-0">المستوى {detailChild.level}</Badge>
                      <Badge className="bg-amber-400/80 text-amber-900 border-0">{detailChild.points} نقطة</Badge>
                      {detailChild.streak > 0 && (
                        <Badge className="bg-orange-400/80 text-orange-900 border-0">🔥 {detailChild.streak} يوم</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
                  {[
                    { label: 'النجوم', value: detailChild.stars, emoji: '🌟' },
                    { label: 'الجواهر', value: detailChild.gems, emoji: '💎' },
                    { label: 'العملات', value: detailChild.coins, emoji: '🪙' },
                    { label: 'أفضل كومبو', value: detailChild.bestCombo, emoji: '⚡' },
                    { label: 'وقت اللعب', value: formatPlayTime(detailChild.totalPlayTime), emoji: '⏱️' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                      <div className="text-2xl">{stat.emoji}</div>
                      <div className="text-lg font-bold text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString('ar-EG') : stat.value}</div>
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
                            value={mastery * 100}
                            className="h-2 bg-slate-200"
                          />
                        </div>
                        <div className={`text-sm font-bold mt-1 ${mastery >= 0.8 ? 'text-green-600' : mastery >= 0.4 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Math.round(mastery * 100)}%
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

        {/* ─── Edit Child Dialog ─── */}
        <Dialog open={!!editChild} onOpenChange={(open) => !open && setEditChild(null)}>
          <DialogContent dir="rtl" className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                تعديل بيانات الطفل
              </DialogTitle>
              <DialogDescription>
                تعديل الاسم والعمر والنقاط والمستوى والنجوم والعملات والجواهر
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-displayName">الاسم المعروض</Label>
                <Input
                  id="edit-displayName"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                  className="border-slate-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-age">العمر</Label>
                <Input
                  id="edit-age"
                  type="number"
                  min={3}
                  max={15}
                  value={editForm.age}
                  onChange={(e) => setEditForm(f => ({ ...f, age: parseInt(e.target.value) || 0 }))}
                  className="border-slate-200 focus:border-emerald-400"
                />
              </div>
              <Separator />
              <p className="text-sm font-semibold text-slate-600">المكافآت والتقدم</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-points" className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> النقاط
                  </Label>
                  <Input
                    id="edit-points"
                    type="number"
                    min={0}
                    value={editForm.points}
                    onChange={(e) => setEditForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))}
                    className="border-slate-200 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level" className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> المستوى
                  </Label>
                  <Input
                    id="edit-level"
                    type="number"
                    min={1}
                    max={13}
                    value={editForm.level}
                    onChange={(e) => setEditForm(f => ({ ...f, level: parseInt(e.target.value) || 1 }))}
                    className="border-slate-200 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stars" className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" /> النجوم
                  </Label>
                  <Input
                    id="edit-stars"
                    type="number"
                    min={0}
                    value={editForm.stars}
                    onChange={(e) => setEditForm(f => ({ ...f, stars: parseInt(e.target.value) || 0 }))}
                    className="border-slate-200 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-coins" className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-600" /> العملات
                  </Label>
                  <Input
                    id="edit-coins"
                    type="number"
                    min={0}
                    value={editForm.coins}
                    onChange={(e) => setEditForm(f => ({ ...f, coins: parseInt(e.target.value) || 0 }))}
                    className="border-slate-200 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-gems" className="flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5 text-purple-500" /> الجواهر
                  </Label>
                  <Input
                    id="edit-gems"
                    type="number"
                    min={0}
                    value={editForm.gems}
                    onChange={(e) => setEditForm(f => ({ ...f, gems: parseInt(e.target.value) || 0 }))}
                    className="border-slate-200 focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row gap-2 sm:justify-start">
              <Button
                onClick={() => setEditChild(null)}
                variant="outline"
                className="ml-0"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={editSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {editSaving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
                {editSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Reset Progress Dialog ─── */}
        <AlertDialog open={!!resetDialogChild} onOpenChange={(open) => !open && setResetDialogChild(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                ⚠️ إعادة تعيين التقدم
              </AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من إعادة تعيين تقدم الطفل <strong>{resetDialogChild?.name}</strong>؟
                سيتم تصفير جميع الجداول والنقاط والمستوى والنجوم والعملات والجواهر. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-2">
              <AlertDialogCancel className="ml-0" disabled={resetting}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => resetDialogChild && handleResetProgress(resetDialogChild.id)}
                disabled={resetting}
                className="bg-red-500 hover:bg-red-600 text-white gap-2"
              >
                {resetting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {resetting ? 'جاري التعيين...' : 'إعادة تعيين'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
              <Shield className="w-7 h-7 text-emerald-600" />
              لوحة تحكم المشرف
            </h1>
            <p className="text-sm text-slate-500 mt-1">إدارة ومتابعة تقدّم الأطفال</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تصدير</span>
            </Button>
            <Button
              onClick={() => setBulkResetDialog(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">تعيين الكل</span>
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <ArrowRight className="w-4 h-4" />
              العودة
            </Button>
          </div>
        </motion.div>

        {/* ─── Enhanced Stats Overview ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            {
              icon: <Users className="w-6 h-6" />,
              label: 'إجمالي الأطفال',
              value: data.totalChildren,
              color: 'from-emerald-500 to-teal-600',
              emoji: '👥',
              trend: statTrends.childrenTrend,
              trendLabel: 'جديد هذا الأسبوع',
              trendType: 'neutral' as const,
            },
            {
              icon: <Gamepad2 className="w-6 h-6" />,
              label: 'جلسات اللعب',
              value: data.totalSessions,
              color: 'from-cyan-500 to-teal-500',
              emoji: '🎮',
              trend: statTrends.sessionsTrend,
              trendLabel: 'مقارنة بالأسبوع الماضي',
              trendType: statTrends.sessionsTrend >= 0 ? ('up' as const) : ('down' as const),
            },
            {
              icon: <Award className="w-6 h-6" />,
              label: 'الشارات المكتسبة',
              value: data.totalBadges,
              color: 'from-amber-500 to-orange-500',
              emoji: '🏅',
              trend: statTrends.badgesTrend,
              trendLabel: 'مقارنة بالأسبوع الماضي',
              trendType: statTrends.badgesTrend >= 0 ? ('up' as const) : ('down' as const),
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              label: 'متوسط الإتقان',
              value: `${data.avgMastery}%`,
              color: 'from-rose-400 to-pink-500',
              emoji: '📈',
              trend: statTrends.masteryTrend,
              trendLabel: 'اتجاه عام',
              trendType: statTrends.masteryTrend >= 0 ? ('up' as const) : ('down' as const),
            },
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
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/5" />
                <CardContent className="p-4 sm:p-5 relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-xs sm:text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString('ar-EG') : stat.value}
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl opacity-80">{stat.emoji}</div>
                  </div>
                  {/* Trend indicator */}
                  <div className="mt-3 flex items-center gap-1.5">
                    {stat.trendType === 'up' && (
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                        <ArrowUpRight className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">
                          {typeof stat.trend === 'number' && stat.trend !== 0 ? `${Math.abs(stat.trend)}%` : ''}
                        </span>
                      </div>
                    )}
                    {stat.trendType === 'down' && (
                      <div className="flex items-center gap-1 bg-red-500/30 rounded-full px-2 py-0.5">
                        <ArrowDownRight className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">
                          {typeof stat.trend === 'number' && stat.trend !== 0 ? `${Math.abs(stat.trend)}%` : ''}
                        </span>
                      </div>
                    )}
                    {stat.trendType === 'neutral' && typeof stat.trend === 'number' && stat.trend > 0 && (
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                        <span className="text-xs text-white font-medium">+{stat.trend}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-white/60">{stat.trendLabel}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Enhanced Table Difficulty Chart ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                صعوبة الجداول (متوسط الإتقان)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-end gap-3 sm:gap-4 justify-center" style={{ height: '220px' }}>
                {data.tableStats.map((ts, idx) => {
                  const isMostDifficult = idx >= 7;
                  const barHeight = Math.max(ts.avgMastery, 5);
                  const gradientClass = isMostDifficult
                    ? 'from-red-600 via-rose-500 to-orange-400'
                    : ts.avgMastery >= 70
                    ? 'from-emerald-600 via-teal-500 to-cyan-400'
                    : ts.avgMastery >= 40
                    ? 'from-amber-500 via-yellow-400 to-amber-300'
                    : 'from-orange-500 via-amber-400 to-yellow-300';

                  return (
                    <motion.div
                      key={ts.table}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${barHeight}%`, opacity: 1 }}
                      transition={{ delay: 0.4 + idx * 0.08, duration: 0.8, ease: 'easeOut' }}
                      className="flex flex-col items-center gap-1.5 flex-1 max-w-[60px] group"
                    >
                      <span className={`text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity ${
                        isMostDifficult ? 'text-red-500' : ts.avgMastery >= 70 ? 'text-emerald-600' : 'text-slate-600'
                      }`}>
                        {ts.avgMastery}%
                      </span>
                      <div
                        className={`w-full rounded-t-xl bg-gradient-to-t ${gradientClass} shadow-md relative overflow-hidden transition-transform group-hover:scale-105`}
                        style={{ minHeight: '8px' }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {/* Reflection glow */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>
                      <span className={`text-xs font-black ${
                        isMostDifficult ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        ×{ts.table}
                      </span>
                      {isMostDifficult && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-[10px]"
                        >
                          ⚠️
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              {/* Enhanced Legend */}
              <div className="flex justify-center gap-4 mt-5">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded bg-gradient-to-t from-emerald-600 to-cyan-400 inline-block shadow-sm" />
                  متقن (٧٠٪+)
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded bg-gradient-to-t from-amber-500 to-amber-300 inline-block shadow-sm" />
                  متوسط
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded bg-gradient-to-t from-red-600 to-orange-400 inline-block shadow-sm" />
                  صعب ⚠️
                </span>
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
                                <div>
                                  <span className="font-bold text-slate-800">{child.name}</span>
                                  {child.displayName !== child.name && (
                                    <p className="text-xs text-slate-400">{child.displayName}</p>
                                  )}
                                </div>
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
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                  onClick={() => openEditDialog(child)}
                                >
                                  <Edit3 className="w-4 h-4" />
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

        {/* ─── Activity Log ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  سجل النشاط الأخير
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchActivity}
                  className="text-slate-500 hover:text-emerald-600"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {activityLoading && activityLog.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : activityLog.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-slate-500">لا يوجد نشاط حتى الآن</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-1">
                  {activityLog.map((item, idx) => {
                    const accuracy = (item.correctCount + item.wrongCount) > 0
                      ? Math.round((item.correctCount / (item.correctCount + item.wrongCount)) * 100)
                      : 0;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            accuracy >= 80 ? 'bg-emerald-400' : accuracy >= 50 ? 'bg-amber-400' : 'bg-red-400'
                          }`} />
                          {idx < activityLog.length - 1 && <div className="w-0.5 h-8 bg-slate-200 mt-1" />}
                        </div>

                        {/* Game icon */}
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0">
                          {GAME_TYPE_ICONS[item.gameType] || '🎮'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800 truncate">
                              {AVATAR_MAP[item.childAvatarId] || '🧒'} {item.childName}
                            </span>
                            <span className="text-xs text-slate-400">
                              {GAME_TYPE_NAMES[item.gameType] || item.gameType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>جدول ×{item.tableNumber}</span>
                            <span className="text-emerald-600 font-semibold">+{item.score}</span>
                            <span className={accuracy >= 80 ? 'text-green-600' : accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}>
                              {accuracy}% دقة
                            </span>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(item.completedAt)}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* ─── Bulk Reset All Progress Dialog ─── */}
      <AlertDialog open={bulkResetDialog} onOpenChange={(open) => !open && setBulkResetDialog(false)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ إعادة تعيين تقدم جميع الأطفال
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إعادة تعيين تقدم <strong>جميع الأطفال ({data?.totalChildren})</strong>؟
              سيتم تصفير جميع الجداول والنقاط والمستويات والنجوم والعملات والجواهر لكل الأطفال.
              <br />
              <strong className="text-red-600">هذا الإجراء لا يمكن التراجع عنه!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="ml-0" disabled={bulkResetting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkReset}
              disabled={bulkResetting}
              className="bg-red-500 hover:bg-red-600 text-white gap-2"
            >
              {bulkResetting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              {bulkResetting ? 'جاري التعيين...' : 'إعادة تعيين الكل'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Edit Child Dialog (for main table) ─── */}
      <Dialog open={!!editChild} onOpenChange={(open) => !open && setEditChild(null)}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              تعديل بيانات الطفل
            </DialogTitle>
            <DialogDescription>
              تعديل الاسم والعمر والنقاط والمستوى والنجوم والعملات والجواهر
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-displayName-main">الاسم المعروض</Label>
              <Input
                id="edit-displayName-main"
                value={editForm.displayName}
                onChange={(e) => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                className="border-slate-200 focus:border-emerald-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-age-main">العمر</Label>
              <Input
                id="edit-age-main"
                type="number"
                min={3}
                max={15}
                value={editForm.age}
                onChange={(e) => setEditForm(f => ({ ...f, age: parseInt(e.target.value) || 0 }))}
                className="border-slate-200 focus:border-emerald-400"
              />
            </div>
            <Separator />
            <p className="text-sm font-semibold text-slate-600">المكافآت والتقدم</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-points-main" className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> النقاط
                </Label>
                <Input
                  id="edit-points-main"
                  type="number"
                  min={0}
                  value={editForm.points}
                  onChange={(e) => setEditForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))}
                  className="border-slate-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level-main" className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> المستوى
                </Label>
                <Input
                  id="edit-level-main"
                  type="number"
                  min={1}
                  max={13}
                  value={editForm.level}
                  onChange={(e) => setEditForm(f => ({ ...f, level: parseInt(e.target.value) || 1 }))}
                  className="border-slate-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stars-main" className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500" /> النجوم
                </Label>
                <Input
                  id="edit-stars-main"
                  type="number"
                  min={0}
                  value={editForm.stars}
                  onChange={(e) => setEditForm(f => ({ ...f, stars: parseInt(e.target.value) || 0 }))}
                  className="border-slate-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-coins-main" className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-600" /> العملات
                </Label>
                <Input
                  id="edit-coins-main"
                  type="number"
                  min={0}
                  value={editForm.coins}
                  onChange={(e) => setEditForm(f => ({ ...f, coins: parseInt(e.target.value) || 0 }))}
                  className="border-slate-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-gems-main" className="flex items-center gap-1">
                  <Gem className="w-3.5 h-3.5 text-purple-500" /> الجواهر
                </Label>
                <Input
                  id="edit-gems-main"
                  type="number"
                  min={0}
                  value={editForm.gems}
                  onChange={(e) => setEditForm(f => ({ ...f, gems: parseInt(e.target.value) || 0 }))}
                  className="border-slate-200 focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-start">
            <Button
              onClick={() => setEditChild(null)}
              variant="outline"
              className="ml-0"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={editSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {editSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
              {editSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
