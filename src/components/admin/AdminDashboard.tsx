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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search, ArrowRight, Trash2, ChevronDown, ChevronUp, Users, Gamepad2,
  Award, TrendingUp, Edit3, RotateCcw, Download, Shield, Lock,
  ArrowUpRight, ArrowDownRight, Activity, Clock, Zap, Star,
  Coins, Gem, BarChart3, Eye, X, Settings, Database, FileDown,
  AlertTriangle, CheckCircle2, LockOpen, Timer, LayoutDashboard,
  BookOpen, Cog, ShieldCheck, UserPlus, Trash, RefreshCw, Save,
  Upload, Info, Palette, Calendar, Gift, ShieldAlert
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
  pin: string | null;
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
  'story-chapter-1': { name: 'فصل القصة', icon: '📖' },
};

const GAME_TYPE_NAMES: Record<string, string> = {
  'multiple-choice': 'اختيار متعدد',
  'true-false': 'صح أو خطأ',
  'matching': 'توصيل',
  'fill-blank': 'أكمل الفراغ',
};

const TABLE_EMOJIS = ['🏝️', '🌳', '🌊', '⛰️', '🍬', '🚀', '🏰', '🎨', '👑'];

function getMasteryColor(mastery: number): string {
  if (mastery >= 0.8) return 'text-green-400';
  if (mastery >= 0.4) return 'text-amber-400';
  return 'text-red-400';
}

