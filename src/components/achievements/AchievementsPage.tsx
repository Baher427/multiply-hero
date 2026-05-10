'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ─── Props ───────────────────────────────────────────────────────────────────

interface AchievementsPageProps {
  earnedBadges: Array<{ badgeType: string; earnedAt: string }>;
  onBack: () => void;
}

// ─── Badge Definitions ───────────────────────────────────────────────────────

type BadgeCategory = 'الكل' | 'الجداول' | 'السلاسل' | 'النقاط' | 'الخاصة';

interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  category: Exclude<BadgeCategory, 'الكل'>;
}

const ALL_BADGES: BadgeDefinition[] = [
  // ─── الجداول (Tables) ───
  { id: 'table1_master', emoji: '🏝️', name: 'مستكشف الجزيرة', description: 'أتقن جدول 1', category: 'الجداول' },
  { id: 'table2_master', emoji: '🌳', name: 'مغامر الغابة', description: 'أتقن جدول 2', category: 'الجداول' },
  { id: 'table3_master', emoji: '🌊', name: 'غواص البحر', description: 'أتقن جدول 3', category: 'الجداول' },
  { id: 'table4_master', emoji: '⛰️', name: 'متسلق الجبل', description: 'أتقن جدول 4', category: 'الجداول' },
  { id: 'table5_master', emoji: '🍬', name: 'صانع الحلوى', description: 'أتقن جدول 5', category: 'الجداول' },
  { id: 'table6_master', emoji: '🚀', name: 'رائد الفضاء', description: 'أتقن جدول 6', category: 'الجداول' },
  { id: 'table7_master', emoji: '🏰', name: 'حارس القلعة', description: 'أتقن جدول 7', category: 'الجداول' },
  { id: 'table8_master', emoji: '🎨', name: 'فنان الألوان', description: 'أتقن جدول 8', category: 'الجداول' },
  { id: 'table9_master', emoji: '👑', name: 'ملك الأبطال', description: 'أتقن جدول 9', category: 'الجداول' },
  { id: 'all_tables', emoji: '🏆', name: 'بطل الضرب الكامل', description: 'أتقن جميع الجداول التسعة', category: 'الجداول' },

  // ─── السلاسل (Streaks) ───
  { id: 'streak_3', emoji: '🔥', name: 'شرارة البداية', description: 'سلسلة 3 أيام متتالية', category: 'السلاسل' },
  { id: 'streak_7', emoji: '💫', name: 'نجم الإصرار', description: 'سلسلة 7 أيام متتالية', category: 'السلاسل' },
  { id: 'streak_14', emoji: '⚡', name: 'قوة البرق', description: 'سلسلة 14 يوم متتالي', category: 'السلاسل' },
  { id: 'streak_30', emoji: '🌟', name: 'نجم الثبات', description: 'سلسلة 30 يوم متتالي', category: 'السلاسل' },
  { id: 'streak_100', emoji: '🌈', name: 'أسطورة المثابرة', description: 'سلسلة 100 يوم متتالي', category: 'السلاسل' },

  // ─── النقاط (Points) ───
  { id: 'points_100', emoji: '🪙', name: 'جامع العملات', description: 'اجمع 100 نقطة', category: 'النقاط' },
  { id: 'points_500', emoji: '💰', name: 'كنز المعرفة', description: 'اجمع 500 نقطة', category: 'النقاط' },
  { id: 'points_1000', emoji: '💎', name: 'ماسي', description: 'اجمع 1000 نقطة', category: 'النقاط' },
  { id: 'points_5000', emoji: '👑', name: 'إمبراطور النقاط', description: 'اجمع 5000 نقطة', category: 'النقاط' },

  // ─── الخاصة (Special) ───
  { id: 'first_game', emoji: '🎮', name: 'اللاعب الجديد', description: 'العب أول لعبة', category: 'الخاصة' },
  { id: 'speed_demon', emoji: '⚡', name: 'الفلاتة', description: 'أكمل 10 أسئلة في دقيقة', category: 'الخاصة' },
  { id: 'perfect_round', emoji: '💯', name: 'بلا أخطاء', description: 'أكمل جولة بدون أي خطأ', category: 'الخاصة' },
  { id: 'night_owl', emoji: '🦉', name: 'بومة الليل', description: 'العب بعد منتصف الليل', category: 'الخاصة' },
  { id: 'early_bird', emoji: '🐦', name: 'طائر الصباح', description: 'العب قبل الساعة 7 صباحاً', category: 'الخاصة' },
  { id: 'comeback', emoji: '🦸', name: 'بطل العودة', description: 'تحسن في جدول كان ضعيفاً فيه', category: 'الخاصة' },
  { id: 'daily_5', emoji: '📅', name: 'محب التحدّيات', description: 'أكمل 5 تحديات يومية', category: 'الخاصة' },
  { id: 'story_complete', emoji: '📖', name: 'راوي القصص', description: 'أكمل قصة كاملة', category: 'الخاصة' },
];

const CATEGORIES: BadgeCategory[] = ['الكل', 'الجداول', 'السلاسل', 'النقاط', 'الخاصة'];

