'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Flame, Coins, Sparkles, Lock, Crown, Gem, Zap, Award, ChevronLeft, TrendingUp } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────────────────

interface AchievementsPageProps {
  earnedBadges: Array<{ badgeType: string; earnedAt: string }>;
  onBack: () => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeCategory = 'الكل' | 'الجداول' | 'الكومبو' | 'النقاط' | 'السلاسل' | 'الخاصة';
type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: Exclude<BadgeCategory, 'الكل'>;
  rarity: BadgeRarity;
  points: number;
  iconGradient: string;
  iconBg: string;
  iconChar: string;
}

// ─── Rarity Config ───────────────────────────────────────────────────────────

const RARITY_CONFIG: Record<BadgeRarity, { label: string; color: string; gradient: string; border: string; glow: string }> = {
  common: { label: 'شائع', color: 'text-slate-600', gradient: 'from-slate-100 to-slate-200', border: 'border-slate-300', glow: '' },
  rare: { label: 'نادر', color: 'text-blue-600', gradient: 'from-blue-100 to-cyan-100', border: 'border-blue-400', glow: 'shadow-blue-300/30' },
  epic: { label: 'ملحمي', color: 'text-purple-600', gradient: 'from-purple-100 to-fuchsia-100', border: 'border-purple-400', glow: 'shadow-purple-300/40' },
  legendary: { label: 'أسطوري', color: 'text-amber-600', gradient: 'from-amber-100 to-yellow-100', border: 'border-amber-400', glow: 'shadow-amber-300/50' },
};

// ─── Badge Definitions ───────────────────────────────────────────────────────