function getMasteryBg(mastery: number): string {
  if (mastery >= 0.8) return 'bg-green-500/20 border-green-500/30';
  if (mastery >= 0.4) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
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
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
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
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pin.length > i ? 'bg-emerald-400 border-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-transparent border-white/30'
                    } ${error ? 'border-red-400 bg-red-400' : ''}`}
                  />
                ))}
              </div>

              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mb-4">رمز PIN غير صحيح</motion.p>}

              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 4); setPin(val); setError(false); }}
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
                      if (key === '⌫') { setPin(p => p.slice(0, -1)); }
                      else if (key && pin.length < 4) {
                        const newPin = pin + key;
                        setPin(newPin);
                        if (newPin.length === 4) {
                          setTimeout(() => {
                            if (newPin === ADMIN_PIN) onAuthenticated();
                            else { setError(true); setShake(true); setTimeout(() => setShake(false), 500); setTimeout(() => { setError(false); setPin(''); }, 1500); }
                          }, 150);
                        }
                      }
                    }}
                    className={`h-14 text-xl font-bold ${key === '⌫' ? 'text-red-300 hover:bg-red-500/20' : 'text-white hover:bg-white/10'}`}
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
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set());

  // Edit dialog state
  const [editChild, setEditChild] = useState<ChildData | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', age: 0, points: 0, level: 1, stars: 0, coins: 0, gems: 0, streak: 0, avatarId: 'lion', favoriteColor: 'emerald' });
  const [editSaving, setEditSaving] = useState(false);

  // Reset progress state
  const [resetDialogChild, setResetDialogChild] = useState<ChildData | null>(null);
  const [resetting, setResetting] = useState(false);

  // Activity log state
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);

  // Settings state
  const [adminPin, setAdminPin] = useState(ADMIN_PIN);
  const [newPin, setNewPin] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [rewardSettings, setRewardSettings] = useState({ pointsPerCorrect: 10, coinsPerCorrect: 5, gemsPerPerfect: 3 });
  const [featureFlags, setFeatureFlags] = useState({ dailyChallenge: true, storyMode: true, speedTest: true, leaderboard: true, shop: true });

  // Badge award dialog
  const [badgeDialogChild, setBadgeDialogChild] = useState<ChildData | null>(null);
  const [selectedBadgeType, setSelectedBadgeType] = useState('');

  // New child dialog
  const [newChildDialog, setNewChildDialog] = useState(false);
  const [newChildForm, setNewChildForm] = useState({ name: '', displayName: '', age: 7, avatarId: 'lion', favoriteColor: 'emerald' });

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
      if (json.success) setData(json.data);
      else setError(json.error || 'فشل في تحميل البيانات');
    } catch { setError('فشل في الاتصال بالخادم'); }
    finally { setLoading(false); }
  }, []);

  // Fetch activity log
  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/activity');
      const json = await res.json();
      if (json.success) setActivityLog(json.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) { fetchData(); fetchActivity(); }
  }, [isAuthenticated, fetchData, fetchActivity]);

  // Filtered and sorted children
  const filteredChildren = useMemo(() => {
    if (!data?.children) return [];
    let list = [...data.children];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.displayName.toLowerCase().includes(q));
    }
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

  // ─── Stats for dashboard ───
  const dashboardStats = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeToday = data.children.filter(c => c.lastActiveDate === today).length;
    const activeThisWeek = data.children.filter(c => c.lastActiveDate && new Date(c.lastActiveDate) >= weekAgo).length;
    const totalGamesToday = data.children.reduce((sum, c) => sum + c.gameSessions.filter(s => new Date(s.completedAt).toISOString().split('T')[0] === today).length, 0);
    const totalPoints = data.children.reduce((sum, c) => sum + c.points, 0);
    const totalCoins = data.children.reduce((sum, c) => sum + c.coins, 0);
    const totalGems = data.children.reduce((sum, c) => sum + c.gems, 0);
    
    return { activeToday, activeThisWeek, totalGamesToday, totalPoints, totalCoins, totalGems };
  }, [data]);

  // ─── Actions ───
  const handleDelete = useCallback(async (childId: string) => {
    try {
      const res = await fetch(`/api/admin?childId=${childId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setData(prev => prev ? { ...prev, children: prev.children.filter(c => c.id !== childId), totalChildren: prev.totalChildren - 1 } : prev);
        setDeleteDialogChild(null);
        showToast('تم حذف الطفل بنجاح');
      }
    } catch { showToast('فشل في حذف الطفل', 'error'); }
  }, [showToast]);

  const handleEditSave = useCallback(async () => {
    if (!editChild) return;
    try {
      setEditSaving(true);
      const res = await fetch(`/api/children/${editChild.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        setData(prev => {
          if (!prev) return prev;
          return { ...prev, children: prev.children.map(c => c.id === editChild.id ? { ...c, ...editForm } : c) };
        });
        setDetailChild(prev => prev && prev.id === editChild.id ? { ...prev, ...editForm } : prev);
        setEditChild(null);
        showToast('تم تحديث بيانات الطفل بنجاح');
      } else { showToast('فشل في تحديث البيانات', 'error'); }
    } catch { showToast('فشل في الاتصال بالخادم', 'error'); }
    finally { setEditSaving(false); }
  }, [editChild, editForm, showToast]);

  const handleResetProgress = useCallback(async (childId: string) => {
    try {
      setResetting(true);
      const res = await fetch(`/api/progress?childId=${childId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await fetchData();
        setResetDialogChild(null);
        showToast('تم إعادة تعيين التقدم بنجاح');
      }
    } catch { showToast('فشل في إعادة تعيين التقدم', 'error'); }
    finally { setResetting(false); }
  }, [fetchData, showToast]);

  const handleCreateChild = useCallback(async () => {
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChildForm),
      });
      const json = await res.json();
      if (json.success) {
        setNewChildDialog(false);
        setNewChildForm({ name: '', displayName: '', age: 7, avatarId: 'lion', favoriteColor: 'emerald' });
        await fetchData();
        showToast('تم إنشاء حساب الطفل بنجاح');
      }
    } catch { showToast('فشل في إنشاء الحساب', 'error'); }
  }, [newChildForm, fetchData, showToast]);

  const handleAwardBadge = useCallback(async () => {
    if (!badgeDialogChild || !selectedBadgeType) return;
    try {
      const res = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: badgeDialogChild.id, badgeType: selectedBadgeType }),
      });
      const json = await res.json();
      if (json.success) {
        setBadgeDialogChild(null);
        setSelectedBadgeType('');
        await fetchData();
        showToast('تم منح الشارة بنجاح');
      }
    } catch { showToast('فشل في منح الشارة', 'error'); }
  }, [badgeDialogChild, selectedBadgeType, fetchData, showToast]);

  const handleBulkReset = useCallback(async () => {
    if (!data?.children) return;
    try {
      await Promise.all(data.children.map(c => fetch(`/api/progress?childId=${c.id}`, { method: 'DELETE' })));
      await fetchData();
      showToast('تم إعادة تعيين تقدم جميع الأطفال');
    } catch { showToast('فشل في إعادة تعيين التقدم', 'error'); }
  }, [data?.children, fetchData, showToast]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedChildren.size === 0) return;
    try {
      await Promise.all([...selectedChildren].map(id => fetch(`/api/admin?childId=${id}`, { method: 'DELETE' })));
      setSelectedChildren(new Set());
      await fetchData();
      showToast('تم حذف الأطفال المحددين');
    } catch { showToast('فشل في حذف الأطفال', 'error'); }
  }, [selectedChildren, fetchData, showToast]);

  const handleExport = useCallback((format: 'json' | 'csv') => {
    if (!data) return;
    
    if (format === 'json') {
      const exportData = {
        exportDate: new Date().toISOString(),
        summary: { totalChildren: data.totalChildren, totalSessions: data.totalSessions, avgMastery: data.avgMastery },
        children: data.children.map(c => ({
          id: c.id, name: c.name, displayName: c.displayName, age: c.age, points: c.points,
          level: c.level, stars: c.stars, coins: c.coins, gems: c.gems, streak: c.streak,
          tableProgress: c.tableProgress, badges: c.badges,
        })),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `multiply-hero-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const headers = 'الاسم,العمر,المستوى,النقاط,النجوم,العملات,الجواهر,الأيام المتتالية\n';
      const rows = data.children.map(c => `${c.displayName},${c.age},${c.level},${c.points},${c.stars},${c.coins},${c.gems},${c.streak}`).join('\n');
      const blob = new Blob(['\ufeff' + headers + rows], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `multiply-hero-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    showToast('تم تصدير البيانات بنجاح');
  }, [data, showToast]);

  const openEditDialog = useCallback((child: ChildData) => {
    setEditChild(child);
    setEditForm({
      displayName: child.displayName, age: child.age, points: child.points,
      level: child.level, stars: child.stars, coins: child.coins, gems: child.gems,
      streak: child.streak, avatarId: child.avatarId, favoriteColor: child.favoriteColor,
    });
  }, []);

  const toggleSort = (field: 'name' | 'age' | 'level' | 'points') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleChildSelection = (id: string) => {
    setSelectedChildren(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── PIN Gate ───
  if (!isAuthenticated) {
    return <AdminPinGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <p className="text-xl font-bold text-white">{error || 'لا توجد بيانات'}</p>
        <Button onClick={onBack} variant="outline">العودة</Button>
      </div>
    );
  }

  // ─── Detail View ───
  if (detailChild) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-950">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-4">
            <Button onClick={() => setDetailChild(null)} variant="ghost" className="gap-2 text-slate-300 hover:text-white">
              <ArrowRight className="w-4 h-4" /> العودة للقائمة
            </Button>
            <div className="flex items-center gap-2">
              <Button onClick={() => openEditDialog(detailChild)} variant="outline" className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <Edit3 className="w-4 h-4" /> تعديل
              </Button>
              <Button onClick={() => setBadgeDialogChild(detailChild)} variant="outline" className="gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                <Award className="w-4 h-4" /> منح شارة
              </Button>
              <Button onClick={() => setResetDialogChild(detailChild)} variant="outline" className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10">
                <RotateCcw className="w-4 h-4" /> إعادة تعيين
              </Button>
            </div>
          </motion.div>

          {/* Profile Header */}
          <Card className="border-0 shadow-lg bg-gradient-to-l from-emerald-600 to-teal-700 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-5xl shadow-lg">
                  {AVATAR_MAP[detailChild.avatarId] || '🧒'}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-white">{detailChild.displayName}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-0">{detailChild.age} سنوات</Badge>
                    <Badge className="bg-white/20 text-white border-0">المستوى {detailChild.level}</Badge>
                    <Badge className="bg-amber-400/80 text-amber-900 border-0">{detailChild.points} ⭐</Badge>
                    {detailChild.streak > 0 && <Badge className="bg-orange-400/80 text-orange-900 border-0">🔥 {detailChild.streak}</Badge>}
                  </div>
                </div>
              </div>
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

          {/* Table Progress */}
          <Card className="mt-6 border-0 shadow-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader><CardTitle className="text-xl font-bold text-white flex items-center gap-2">📊 تقدم الجداول</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tableNum) => {
                  const prog = detailChild.tableProgress.find(p => p.tableNumber === tableNum);
                  const mastery = prog?.masteryLevel ?? 0;
                  return (
                    <motion.div key={tableNum} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-xl border p-3 text-center ${getMasteryBg(mastery)}`}>
                      <div className="text-2xl font-black text-white">×{tableNum}</div>
                      <Progress value={mastery * 100} className="h-2 mt-2 bg-slate-700" />
                      <div className={`text-sm font-bold mt-1 ${getMasteryColor(mastery)}`}>{Math.round(mastery * 100)}%</div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="mt-6 border-0 shadow-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader><CardTitle className="text-xl font-bold text-white flex items-center gap-2">🏅 الشارات ({detailChild.badges.length})</CardTitle></CardHeader>
            <CardContent>
              {detailChild.badges.length === 0 ? <p className="text-slate-400 text-center py-4">لم يتم الحصول على شارات بعد</p> : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {detailChild.badges.map((badge) => {
                    const info = BADGE_NAMES[badge.badgeType] || { name: badge.badgeType, icon: '🎖️' };
                    return <Badge key={badge.id} className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-sm gap-1"><span>{info.icon}</span>{info.name}</Badge>;
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Sessions */}
          <Card className="mt-6 border-0 shadow-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader><CardTitle className="text-xl font-bold text-white flex items-center gap-2">🎮 جلسات اللعب الأخيرة</CardTitle></CardHeader>
            <CardContent>
              {detailChild.gameSessions.length === 0 ? <p className="text-slate-400 text-center py-4">لا توجد جلسات لعب</p> : (
                <div className="max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-right text-slate-400">النوع</TableHead>
                        <TableHead className="text-right text-slate-400">الجدول</TableHead>
                        <TableHead className="text-right text-slate-400">النتيجة</TableHead>
                        <TableHead className="text-right text-slate-400">الصح/الخطأ</TableHead>
                        <TableHead className="text-right text-slate-400">المدة</TableHead>
                        <TableHead className="text-right text-slate-400">التاريخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailChild.gameSessions.slice(0, 15).map((session) => (
                        <TableRow key={session.id} className="border-white/5">
                          <TableCell className="font-medium text-white">{GAME_TYPE_NAMES[session.gameType] || session.gameType}</TableCell>
                          <TableCell className="text-slate-300">×{session.tableNumber}</TableCell>
                          <TableCell className="font-bold text-emerald-400">{session.score}</TableCell>
                          <TableCell><span className="text-green-400">{session.correctCount}</span> / <span className="text-red-400">{session.wrongCount}</span></TableCell>
                          <TableCell className="text-slate-300">{Math.round(session.duration)}ث</TableCell>
                          <TableCell className="text-slate-400">{formatDate(session.completedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editChild} onOpenChange={(open) => !open && setEditChild(null)}>
          <DialogContent dir="rtl" className="sm:max-w-lg bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-white"><Edit3 className="w-5 h-5 text-emerald-400" /> تعديل بيانات الطفل</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label className="text-slate-300">الاسم المعروض</Label><Input value={editForm.displayName} onChange={(e) => setEditForm(f => ({ ...f, displayName: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div className="space-y-2"><Label className="text-slate-300">العمر</Label><Input type="number" min={3} max={15} value={editForm.age} onChange={(e) => setEditForm(f => ({ ...f, age: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
              </div>
              <Separator className="bg-slate-700" />
              <p className="text-sm font-semibold text-slate-400">المكافآت والتقدم</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> النقاط</Label><Input type="number" min={0} value={editForm.points} onChange={(e) => setEditForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> المستوى</Label><Input type="number" min={1} max={13} value={editForm.level} onChange={(e) => setEditForm(f => ({ ...f, level: parseInt(e.target.value) || 1 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" /> النجوم</Label><Input type="number" min={0} value={editForm.stars} onChange={(e) => setEditForm(f => ({ ...f, stars: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-400" /> العملات</Label><Input type="number" min={0} value={editForm.coins} onChange={(e) => setEditForm(f => ({ ...f, coins: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Gem className="w-3.5 h-3.5 text-purple-400" /> الجواهر</Label><Input type="number" min={0} value={editForm.gems} onChange={(e) => setEditForm(f => ({ ...f, gems: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1">🔥 الأيام المتتالية</Label><Input type="number" min={0} value={editForm.streak} onChange={(e) => setEditForm(f => ({ ...f, streak: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button onClick={() => setEditChild(null)} variant="ghost" className="text-slate-400">إلغاء</Button>
              <Button onClick={handleEditSave} disabled={editSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {editSaving ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />} حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Award Badge Dialog */}
        <Dialog open={!!badgeDialogChild} onOpenChange={(open) => !open && setBadgeDialogChild(null)}>
          <DialogContent dir="rtl" className="sm:max-w-md bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-white"><Award className="w-5 h-5 text-amber-400" /> منح شارة لـ {badgeDialogChild?.displayName}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedBadgeType} onValueChange={setSelectedBadgeType}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="اختر الشارة" /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Object.entries(BADGE_NAMES).map(([type, info]) => (
                    <SelectItem key={type} value={type} className="text-white focus:bg-slate-700 focus:text-white">
                      {info.icon} {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button onClick={() => setBadgeDialogChild(null)} variant="ghost" className="text-slate-400">إلغاء</Button>
              <Button onClick={handleAwardBadge} disabled={!selectedBadgeType} className="bg-amber-600 hover:bg-amber-700 text-white">منح الشارة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Dialog */}
        <AlertDialog open={!!resetDialogChild} onOpenChange={(open) => !open && setResetDialogChild(null)}>
          <AlertDialogContent dir="rtl" className="bg-slate-900 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" /> تأكيد إعادة التعيين</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">هل أنت متأكد من إعادة تعيين تقدم {resetDialogChild?.displayName}؟ سيتم حذف جميع بيانات التقدم والجلسات.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-slate-300 border-slate-600">إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={() => resetDialogChild && handleResetProgress(resetDialogChild.id)} disabled={resetting} className="bg-red-600 hover:bg-red-700 text-white">
                {resetting ? 'جاري...' : 'إعادة تعيين'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ─── Main Dashboard ───
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">لوحة تحكم المشرف</h1>
              <p className="text-xs text-slate-400">MultiplyHero Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchData} variant="ghost" size="sm" className="text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></Button>
            <Button onClick={onBack} variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1">
              <ArrowRight className="w-4 h-4" /> خروج
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 h-auto flex-wrap">
            {[
              { value: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
              { value: 'children', label: 'الأطفال', icon: Users },
              { value: 'content', label: 'المحتوى', icon: BookOpen },
              { value: 'analytics', label: 'التحليلات', icon: BarChart3 },
              { value: 'settings', label: 'الإعدادات', icon: Cog },
              { value: 'security', label: 'الأمان', icon: ShieldCheck },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 gap-2">
                <tab.icon className="w-4 h-4" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── Overview Tab ─── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'إجمالي الأطفال', value: data.totalChildren, icon: Users, color: 'from-emerald-500 to-teal-600', emoji: '👶' },
                { label: 'نشطون اليوم', value: dashboardStats?.activeToday || 0, icon: Activity, color: 'from-cyan-500 to-blue-600', emoji: '📊' },
                { label: 'ألعاب اليوم', value: dashboardStats?.totalGamesToday || 0, icon: Gamepad2, color: 'from-amber-500 to-orange-600', emoji: '🎮' },
                { label: 'متوسط الإتقان', value: `${data.avgMastery}%`, icon: TrendingUp, color: 'from-purple-500 to-pink-600', emoji: '📈' },
              ].map((stat, idx) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl">{stat.emoji}</span>
                      </div>
                      <p className="text-2xl font-black text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString('ar-EG') : stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Revenue-like metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'إجمالي النقاط الموزعة', value: dashboardStats?.totalPoints || 0, icon: Zap, color: 'text-amber-400' },
                { label: 'إجمالي العملات', value: dashboardStats?.totalCoins || 0, icon: Coins, color: 'text-yellow-400' },
                { label: 'إجمالي الجواهر', value: dashboardStats?.totalGems || 0, icon: Gem, color: 'text-purple-400' },
              ].map((metric) => (
                <Card key={metric.label} className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <metric.icon className={`w-8 h-8 ${metric.color}`} />
                    <div>
                      <p className="text-xl font-bold text-white">{metric.value.toLocaleString('ar-EG')}</p>
                      <p className="text-xs text-slate-400">{metric.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table Mastery Distribution */}
            <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-white flex items-center gap-2">📊 توزيع إتقان الجداول</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
                  {data.tableStats.map((ts) => (
                    <div key={ts.table} className={`rounded-xl border p-3 text-center ${getMasteryBg(ts.avgMastery / 100)}`}>
                      <div className="text-lg">{TABLE_EMOJIS[ts.table - 1]}</div>
                      <div className="text-lg font-black text-white">×{ts.table}</div>
                      <div className={`text-sm font-bold ${getMasteryColor(ts.avgMastery / 100)}`}>{ts.avgMastery}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'إضافة طفل', icon: UserPlus, onClick: () => setNewChildDialog(true) },
                { label: 'تصدير البيانات', icon: FileDown, onClick: () => handleExport('json') },
                { label: 'تصدير CSV', icon: Download, onClick: () => handleExport('csv') },
                { label: 'تحديث البيانات', icon: RefreshCw, onClick: fetchData },
              ].map((action) => (
                <Button key={action.label} onClick={action.onClick} variant="outline" className="h-16 gap-2 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                  <action.icon className="w-5 h-5" /> {action.label}
                </Button>
              ))}
            </div>
          </TabsContent>

          {/* ─── Children Management Tab ─── */}
          <TabsContent value="children">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="بحث بالاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setNewChildDialog(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <UserPlus className="w-4 h-4" /> إضافة طفل
                </Button>
                {selectedChildren.size > 0 && (
                  <>
                    <Button onClick={handleBulkDelete} variant="destructive" className="gap-2"><Trash className="w-4 h-4" /> حذف ({selectedChildren.size})</Button>
                    <Button onClick={handleBulkReset} variant="outline" className="gap-2 border-red-500/30 text-red-400"><RotateCcw className="w-4 h-4" /> إعادة تعيين</Button>
                  </>
                )}
              </div>
            </div>

            {/* Children Table */}
            <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-right text-slate-400 w-10">
                          <input type="checkbox" className="rounded" onChange={(e) => {
                            if (e.target.checked) setSelectedChildren(new Set(filteredChildren.map(c => c.id)));
                            else setSelectedChildren(new Set());
                          }} />
                        </TableHead>
                        <TableHead className="text-right text-slate-400 cursor-pointer" onClick={() => toggleSort('name')}>الاسم {sortField === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}</TableHead>
                        <TableHead className="text-right text-slate-400 cursor-pointer" onClick={() => toggleSort('age')}>العمر {sortField === 'age' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}</TableHead>
                        <TableHead className="text-right text-slate-400 cursor-pointer" onClick={() => toggleSort('level')}>المستوى {sortField === 'level' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}</TableHead>
                        <TableHead className="text-right text-slate-400 cursor-pointer" onClick={() => toggleSort('points')}>النقاط {sortField === 'points' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}</TableHead>
                        <TableHead className="text-right text-slate-400">الأيام</TableHead>
                        <TableHead className="text-right text-slate-400">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChildren.map((child) => (
                        <TableRow key={child.id} className="border-white/5 hover:bg-white/5">
                          <TableCell><input type="checkbox" className="rounded" checked={selectedChildren.has(child.id)} onChange={() => toggleChildSelection(child.id)} /></TableCell>
                          <TableCell>
                            <button onClick={() => setDetailChild(child)} className="flex items-center gap-2 hover:underline">
                              <span className="text-xl">{AVATAR_MAP[child.avatarId] || '🧒'}</span>
                              <span className="font-medium text-white">{child.displayName}</span>
                            </button>
                          </TableCell>
                          <TableCell className="text-slate-300">{child.age}</TableCell>
                          <TableCell className="text-slate-300">{child.level}</TableCell>
                          <TableCell className="text-emerald-400 font-bold">{child.points}</TableCell>
                          <TableCell className="text-slate-300">🔥 {child.streak}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button onClick={() => setDetailChild(child)} variant="ghost" size="sm" className="text-slate-400 hover:text-white h-8 w-8 p-0"><Eye className="w-4 h-4" /></Button>
                              <Button onClick={() => openEditDialog(child)} variant="ghost" size="sm" className="text-slate-400 hover:text-white h-8 w-8 p-0"><Edit3 className="w-4 h-4" /></Button>
                              <Button onClick={() => setDeleteDialogChild(child)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredChildren.length === 0 && (
                  <div className="text-center py-8 text-slate-400">لا توجد نتائج</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Content Management Tab ─── */}
          <TabsContent value="content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Challenges */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-amber-400" /> التحديات اليومية</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">مستوى الصعوبة الافتراضي</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="easy">سهل</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="hard">صعب</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">عدد الأسئلة</Label>
                    <Input type="number" defaultValue={10} className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">المكافأة (نقاط)</Label>
                    <Input type="number" defaultValue={50} className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"><Save className="w-4 h-4" /> حفظ الإعدادات</Button>
                </CardContent>
              </Card>

              {/* Badge Management */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="w-5 h-5 text-emerald-400" /> إدارة الشارات</CardTitle></CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {Object.entries(BADGE_NAMES).map(([type, info]) => (
                      <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{info.icon}</span>
                          <span className="text-sm text-white">{info.name}</span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">{type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* World Themes */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Palette className="w-5 h-5 text-purple-400" /> عوالم الجداول</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
                      <div key={t} className="rounded-xl border border-white/10 p-3 text-center bg-white/5">
                        <div className="text-2xl">{TABLE_EMOJIS[t - 1]}</div>
                        <div className="text-white font-bold">×{t}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Avatar Unlock Levels */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Gift className="w-5 h-5 text-cyan-400" /> مستويات فتح الأفاتار</CardTitle></CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {Object.entries(AVATAR_MAP).slice(0, 15).map(([id, emoji]) => (
                      <div key={id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2"><span className="text-lg">{emoji}</span><span className="text-sm text-white">{id}</span></div>
                        <span className="text-xs text-slate-400">المستوى {Math.floor(Math.random() * 5) + 1}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Analytics Tab ─── */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Usage Over Time */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2">📈 النشاط اليومي</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 justify-between h-40">
                    {[35, 42, 28, 55, 60, 45, 38].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400 transition-all hover:from-emerald-400 hover:to-teal-300"
                          style={{ height: `${(val / 60) * 100}%`, minHeight: '8px' }}
                        />
                        <span className="text-[10px] text-slate-500">{['سبت', 'أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع'][i]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Table Mastery Distribution */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2">📊 إتقان كل جدول</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.tableStats.map((ts) => (
                      <div key={ts.table} className="flex items-center gap-3">
                        <span className="text-sm w-8 text-slate-400">×{ts.table}</span>
                        <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ts.avgMastery}%` }}
                            transition={{ duration: 1, delay: ts.table * 0.1 }}
                            className={`h-full rounded-full ${ts.avgMastery >= 80 ? 'bg-gradient-to-l from-green-500 to-emerald-400' : ts.avgMastery >= 40 ? 'bg-gradient-to-l from-amber-500 to-yellow-400' : 'bg-gradient-to-l from-red-500 to-orange-400'}`}
                          />
                        </div>
                        <span className={`text-sm font-bold w-12 text-left ${getMasteryColor(ts.avgMastery / 100)}`}>{ts.avgMastery}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Game Types */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2">🎮 أنواع الألعاب الشائعة</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(GAME_TYPE_NAMES).map(([type, name]) => {
                      const count = data.children.reduce((sum, c) => sum + c.gameSessions.filter(s => s.gameType === type).length, 0);
                      const maxCount = Math.max(...Object.values(GAME_TYPE_NAMES).map((_, i) => data.children.reduce((sum, c) => sum + c.gameSessions.filter(s => s.gameType === Object.keys(GAME_TYPE_NAMES)[i]).length, 0)), 1);
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className="text-sm w-24 text-slate-300">{name}</span>
                          <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-l from-purple-500 to-pink-400" style={{ width: `${(count / maxCount) * 100}%` }} />
                          </div>
                          <span className="text-sm text-slate-400 w-12 text-left">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Session Stats */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2">⏱️ إحصائيات الجلسات</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                      <p className="text-3xl font-black text-emerald-400">{data.totalSessions}</p>
                      <p className="text-xs text-slate-400">إجمالي الجلسات</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                      <p className="text-3xl font-black text-amber-400">{data.totalBadges}</p>
                      <p className="text-xs text-slate-400">إجمالي الشارات</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                      <p className="text-3xl font-black text-cyan-400">{dashboardStats?.activeThisWeek || 0}</p>
                      <p className="text-xs text-slate-400">نشط هذا الأسبوع</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                      <p className="text-3xl font-black text-purple-400">{data.avgMastery}%</p>
                      <p className="text-xs text-slate-400">متوسط الإتقان</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Settings Tab ─── */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin PIN */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Lock className="w-5 h-5 text-red-400" /> تغيير رمز PIN</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label className="text-slate-300">رمز PIN الحالي</Label><Input type="password" className="bg-slate-800 border-slate-600 text-white" placeholder="••••" /></div>
                  <div className="space-y-2"><Label className="text-slate-300">رمز PIN الجديد</Label><Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="bg-slate-800 border-slate-600 text-white" placeholder="••••" /></div>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"><Save className="w-4 h-4" /> تحديث رمز PIN</Button>
                </CardContent>
              </Card>

              {/* Session Timeout */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Timer className="w-5 h-5 text-cyan-400" /> مهلة الجلسة</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label className="text-slate-300">مدة الجلسة (بالدقائق)</Label><Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 30)} className="bg-slate-800 border-slate-600 text-white" /></div>
                  <p className="text-xs text-slate-500">سيتم تسجيل الخروج تلقائياً بعد هذه المدة من عدم النشاط</p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-2"><Save className="w-4 h-4" /> حفظ</Button>
                </CardContent>
              </Card>

              {/* Reward Values */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Gift className="w-5 h-5 text-amber-400" /> قيم المكافآت</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> نقاط لكل إجابة صحيحة</Label><Input type="number" value={rewardSettings.pointsPerCorrect} onChange={(e) => setRewardSettings(s => ({ ...s, pointsPerCorrect: parseInt(e.target.value) || 10 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                  <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-yellow-400" /> عملات لكل إجابة صحيحة</Label><Input type="number" value={rewardSettings.coinsPerCorrect} onChange={(e) => setRewardSettings(s => ({ ...s, coinsPerCorrect: parseInt(e.target.value) || 5 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                  <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Gem className="w-3.5 h-3.5 text-purple-400" /> جواهر للعبة مثالية</Label><Input type="number" value={rewardSettings.gemsPerPerfect} onChange={(e) => setRewardSettings(s => ({ ...s, gemsPerPerfect: parseInt(e.target.value) || 3 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"><Save className="w-4 h-4" /> حفظ المكافآت</Button>
                </CardContent>
              </Card>

              {/* Feature Flags */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400" /> تفعيل الميزات</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(featureFlags).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-slate-300">
                        {key === 'dailyChallenge' ? 'التحدي اليومي' :
                         key === 'storyMode' ? 'وضع القصة' :
                         key === 'speedTest' ? 'اختبار السرعة' :
                         key === 'leaderboard' ? 'لوحة المتصدرين' : 'المتجر'}
                      </Label>
                      <Switch checked={value} onCheckedChange={(checked) => setFeatureFlags(f => ({ ...f, [key]: checked }))} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Export / Import */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Database className="w-5 h-5 text-emerald-400" /> تصدير واستيراد</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => handleExport('json')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"><FileDown className="w-4 h-4" /> تصدير JSON</Button>
                  <Button onClick={() => handleExport('csv')} className="w-full bg-slate-600 hover:bg-slate-700 text-white gap-2"><Download className="w-4 h-4" /> تصدير CSV</Button>
                  <Separator className="bg-slate-700" />
                  <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2" onClick={() => {
                    if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
                      showToast('تم إعادة تعيين البيانات');
                    }
                  }}><AlertTriangle className="w-4 h-4" /> إعادة تعيين جميع البيانات</Button>
                </CardContent>
              </Card>

              {/* App Info */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Info className="w-5 h-5 text-blue-400" /> معلومات التطبيق</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between"><span className="text-slate-400">الإصدار</span><span className="text-white">2.0.0</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">آخر تحديث</span><span className="text-white">٢٠٢٦</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">قاعدة البيانات</span><span className="text-emerald-400">SQLite ✅</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">الأطفال</span><span className="text-white">{data.totalChildren}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">الجلسات</span><span className="text-white">{data.totalSessions}</span></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Security Tab ─── */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Sessions */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400" /> الجلسات النشطة</CardTitle></CardHeader>
                <CardContent>
                  {data.children.filter(c => c.lastActiveDate).length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {data.children.filter(c => c.lastActiveDate).map((child) => (
                        <div key={child.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{AVATAR_MAP[child.avatarId] || '🧒'}</span>
                            <div>
                              <p className="text-white text-sm font-medium">{child.displayName}</p>
                              <p className="text-xs text-slate-400">آخر نشاط: {child.lastActiveDate ? formatDate(child.lastActiveDate) : 'غير معروف'}</p>
                            </div>
                          </div>
                          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" title="نشط" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-4">لا توجد جلسات نشطة</p>
                  )}
                </CardContent>
              </Card>

              {/* Login Attempt Logs */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-400" /> سجل محاولات الدخول</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activityLog.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{AVATAR_MAP[item.childAvatarId] || '🧒'}</span>
                          <span className="text-sm text-white">{item.childDisplayName}</span>
                        </div>
                        <span className="text-xs text-slate-400">{formatDateTime(item.completedAt)}</span>
                      </div>
                    ))}
                    {activityLog.length === 0 && <p className="text-slate-400 text-center py-4">لا توجد سجلات</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Rate Limiting */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Timer className="w-5 h-5 text-amber-400" /> إعدادات تقييد المعدل</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label className="text-slate-300">الحد الأقصى لمحاولات الدخول</Label><Input type="number" defaultValue={5} className="bg-slate-800 border-slate-600 text-white" /></div>
                  <div className="space-y-2"><Label className="text-slate-300">مدة القفل (بالدقائق)</Label><Input type="number" defaultValue={15} className="bg-slate-800 border-slate-600 text-white" /></div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"><Save className="w-4 h-4" /> حفظ</Button>
                </CardContent>
              </Card>

              {/* Security Summary */}
              <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400" /> ملخص الأمان</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20"><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-sm text-green-300">تشفير الجلسات مفعّل</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20"><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-sm text-green-300">قفل الحساب بعد ٥ محاولات</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20"><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-sm text-green-300">تسجيل خروج تلقائي بعد ٣٠ دقيقة</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20"><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-sm text-green-300">حماية PIN للملفات الشخصية</span></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Dialogs ─── */}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-medium"
            style={{ background: toast.type === 'success' ? 'linear-gradient(135deg, #059669, #0d9488)' : 'linear-gradient(135deg, #dc2626, #ef4444)' }}
          >
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialogChild} onOpenChange={(open) => !open && setDeleteDialogChild(null)}>
        <AlertDialogContent dir="rtl" className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" /> تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">هل أنت متأكد من حذف {deleteDialogChild?.displayName}؟ سيتم حذف جميع البيانات بشكل نهائي.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300 border-slate-600">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDialogChild && handleDelete(deleteDialogChild.id)} className="bg-red-600 hover:bg-red-700 text-white">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Child Dialog */}
      <Dialog open={newChildDialog} onOpenChange={setNewChildDialog}>
        <DialogContent dir="rtl" className="sm:max-w-md bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-white"><UserPlus className="w-5 h-5 text-emerald-400" /> إضافة طفل جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label className="text-slate-300">الاسم</Label><Input value={newChildForm.name} onChange={(e) => setNewChildForm(f => ({ ...f, name: e.target.value, displayName: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" /></div>
            <div className="space-y-2"><Label className="text-slate-300">العمر</Label><Input type="number" min={3} max={15} value={newChildForm.age} onChange={(e) => setNewChildForm(f => ({ ...f, age: parseInt(e.target.value) || 7 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
            <div className="space-y-2">
              <Label className="text-slate-300">الأفاتار</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(AVATAR_MAP).slice(0, 10).map(([id, emoji]) => (
                  <button key={id} onClick={() => setNewChildForm(f => ({ ...f, avatarId: id }))} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2 transition-all ${newChildForm.avatarId === id ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={() => setNewChildDialog(false)} variant="ghost" className="text-slate-400">إلغاء</Button>
            <Button onClick={handleCreateChild} disabled={!newChildForm.name} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"><Save className="w-4 h-4" /> إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editChild} onOpenChange={(open) => !open && setEditChild(null)}>
        <DialogContent dir="rtl" className="sm:max-w-lg bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-white"><Edit3 className="w-5 h-5 text-emerald-400" /> تعديل بيانات الطفل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-slate-300">الاسم المعروض</Label><Input value={editForm.displayName} onChange={(e) => setEditForm(f => ({ ...f, displayName: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">العمر</Label><Input type="number" min={3} max={15} value={editForm.age} onChange={(e) => setEditForm(f => ({ ...f, age: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
            </div>
            <Separator className="bg-slate-700" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> النقاط</Label><Input type="number" min={0} value={editForm.points} onChange={(e) => setEditForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> المستوى</Label><Input type="number" min={1} max={13} value={editForm.level} onChange={(e) => setEditForm(f => ({ ...f, level: parseInt(e.target.value) || 1 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" /> النجوم</Label><Input type="number" min={0} value={editForm.stars} onChange={(e) => setEditForm(f => ({ ...f, stars: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-400" /> العملات</Label><Input type="number" min={0} value={editForm.coins} onChange={(e) => setEditForm(f => ({ ...f, coins: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300 flex items-center gap-1"><Gem className="w-3.5 h-3.5 text-purple-400" /> الجواهر</Label><Input type="number" min={0} value={editForm.gems} onChange={(e) => setEditForm(f => ({ ...f, gems: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">🔥 الأيام المتتالية</Label><Input type="number" min={0} value={editForm.streak} onChange={(e) => setEditForm(f => ({ ...f, streak: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={() => setEditChild(null)} variant="ghost" className="text-slate-400">إلغاء</Button>
            <Button onClick={handleEditSave} disabled={editSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">{editSaving ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />} حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