const CATEGORY_EMOJIS: Record<BadgeCategory, string> = {
  'الكل': '🏅',
  'الجداول': '📊',
  'السلاسل': '🔥',
  'النقاط': '💰',
  'الخاصة': '⭐',
};

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
  const formattedDate = useMemo(() => {
    if (!earnedAt) return null;
    try {
      const d = new Date(earnedAt);
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return earnedAt;
    }
  }, [earnedAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.04,
      }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <Card
        className={`overflow-hidden border-0 shadow-lg relative transition-all ${
          earned
            ? 'bg-gradient-to-br from-amber-50 to-yellow-50'
            : 'bg-gray-100 grayscale opacity-70'
        }`}
      >
        <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
          {/* Badge Icon */}
          <motion.div
            className="text-4xl md:text-5xl"
            animate={earned ? { rotate: [0, -5, 5, -5, 0] } : {}}
            transition={earned ? { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: index * 0.1 } : {}}
          >
            {badge.emoji}
          </motion.div>

          {/* Badge Name */}
          <h3
            className={`text-sm font-black leading-tight ${
              earned ? 'text-slate-800' : 'text-gray-400'
            }`}
          >
            {badge.name}
          </h3>

          {/* Description */}
          <p
            className={`text-[10px] md:text-xs leading-snug ${
              earned ? 'text-slate-500' : 'text-gray-400'
            }`}
          >
            {badge.description}
          </p>

          {/* Earned indicator */}
          {earned ? (
            <div className="flex flex-col items-center gap-1 mt-1">
              <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold px-2">
                ✅ مكتسب
              </Badge>
              {formattedDate && (
                <span className="text-[9px] text-gray-400">{formattedDate}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl">🔒</span>
              <span className="text-[10px] text-gray-400 font-semibold">لم يُكسب بعد</span>
            </div>
          )}
        </CardContent>

        {/* Shimmer effect for earned badges */}
        {earned && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
            }}
            animate={{ x: [-200, 200] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: index * 0.2 }}
          />
        )}
      </Card>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AchievementsPage({
  earnedBadges,
  onBack,
}: AchievementsPageProps) {
  const [filterEarned, setFilterEarned] = useState<'all' | 'earned' | 'unearned'>('all');

  // Build earned set for quick lookup
  const earnedMap = useMemo(() => {
    const map = new Map<string, string>();
    earnedBadges.forEach((b) => map.set(b.badgeType, b.earnedAt));
    return map;
  }, [earnedBadges]);

  // Count stats
  const totalBadges = ALL_BADGES.length;
  const earnedCount = earnedBadges.length;
  const percentage = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;

  // Filter badges by category and earned status
  const filterBadges = (category: BadgeCategory) => {
    let filtered = category === 'الكل'
      ? ALL_BADGES
      : ALL_BADGES.filter((b) => b.category === category);

    if (filterEarned === 'earned') {
      filtered = filtered.filter((b) => earnedMap.has(b.id));
    } else if (filterEarned === 'unearned') {
      filtered = filtered.filter((b) => !earnedMap.has(b.id));
    }

    return filtered;
  };

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
          🏆
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-56 right-10 text-4xl opacity-15"
        >
          🏅
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute bottom-40 left-16 text-4xl opacity-15"
        >
          ⭐
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
                    🏆 الإنجازات
                  </h1>
                  <p className="text-xs text-white/70 mt-1">
                    اجمع الأوسمة وأثبت مهارتك!
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-4xl"
                  >
                    🏅
                  </motion.div>
                  <span className="text-xs text-white/80 font-bold mt-1">
                    {earnedCount}/{totalBadges}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <span className="text-sm font-bold text-slate-700">
                  التقدم الكامل للإنجازات 📊
                </span>
                <span className="text-sm font-extrabold text-amber-600">{percentage}%</span>
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
                <span className="text-xs text-gray-500">
                  ✅ {earnedCount} مكتسب
                </span>
                <span className="text-xs text-gray-500">
                  🔒 {totalBadges - earnedCount} مقفل
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Filter Buttons ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2"
        >
          <Button
            size="sm"
            variant={filterEarned === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterEarned('all')}
            className={`rounded-full text-xs font-bold ${
              filterEarned === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white/80 text-slate-700 border-slate-300'
            }`}
          >
            الكل
          </Button>
          <Button
            size="sm"
            variant={filterEarned === 'earned' ? 'default' : 'outline'}
            onClick={() => setFilterEarned('earned')}
            className={`rounded-full text-xs font-bold ${
              filterEarned === 'earned'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/80 text-slate-700 border-slate-300'
            }`}
          >
            ✅ المكتسبة
          </Button>
          <Button
            size="sm"
            variant={filterEarned === 'unearned' ? 'default' : 'outline'}
            onClick={() => setFilterEarned('unearned')}
            className={`rounded-full text-xs font-bold ${
              filterEarned === 'unearned'
                ? 'bg-gray-600 text-white'
                : 'bg-white/80 text-slate-700 border-slate-300'
            }`}
          >
            🔒 المقفلة
          </Button>
        </motion.div>

        {/* ─── Category Tabs + Badge Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="الكل" dir="rtl">
            <TabsList className="w-full h-auto flex-wrap gap-1 bg-white/70 backdrop-blur-sm p-1 rounded-xl">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="text-xs md:text-sm font-bold data-[state=active]:bg-amber-400 data-[state=active]:text-white rounded-lg px-3 py-1.5"
                >
                  {CATEGORY_EMOJIS[cat]} {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => {
              const badges = filterBadges(cat);
              return (
                <TabsContent key={cat} value={cat}>
                  {badges.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">🔍</div>
                      <p className="text-gray-500 font-semibold">
                        لا توجد شارات في هذا التصنيف
                      </p>
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