const ALL_BADGES: BadgeDefinition[] = [
  // ─── الجداول (Tables) ───
  { id: 'table-master-1', name: 'مستكشف الجزيرة', description: 'أتقن جدول 1', category: 'الجداول', rarity: 'common', points: 10, iconGradient: 'from-emerald-400 to-green-500', iconBg: 'bg-emerald-500', iconChar: '١' },
  { id: 'table-master-2', name: 'مغامر الغابة', description: 'أتقن جدول 2', category: 'الجداول', rarity: 'common', points: 10, iconGradient: 'from-lime-400 to-emerald-500', iconBg: 'bg-lime-500', iconChar: '٢' },
  { id: 'table-master-3', name: 'غواص البحر', description: 'أتقن جدول 3', category: 'الجداول', rarity: 'common', points: 10, iconGradient: 'from-teal-400 to-cyan-500', iconBg: 'bg-teal-500', iconChar: '٣' },
  { id: 'table-master-4', name: 'متسلق الجبل', description: 'أتقن جدول 4', category: 'الجداول', rarity: 'rare', points: 20, iconGradient: 'from-amber-400 to-orange-500', iconBg: 'bg-amber-500', iconChar: '٤' },
  { id: 'table-master-5', name: 'صانع الحلوى', description: 'أتقن جدول 5', category: 'الجداول', rarity: 'rare', points: 20, iconGradient: 'from-pink-400 to-rose-500', iconBg: 'bg-pink-500', iconChar: '٥' },
  { id: 'table-master-6', name: 'رائد الفضاء', description: 'أتقن جدول 6', category: 'الجداول', rarity: 'epic', points: 30, iconGradient: 'from-violet-400 to-purple-500', iconBg: 'bg-violet-500', iconChar: '٦' },
  { id: 'table-master-7', name: 'حارس القلعة', description: 'أتقن جدول 7', category: 'الجداول', rarity: 'epic', points: 30, iconGradient: 'from-orange-400 to-red-500', iconBg: 'bg-orange-500', iconChar: '٧' },
  { id: 'table-master-8', name: 'فنان الألوان', description: 'أتقن جدول 8', category: 'الجداول', rarity: 'epic', points: 30, iconGradient: 'from-rose-400 to-pink-500', iconBg: 'bg-rose-500', iconChar: '٨' },
  { id: 'table-master-9', name: 'ملك الأبطال', description: 'أتقن جدول 9', category: 'الجداول', rarity: 'legendary', points: 50, iconGradient: 'from-yellow-400 to-amber-500', iconBg: 'bg-yellow-500', iconChar: '٩' },
  { id: 'all-tables', name: 'بطل الضرب الكامل', description: 'أتقن جميع الجداول', category: 'الجداول', rarity: 'legendary', points: 100, iconGradient: 'from-yellow-300 via-amber-400 to-orange-500', iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-600', iconChar: '🏆' },

  // ─── الكومبو (Combos) ───
  { id: 'combo-5', name: 'سلسلة 5', description: '5 إجابات صحيحة متتالية', category: 'الكومبو', rarity: 'common', points: 10, iconGradient: 'from-orange-300 to-amber-400', iconBg: 'bg-orange-400', iconChar: '5' },
  { id: 'combo-10', name: 'سلسلة 10', description: '10 إجابات صحيحة متتالية', category: 'الكومبو', rarity: 'rare', points: 25, iconGradient: 'from-orange-400 to-red-400', iconBg: 'bg-orange-500', iconChar: '10' },
  { id: 'combo-25', name: 'سلسلة 25', description: '25 إجابة صحيحة متتالية', category: 'الكومبو', rarity: 'epic', points: 50, iconGradient: 'from-red-500 to-rose-600', iconBg: 'bg-red-500', iconChar: '25' },
  { id: 'combo-50', name: 'سلسلة 50', description: '50 إجابة صحيحة متتالية', category: 'الكومبو', rarity: 'legendary', points: 100, iconGradient: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-600', iconChar: '50' },

  // ─── النقاط (Points) ───
  { id: 'points-100', name: 'جامع العملات', description: 'اجمع 100 نقطة', category: 'النقاط', rarity: 'common', points: 10, iconGradient: 'from-yellow-300 to-amber-400', iconBg: 'bg-yellow-400', iconChar: '💰' },
  { id: 'points-500', name: 'كنز المعرفة', description: 'اجمع 500 نقطة', category: 'النقاط', rarity: 'rare', points: 20, iconGradient: 'from-amber-400 to-orange-500', iconBg: 'bg-amber-500', iconChar: '💎' },
  { id: 'points-1000', name: 'ماسي', description: 'اجمع 1000 نقطة', category: 'النقاط', rarity: 'epic', points: 40, iconGradient: 'from-cyan-400 to-blue-500', iconBg: 'bg-cyan-500', iconChar: '💠' },
  { id: 'points-5000', name: 'إمبراطور النقاط', description: 'اجمع 5000 نقطة', category: 'النقاط', rarity: 'legendary', points: 80, iconGradient: 'from-amber-300 to-yellow-500', iconBg: 'bg-gradient-to-r from-amber-400 to-yellow-500', iconChar: '👑' },

  // ─── السلاسل (Streaks) ───
  { id: 'streak-3', name: 'شرارة البداية', description: 'سلسلة 3 أيام متتالية', category: 'السلاسل', rarity: 'common', points: 10, iconGradient: 'from-orange-300 to-amber-400', iconBg: 'bg-orange-300', iconChar: '🔥' },
  { id: 'streak-7', name: 'نجم الإصرار', description: 'سلسلة 7 أيام متتالية', category: 'السلاسل', rarity: 'rare', points: 25, iconGradient: 'from-amber-400 to-orange-500', iconBg: 'bg-amber-400', iconChar: '💫' },
  { id: 'streak-14', name: 'قوة البرق', description: 'سلسلة 14 يوم متتالي', category: 'السلاسل', rarity: 'epic', points: 50, iconGradient: 'from-purple-400 to-violet-500', iconBg: 'bg-purple-500', iconChar: '⚡' },
  { id: 'streak-30', name: 'نجم الثبات', description: 'سلسلة 30 يوم متتالي', category: 'السلاسل', rarity: 'legendary', points: 100, iconGradient: 'from-yellow-300 to-amber-500', iconBg: 'bg-gradient-to-r from-yellow-400 to-amber-500', iconChar: '🌟' },

  // ─── الخاصة (Special) ───
  { id: 'first-game', name: 'اللاعب الجديد', description: 'العب أول لعبة', category: 'الخاصة', rarity: 'common', points: 5, iconGradient: 'from-green-300 to-emerald-400', iconBg: 'bg-green-400', iconChar: '🎮' },
  { id: 'speed-demon', name: 'الفلاتة', description: 'أجبت في أقل من 3 ثوان', category: 'الخاصة', rarity: 'rare', points: 20, iconGradient: 'from-yellow-300 to-amber-400', iconBg: 'bg-yellow-400', iconChar: '⚡' },
  { id: 'perfect-game', name: 'بلا أخطاء', description: 'أكمل جولة بدون أي خطأ', category: 'الخاصة', rarity: 'epic', points: 40, iconGradient: 'from-emerald-400 to-green-500', iconBg: 'bg-emerald-500', iconChar: '💯' },
  { id: 'night-owl', name: 'بومة الليل', description: 'العب بعد منتصف الليل', category: 'الخاصة', rarity: 'rare', points: 15, iconGradient: 'from-slate-500 to-indigo-600', iconBg: 'bg-slate-600', iconChar: '🦉' },
  { id: 'early-bird', name: 'طائر الصباح', description: 'العب قبل الساعة 7 صباحاً', category: 'الخاصة', rarity: 'rare', points: 15, iconGradient: 'from-sky-300 to-blue-400', iconBg: 'bg-sky-400', iconChar: '🐦' },
  { id: 'comeback', name: 'بطل العودة', description: 'تحسن في جدول ضعيف', category: 'الخاصة', rarity: 'epic', points: 30, iconGradient: 'from-rose-400 to-red-500', iconBg: 'bg-rose-500', iconChar: '🦸' },
  { id: 'daily-warrior', name: 'محب التحدّيات', description: 'أكمل تحدي يومي', category: 'الخاصة', rarity: 'rare', points: 20, iconGradient: 'from-orange-300 to-amber-400', iconBg: 'bg-orange-400', iconChar: '📅' },
  { id: 'story-chapter-1', name: 'راوي القصص', description: 'أكمل قصة كاملة', category: 'الخاصة', rarity: 'epic', points: 35, iconGradient: 'from-fuchsia-400 to-purple-500', iconBg: 'bg-fuchsia-500', iconChar: '📖' },
  { id: 'explorer', name: 'مستكشف', description: 'العب كل أنواع الألعاب', category: 'الخاصة', rarity: 'rare', points: 20, iconGradient: 'from-teal-400 to-cyan-500', iconBg: 'bg-teal-500', iconChar: '🗺️' },
];

const CATEGORIES: BadgeCategory[] = ['الكل', 'الجداول', 'الكومبو', 'النقاط', 'السلاسل', 'الخاصة'];

const CATEGORY_ICONS: Record<BadgeCategory, React.ReactNode> = {
  'الكل': <Award className="w-4 h-4" />,
  'الجداول': <Trophy className="w-4 h-4" />,
  'الكومبو': <Flame className="w-4 h-4" />,
  'النقاط': <Coins className="w-4 h-4" />,
  'السلاسل': <Zap className="w-4 h-4" />,
  'الخاصة': <Star className="w-4 h-4" />,
};

// ─── Animated Counter Hook ───────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    let startTime: number | null = null;
    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      setCount(Math.round(target * eased));
      if (progressRatio < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// ─── Badge Card Component ────────────────────────────────────────────────────

function BadgeCard({
  badge,
  earned,
  earnedAt,
  index,
}: {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt: string | null;
  index: number;
}) {
  const rarity = RARITY_CONFIG[badge.rarity];
  const isLegendary = badge.rarity === 'legendary';
  const isEpic = badge.rarity === 'epic';

  const formattedDate = useMemo(() => {
    if (!earnedAt) return null;
    try {
      return new Date(earnedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return earnedAt;
    }
  }, [earnedAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.03 }}
      whileHover={{ scale: 1.06, y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <Card className={`overflow-hidden relative transition-all ${
        earned
          ? `bg-gradient-to-br ${rarity.gradient} border-2 ${rarity.border} ${rarity.glow} shadow-lg`
          : 'bg-gray-100 border-2 border-gray-200'
      }`}>
        <CardContent className="p-3 flex flex-col items-center gap-1.5 text-center">
          {/* Badge Icon with 3D-style */}
          <div className="relative">
            <motion.div
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                earned
                  ? `bg-gradient-to-br ${badge.iconGradient}`
                  : 'bg-gray-300'
              }`}
              style={{
                boxShadow: earned
                  ? 'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.15)'
                  : 'none',
              }}
              animate={earned && isLegendary ? {
                rotate: [0, -3, 3, -3, 0],
              } : {}}
              transition={earned && isLegendary ? { repeat: Infinity, duration: 4, ease: 'easeInOut' } : {}}
            >
              <span className={`text-xl md:text-2xl font-black ${earned ? 'text-white' : 'text-gray-400'}`}>
                {badge.iconChar}
              </span>
            </motion.div>

            {/* Sparkle effect for epic/legendary */}
            {earned && (isEpic || isLegendary) && (
              <>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [0, 1.2, 0], rotate: [0, 180, 360] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-1"
                  animate={{ scale: [0, 1, 0], rotate: [360, 180, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
                >
                  <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              </>
            )}

            {/* Lock overlay */}
            {!earned && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-[1px]">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className={`text-[11px] md:text-xs font-black leading-tight ${earned ? 'text-slate-800' : 'text-gray-400'}`}>
            {badge.name}
          </h3>

          {/* Rarity Badge */}
          <Badge className={`text-[8px] font-bold px-1.5 py-0 border-0 ${
            badge.rarity === 'legendary' ? 'bg-amber-200 text-amber-800' :
            badge.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
            badge.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
            'bg-slate-200 text-slate-600'
          }`}>
            {rarity.label}
          </Badge>

          {/* Points */}
          <div className="text-[9px] text-slate-500 font-bold">+{badge.points} نقطة</div>

          {/* Earned indicator */}
          {earned && formattedDate && (
            <span className="text-[8px] text-slate-400">{formattedDate}</span>
          )}
        </CardContent>

        {/* Shimmer for earned badges */}
        {earned && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
            }}
            animate={{ x: [-200, 200] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: index * 0.15 }}
          />
        )}
      </Card>
    </motion.div>
  );
}

// ─── Showcase Carousel ───────────────────────────────────────────────────────

function ShowcaseCarousel({ earnedBadges }: { earnedBadges: Array<{ badgeType: string; earnedAt: string }> }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const earnedDefs = useMemo(
    () => earnedBadges.map(b => ALL_BADGES.find(def => def.id === b.badgeType)).filter(Boolean) as BadgeDefinition[],
    [earnedBadges]
  );

  useEffect(() => {
    if (earnedDefs.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % earnedDefs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [earnedDefs.length]);

  if (earnedDefs.length === 0) return null;

  const currentBadge = earnedDefs[currentIdx];
  if (!currentBadge) return null;
  const rarity = RARITY_CONFIG[currentBadge.rarity];

  return (
    <Card className={`border-2 overflow-hidden shadow-xl ${rarity.border} ${rarity.glow} bg-gradient-to-br ${rarity.gradient}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBadge.id}
            initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${currentBadge.iconGradient}`}
            style={{ boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.3)' }}
          >
            <span className="text-3xl font-black text-white">{currentBadge.iconChar}</span>
          </motion.div>
        </AnimatePresence>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge className={`text-[9px] font-bold px-1.5 py-0 border-0 ${
              currentBadge.rarity === 'legendary' ? 'bg-amber-200 text-amber-800' :
              currentBadge.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
              currentBadge.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
              'bg-slate-200 text-slate-600'
            }`}>
              {rarity.label}
            </Badge>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h3 className="text-sm font-black text-slate-800 truncate">{currentBadge.name}</h3>
          <p className="text-[10px] text-slate-500">{currentBadge.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Next to Unlock Section ──────────────────────────────────────────────────

function NextToUnlock({ earnedMap }: { earnedMap: Map<string, string> }) {
  const nearest = useMemo(() => {
    return ALL_BADGES
      .filter(b => !earnedMap.has(b.id))
      .slice(0, 3);
  }, [earnedMap]);

  if (nearest.length === 0) return null;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-l from-emerald-50 to-teal-50">
      <CardContent className="p-4">
        <h3 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-4 h-4" />
          قريب تفتحه!
        </h3>
        <div className="flex flex-col gap-2">
          {nearest.map(badge => (
            <div key={badge.id} className="flex items-center gap-2 bg-white/60 rounded-xl p-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${badge.iconGradient} shadow-sm`}>
                <span className="text-sm font-black text-white">{badge.iconChar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-700 truncate">{badge.name}</div>
                <div className="text-[9px] text-slate-500">{badge.description}</div>
              </div>
              <Badge className={`text-[8px] border-0 ${
                badge.rarity === 'legendary' ? 'bg-amber-200 text-amber-800' :
                badge.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                badge.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                'bg-slate-200 text-slate-600'
              }`}>
                {RARITY_CONFIG[badge.rarity].label}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AchievementsPage({
  earnedBadges,
  onBack,
}: AchievementsPageProps) {
  const earnedMap = useMemo(() => {
    const map = new Map<string, string>();
    earnedBadges.forEach(b => map.set(b.badgeType, b.earnedAt));
    return map;
  }, [earnedBadges]);

  const totalBadges = ALL_BADGES.length;
  const earnedCount = earnedBadges.length;
  const percentage = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;
  const totalPoints = useMemo(
    () => ALL_BADGES.filter(b => earnedMap.has(b.id)).reduce((acc, b) => acc + b.points, 0),
    [earnedMap]
  );

  const animatedPoints = useAnimatedCounter(totalPoints);
  const animatedPercentage = useAnimatedCounter(percentage);

  const filterBadges = (category: BadgeCategory) => {
    return category === 'الكل'
      ? ALL_BADGES
      : ALL_BADGES.filter(b => b.category === category);
  };

  // Category completion percentages
  const categoryStats = useMemo(() => {
    const stats: Record<string, { earned: number; total: number }> = {};
    const cats = ['الجداول', 'الكومبو', 'النقاط', 'السلاسل', 'الخاصة'];
    cats.forEach(cat => {
      const total = ALL_BADGES.filter(b => b.category === cat);
      const earned = total.filter(b => earnedMap.has(b.id));
      stats[cat] = { earned: earned.length, total: total.length };
    });
    return stats;
  }, [earnedMap]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full pb-8"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #ede9fe 60%, #d1fae5 100%)',
      }}
    >
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute top-24 left-8 text-5xl opacity-15"
        >
          <Trophy className="w-12 h-12 text-amber-400" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-56 right-10 text-4xl opacity-15"
        >
          <Star className="w-10 h-10 text-yellow-400" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-3 md:px-6 flex flex-col gap-4">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-amber-500 via-yellow-500 to-orange-400 overflow-hidden relative">
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
                    <Crown className="w-6 h-6" />
                    الإنجازات
                  </h1>
                  <p className="text-xs text-white/70 mt-1">
                    اجمع الأوسمة وأثبت مهارتك!
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-3xl font-black text-white"
                  >
                    {animatedPoints}
                  </motion.div>
                  <span className="text-[9px] text-white/70 font-bold">نقطة إنجاز</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Showcase Carousel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <ShowcaseCarousel earnedBadges={earnedBadges} />
        </motion.div>

        {/* ─── Progress Summary ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  التقدم الكامل
                </span>
                <span className="text-sm font-extrabold text-amber-600">{animatedPercentage}%</span>
              </div>
              <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-l from-amber-400 to-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">✅ {earnedCount} مكتسب</span>
                <span className="text-xs text-gray-500">🔒 {totalBadges - earnedCount} مقفل</span>
              </div>

              {/* Category breakdown */}
              <div className="grid grid-cols-5 gap-2 mt-3">
                {Object.entries(categoryStats).map(([cat, stat]) => {
                  const catPct = stat.total > 0 ? Math.round((stat.earned / stat.total) * 100) : 0;
                  return (
                    <div key={cat} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        {CATEGORY_ICONS[cat as BadgeCategory]}
                      </div>
                      <span className="text-[8px] font-bold text-slate-500">{cat}</span>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-amber-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${catPct}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <span className="text-[8px] text-slate-400">{stat.earned}/{stat.total}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Next to Unlock ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <NextToUnlock earnedMap={earnedMap} />
        </motion.div>

        {/* ─── Category Tabs + Badge Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="الكل" dir="rtl">
            <TabsList className="w-full h-auto flex-wrap gap-1 bg-white/70 backdrop-blur-sm p-1 rounded-xl">
              {CATEGORIES.map(cat => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="text-xs md:text-sm font-bold data-[state=active]:bg-amber-400 data-[state=active]:text-white rounded-lg px-3 py-1.5 flex items-center gap-1"
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(cat => {
              const badges = filterBadges(cat);
              return (
                <TabsContent key={cat} value={cat}>
                  {badges.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">🔍</div>
                      <p className="text-gray-500 font-semibold">لا توجد شارات</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                      {badges.map((badge, idx) => (
                        <BadgeCard
                          key={badge.id}
                          badge={badge}
                          earned={earnedMap.has(badge.id)}
                          earnedAt={earnedMap.get(badge.id) ?? null}
                          index={idx}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
