'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Volume2, BookOpen, Lightbulb, Grid3X3, Brain, Target, Clock, Star, Sparkles, TrendingUp, RotateCcw, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Props ───────────────────────────────────────────────────────────────────

interface PracticeModeProps {
  currentChild: {
    id: string;
    name: string;
    displayName: string;
    avatarId: string;
    points: number;
    level: number;
  };
  tableProgress: Array<{
    tableNumber: number;
    masteryLevel: number;
    correctAnswers: number;
    wrongAnswers: number;
    totalAttempts: number;
  }>;
  onBack: () => void;
  onStartGame: (gameType: string, tableNumber: number | 'mixed', difficulty: 'easy' | 'medium' | 'hard') => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const WORLD_THEMES: Record<number, { name: string; gradient: string; color: string; iconChar: string }> = {
  1: { name: 'جزيرة الأرقام', gradient: 'from-emerald-400 to-green-500', color: '#22c55e', iconChar: '١' },
  2: { name: 'غابة الضرب', gradient: 'from-lime-400 to-emerald-500', color: '#84cc16', iconChar: '٢' },
  3: { name: 'محيط الثلاثة', gradient: 'from-teal-400 to-cyan-500', color: '#14b8a6', iconChar: '٣' },
  4: { name: 'جبل الأربعة', gradient: 'from-amber-400 to-orange-500', color: '#f59e0b', iconChar: '٤' },
  5: { name: 'وادي الحلوى', gradient: 'from-pink-400 to-rose-500', color: '#ec4899', iconChar: '٥' },
  6: { name: 'فضاء الستة', gradient: 'from-violet-400 to-purple-500', color: '#8b5cf6', iconChar: '٦' },
  7: { name: 'قلعة السبعة', gradient: 'from-orange-400 to-red-400', color: '#f97316', iconChar: '٧' },
  8: { name: 'عالم الألوان', gradient: 'from-rose-400 to-pink-500', color: '#f43f5e', iconChar: '٨' },
  9: { name: 'مملكة التسعة', gradient: 'from-yellow-400 to-amber-500', color: '#eab308', iconChar: '٩' },
};

const TABLE_TIPS: Record<number, string> = {
  1: 'جدول 1: أي رقم مضروب في 1 يبقى كما هو! 🪞',
  2: 'جدول 2: هو ضعف الرقم! 2×5 = 5+5 = 10 ✌️',
  3: 'جدول 3: مجموع أرقام الناتج دائماً يقبل القسمة على 3! 🔺',
  4: 'جدول 4: هو ضعف جدول 2! 4×3 = 2×3×2 = 12 🔄',
  5: 'جدول 5: دائماً ينتهي بـ 0 أو 5! 🖐️',
  6: 'جدول 6: هو ضعف جدول 3! 6×4 = 3×4×2 = 24 🎲',
  7: 'جدول 7: تذكّر 7×8 = 56 (5،6،7،8 - بالترتيب!) 🎯',
  8: 'جدول 8: هو ضعف جدول 4! 8×3 = 4×3×2 = 24 🧊',
  9: 'جدول 9: مجموع أرقام الناتج دائماً = 9! 9×7=63 → 6+3=9 ✨',
};

function getMasteryLabel(mastery: number): { label: string; color: string; bg: string } {
  if (mastery >= 0.8) return { label: 'متقن ✅', color: 'text-green-600', bg: 'bg-green-100' };
  if (mastery >= 0.4) return { label: 'يتعلم 📖', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  return { label: 'جديد 🌱', color: 'text-red-500', bg: 'bg-red-100' };
}

// ─── Pattern Highlights ──────────────────────────────────────────────────────

function getPatternHighlights(tableNumber: number): Array<{ title: string; desc: string }> {
  const patterns: Record<number, Array<{ title: string; desc: string }>> = {
    1: [
      { title: 'المرآة 🪞', desc: 'أي رقم × 1 = نفس الرقم! 7×1=7، 100×1=100' },
      { title: 'الأسهل!', desc: 'جدول 1 هو أسهل جدول لأن الناتج دائماً نفس الرقم' },
    ],
    2: [
      { title: 'الضعف ✌️', desc: 'ضرب أي رقم في 2 يعني إضافته لنفسه: 2×6 = 6+6 = 12' },
      { title: 'أرقام زوجية', desc: 'كل نواتج جدول 2 أرقام زوجية: 2، 4، 6، 8، 10...' },
    ],
    3: [
      { title: 'قاعدة القسمة على 3 🔺', desc: 'إذا كان مجموع أرقام الناتج يقبل القسمة على 3، فالناتج صحيح!' },
      { title: 'نمط الأرقام', desc: '3، 6، 9، 12، 15، 18، 21، 24، 27 — تزيد 3 كل مرة' },
    ],
    4: [
      { title: 'ضعف الضعف 🔄', desc: '4×ن = 2×(2×ن). مثال: 4×6 = 2×12 = 24' },
      { title: 'أرقام زوجية', desc: 'كل نواتج جدول 4 أرقام زوجية أيضاً' },
    ],
    5: [
      { title: 'القاعدة الذهبية 🖐️', desc: 'ناتج جدول 5 دائماً ينتهي بـ 0 أو 5!' },
      { title: 'الساعة ⏰', desc: 'فكّر بالساعة: 5×6=30 دقيقة = نصف ساعة' },
    ],
    6: [
      { title: 'ضعف جدول 3 🎲', desc: '6×ن = 2×(3×ن). مثال: 6×4 = 2×12 = 24' },
      { title: 'نمط الأرقام', desc: '6، 12، 18، 24، 30، 36، 42، 48، 54' },
    ],
    7: [
      { title: 'السر السحري 🎯', desc: '7×8 = 56 — تذكّر الترتيب: 5،6،7،8!' },
      { title: 'الأصعب لكن الأقوى 💪', desc: 'جدول 7 يحتاج تمريناً أكثر لكنه مميز جداً' },
    ],
    8: [
      { title: 'ضعف جدول 4 🧊', desc: '8×ن = 2×(4×ن). مثال: 8×3 = 2×12 = 24' },
      { title: 'نمط الأرقام الزوجية', desc: '8، 16، 24، 32، 40، 48، 56، 64، 72' },
    ],
    9: [
      { title: 'سر الرقم 9 ✨', desc: 'مجموع أرقام أي ناتج = 9! 9×8=72 → 7+2=9' },
      { title: 'حيلة الأصابع 🖐️', desc: 'ثنِّ إصبعك بالترتيب! 9×3: ثنِّ الإصبع 3 = 27' },
    ],
  };
  return patterns[tableNumber] || [{ title: 'تدرّب!', desc: 'كلما تدربت أكثر، كلما حفظت الجدول أفضل!' }];
}

// ─── Spaced Repetition Suggestion ────────────────────────────────────────────

function getSpacedRepetitionSuggestion(tableProgress: PracticeModeProps['tableProgress']): { table: number; reason: string } | null {
  // Find weakest table that has been attempted
  let weakest: { table: number; mastery: number; attempts: number } | null = null;
  for (const tp of tableProgress) {
    if (tp.totalAttempts > 0 && tp.masteryLevel < 0.8) {
      if (!weakest || tp.masteryLevel < weakest.mastery) {
        weakest = { table: tp.tableNumber, mastery: tp.masteryLevel, attempts: tp.totalAttempts };
      }
    }
  }
  if (!weakest) return null;
  return {
    table: weakest.table,
    reason: weakest.mastery < 0.4 ? 'يحتاج تركيز إضافي' : 'قريب من الإتقان!',
  };
}

// ─── Flip Card Component ─────────────────────────────────────────────────────

function FlipCard({ question, answer, tableNumber }: { question: string; answer: number; tableNumber: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = WORLD_THEMES[tableNumber];

  const handleSpeak = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${question} يساوي ${answer}`);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, [question, answer]);

  return (
    <motion.div className="cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <div className="relative w-full" style={{ perspective: '1000px' }}>
        <motion.div className="w-full" animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}>
          <div className={`rounded-xl p-3 md:p-4 bg-gradient-to-br ${theme.gradient} text-white text-center shadow-lg`}
            style={{ backfaceVisibility: 'hidden', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.15), inset 2px 2px 4px rgba(255,255,255,0.2)' }}>
            <div className="text-lg md:text-xl font-black">{question}</div>
            <div className="text-[10px] mt-1 opacity-70">اضغط للكشف</div>
          </div>
          <div className="absolute inset-0 rounded-xl p-3 md:p-4 bg-gradient-to-br from-slate-700 to-slate-900 text-white text-center shadow-lg"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="text-lg md:text-xl font-black">{question} = {answer}</div>
            <button onClick={(e) => { e.stopPropagation(); handleSpeak(); }}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-xs font-bold hover:bg-white/30 transition-colors">
              <Volume2 className="w-3 h-3" /> استمع
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Table Overview Card ─────────────────────────────────────────────────────

function TableOverviewCard({ tableNumber, mastery, totalAttempts, onClick, index, isWeak }: {
  tableNumber: number; mastery: number; totalAttempts: number; onClick: () => void; index: number; isWeak: boolean;
}) {
  const theme = WORLD_THEMES[tableNumber];
  const masteryInfo = getMasteryLabel(mastery);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.05 }}
      whileHover={{ scale: 1.06, y: -4 }} whileTap={{ scale: 0.95 }}
      className="cursor-pointer" onClick={onClick}>
      <Card className={`overflow-hidden border-0 shadow-lg bg-gradient-to-br ${theme.gradient} relative group ${isWeak ? 'ring-2 ring-red-300' : ''}`}>
        {/* Smart Practice Badge */}
        {isWeak && (
          <div className="absolute -top-1 -right-1 z-20">
            <Badge className="bg-red-500 text-white border-0 text-[7px] px-1 py-0.5">
              <Brain className="w-2.5 h-2.5 ml-0.5" /> ركّز هنا
            </Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 flex flex-col items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/25"
            style={{ boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.15), inset 1px 1px 3px rgba(255,255,255,0.2)' }}>
            <span className="text-lg font-black text-white">{theme.iconChar}</span>
          </div>
          <div className="w-full">
            <Progress value={mastery * 100} className="h-2 bg-white/30" />
          </div>
          <div className={`text-[10px] font-bold ${masteryInfo.color} bg-white/90 px-2 py-0.5 rounded-full`}>
            {masteryInfo.label}
          </div>
          {totalAttempts > 0 && (
            <div className="text-[9px] text-white/60">{totalAttempts} محاولة</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Multiplication Grid Component ──────────────────────────────────────────

function MultiplicationGrid({ tableNumber }: { tableNumber: number }) {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const theme = WORLD_THEMES[tableNumber];

  const handleCellClick = useCallback((multiplier: number) => {
    setActiveCell(multiplier);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const result = tableNumber * multiplier;
      const utterance = new SpeechSynthesisUtterance(`${tableNumber} ضرب ${multiplier} يساوي ${result}`);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, [tableNumber]);

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      {Array.from({ length: 9 }, (_, i) => {
        const multiplier = i + 1;
        const result = tableNumber * multiplier;
        const isActive = activeCell === multiplier;

        return (
          <motion.div key={multiplier}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => handleCellClick(multiplier)}
            className={`cursor-pointer rounded-xl p-2 md:p-3 text-center transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-br ${theme.gradient} text-white shadow-lg ring-2 ring-white/50`
                : 'bg-white hover:bg-slate-50 shadow-md'
            }`}
            style={isActive ? { boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.15)' } : {}}>
            <div className={`text-sm md:text-base font-black ${isActive ? 'text-white' : 'text-slate-700'}`}>
              {tableNumber} × {multiplier}
            </div>
            <div className={`text-lg md:text-2xl font-black mt-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
              {result}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PracticeMode({
  currentChild, tableProgress, onBack, onStartGame,
}: PracticeModeProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'cards' | 'tips'>('grid');

  const getProgress = useCallback((tableNum: number) => {
    return tableProgress.find(t => t.tableNumber === tableNum);
  }, [tableProgress]);

  // Smart practice suggestion
  const smartSuggestion = useMemo(() => getSpacedRepetitionSuggestion(tableProgress), [tableProgress]);

  // Identify weak tables
  const weakTables = useMemo(() => {
    return new Set(
      tableProgress
        .filter(tp => tp.totalAttempts > 0 && tp.masteryLevel < 0.5)
        .sort((a, b) => a.masteryLevel - b.masteryLevel)
        .slice(0, 3)
        .map(tp => tp.tableNumber)
    );
  }, [tableProgress]);

  // Daily practice goal
  const dailyGoal = useMemo(() => {
    const totalAttempts = tableProgress.reduce((acc, t) => acc + t.totalAttempts, 0);
    const goal = 20;
    const progress = Math.min(totalAttempts % goal, goal);
    return { goal, progress, percent: Math.round((progress / goal) * 100) };
  }, [tableProgress]);

  // ─── Selected table view ───
  if (selectedTable !== null) {
    const theme = WORLD_THEMES[selectedTable];
    const progress = getProgress(selectedTable);
    const mastery = progress?.masteryLevel ?? 0;

    const handleSpeakTable = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`جدول الضرب رقم ${selectedTable}`);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-l ${theme.gradient} p-4 md:p-6 text-white shadow-xl`}>
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedTable(null)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/25"
                  style={{ boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.15)' }}>
                  <span className="text-lg font-black">{theme.iconChar}</span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black">جدول {selectedTable}</h1>
                  <p className="text-xs text-white/80">{theme.name}</p>
                </div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleSpeakTable}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
              <Volume2 className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="max-w-lg mx-auto mt-3">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1">
              <span>مستوى الإتقان</span>
              <span>{Math.round(mastery * 100)}%</span>
            </div>
            <Progress value={mastery * 100} className="h-2 bg-white/30" />
          </div>
        </motion.div>

        <div className="max-w-lg mx-auto p-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'grid' | 'cards' | 'tips')} className="mb-4">
            <TabsList className="w-full grid grid-cols-3 h-auto gap-1 bg-slate-200/50 p-1">
              <TabsTrigger value="grid" className="text-xs md:text-sm font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Grid3X3 className="w-4 h-4 ml-1" /> الشبكة
              </TabsTrigger>
              <TabsTrigger value="cards" className="text-xs md:text-sm font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <RotateCcw className="w-4 h-4 ml-1" /> البطاقات
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-xs md:text-sm font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Lightbulb className="w-4 h-4 ml-1" /> نصائح
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {activeTab === 'grid' && (
                <motion.div key="grid" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4" /> شبكة جدول {selectedTable}
                      </h3>
                      <MultiplicationGrid tableNumber={selectedTable} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {activeTab === 'cards' && (
                <motion.div key="cards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> بطاقات جدول {selectedTable} — اضغط للكشف
                      </h3>
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {Array.from({ length: 9 }, (_, i) => {
                          const multiplier = i + 1;
                          return (
                            <FlipCard key={multiplier}
                              question={`${selectedTable} × ${multiplier}`}
                              answer={selectedTable * multiplier}
                              tableNumber={selectedTable} />
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {activeTab === 'tips' && (
                <motion.div key="tips" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card className="border-0 shadow-lg bg-gradient-to-l from-amber-50 to-yellow-50">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> نصائح لحفظ جدول {selectedTable}
                      </h3>
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className={`rounded-xl p-4 bg-gradient-to-br ${theme.gradient} text-white mb-4`}
                        style={{ boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.15)' }}>
                        <div className="text-lg font-black mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" /> {TABLE_TIPS[selectedTable]}
                        </div>
                      </motion.div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" /> أنماط مثيرة:
                        </h4>
                        {getPatternHighlights(selectedTable).map((pattern, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.1 }}
                            className="p-3 rounded-xl bg-white shadow-sm border border-amber-100">
                            <div className="text-sm font-bold text-slate-700">{pattern.title}</div>
                            <div className="text-xs text-slate-500 mt-1">{pattern.desc}</div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
            <Button onClick={() => onStartGame('multiple-choice', selectedTable, 'easy')}
              className={`w-full h-14 text-lg font-black bg-gradient-to-l ${theme.gradient} hover:opacity-90 shadow-xl border-0 rounded-2xl`}>
              🎮 ابدأ لعبة جدول {selectedTable}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Main overview ───
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-l from-emerald-500 to-teal-600 p-4 md:p-6 text-white shadow-xl">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onBack} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <BookOpen className="w-6 h-6" /> التدريب الحرّ
            </h1>
            <p className="text-xs text-white/80">تعلّم كل جدول على راحتك!</p>
          </div>
          <div className="text-3xl">📖</div>
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto p-4">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-4xl">🌟</motion.div>
                <div>
                  <div className="text-sm font-bold text-slate-700">مرحباً {currentChild.displayName}!</div>
                  <div className="text-xs text-slate-500">اختر جدولاً للبدء في التدريب الحرّ</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Practice Suggestion */}
        {smartSuggestion && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-l from-purple-50 to-fuchsia-50 border-r-4 border-r-purple-400 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center"
                    style={{ boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.2)' }}>
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-purple-800 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> تمرين ذكي
                    </div>
                    <p className="text-xs text-purple-600 mt-0.5">
                      جدول {smartSuggestion.table} يحتاج اهتماماً — {smartSuggestion.reason}
                    </p>
                  </div>
                  <Button size="sm"
                    onClick={() => setSelectedTable(smartSuggestion.table)}
                    className="bg-purple-500 hover:bg-purple-600 text-white border-0 text-xs rounded-lg">
                    ابدأ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Overall Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  <BarChart3 className="w-4 h-4 text-emerald-500" /> تقدمك الإجمالي
                </span>
                <Badge variant="secondary" className="text-xs font-bold">
                  {Math.round((tableProgress.reduce((acc, t) => acc + t.masteryLevel, 0) / 9) * 100)}%
                </Badge>
              </div>
              <Progress value={(tableProgress.reduce((acc, t) => acc + t.masteryLevel, 0) / 9) * 100} className="h-3" />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">{tableProgress.filter(t => t.masteryLevel >= 0.8).length}/9 جداول متقنة</span>
                <span className="text-[10px] text-slate-400">استمر!</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Goal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-4">
          <Card className="border-0 shadow-lg bg-gradient-to-l from-amber-50 to-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center"
                  style={{ boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.2)' }}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-800">هدف اليوم: {dailyGoal.goal} سؤال</span>
                    <span className="text-xs font-black text-amber-600">{dailyGoal.progress}/{dailyGoal.goal}</span>
                  </div>
                  <Progress value={dailyGoal.percent} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tables Grid */}
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> جداول الضرب
        </motion.h2>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => {
            const progress = getProgress(num);
            return (
              <TableOverviewCard key={num} tableNumber={num}
                mastery={progress?.masteryLevel ?? 0} totalAttempts={progress?.totalAttempts ?? 0}
                onClick={() => setSelectedTable(num)} index={index} isWeak={weakTables.has(num)} />
            );
          })}
        </div>

        {/* Mixed Practice + Smart Practice */}
        <div className="mt-4 space-y-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button onClick={() => onStartGame('multiple-choice', 'mixed', 'easy')}
              className="w-full h-14 text-lg font-black bg-gradient-to-l from-teal-500 to-cyan-600 hover:opacity-90 shadow-xl border-0 rounded-2xl text-white">
              🎲 تدريب مختلط — جميع الجداول
            </Button>
          </motion.div>
          {smartSuggestion && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Button onClick={() => onStartGame('multiple-choice', smartSuggestion.table, 'medium')}
                className="w-full h-14 text-lg font-black bg-gradient-to-l from-purple-500 to-fuchsia-600 hover:opacity-90 shadow-xl border-0 rounded-2xl text-white">
                <Brain className="w-5 h-5 ml-2" /> تمرين ذكي — جدول {smartSuggestion.table}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
