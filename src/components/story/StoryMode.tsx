'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Swords, Trophy, ChevronLeft, Star, Lock, CheckCircle, Volume2, Sparkles, Zap } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────────────────

interface StoryModeProps {
  tableProgress: Array<{
    tableNumber: number;
    masteryLevel: number;
    correctAnswers: number;
    wrongAnswers: number;
    totalAttempts: number;
  }>;
  onSelectChapter: (tableNumber: number) => void;
  onBack: () => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type StageType = 'learn' | 'practice' | 'master';
type ViewMode = 'map' | 'chapter' | 'completion';

interface StoryChapter {
  tableNumber: number;
  title: string;
  characterName: string;
  characterTitle: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  bgAccent: string;
  iconChar: string;
  storyText: string;
  learnTip: string;
  bossName: string;
  completionText: string;
}

// ─── 9 Story Chapters ────────────────────────────────────────────────────────

const CHAPTERS: StoryChapter[] = [
  {
    tableNumber: 1, title: 'جزيرة الأرقام',
    characterName: 'زيد', characterTitle: 'المستكشف',
    gradientFrom: 'from-emerald-400', gradientTo: 'to-green-500',
    accentColor: 'text-emerald-600', bgAccent: 'bg-emerald-100',
    iconChar: '١', storyText: 'في جزيرة بعيدة، يعلم زيد المستكشف أن أي رقم × 1 = نفسه! الصندوق السحري لن يفتح إلا لمن يتقن هذا السر.',
    learnTip: 'جدول 1 هو الأسهل: أي رقم × 1 = نفس الرقم! 5×1=5، 9×1=9',
    bossName: 'صندوق الألغاز', completionText: 'فتح زيد الصندوق السحري! بداخله خريطة لغابة الألغاز!',
  },
  {
    tableNumber: 2, title: 'غابة الألغاز',
    characterName: 'ليلى', characterTitle: 'الحكيمة',
    gradientFrom: 'from-lime-400', gradientTo: 'to-emerald-500',
    accentColor: 'text-lime-600', bgAccent: 'bg-lime-100',
    iconChar: '٢', storyText: 'في غابة الألغاز الكثيفة، ليلى الحكيمة تكتشف أن كل شيء يأتي أزواجاً! 2×3 = 3+3 = 6. الأشجار السحرية تتكاثر بالأزواج!',
    learnTip: 'جدول 2 = ضعف الرقم! 2×7 = 7+7 = 14. كل النتائج أعداد زوجية!',
    bossName: 'العاصفة المظلمة', completionText: 'ليلى أنقذت الغابة! الأزهار تفتحت ومفتاح البحر ظهر!',
  },
  {
    tableNumber: 3, title: 'بحر الضرب',
    characterName: 'عمر', characterTitle: 'البحّار',
    gradientFrom: 'from-teal-400', gradientTo: 'to-cyan-500',
    accentColor: 'text-teal-600', bgAccent: 'bg-teal-100',
    iconChar: '٣', storyText: 'عمر البحّار يبحر في أعماق البحر! كل محارة تحتوي 3 لآلئ. 3 محارات = 9 لآلئ! عقد اللآلئ السحري يحتاج معرفة جدول 3.',
    learnTip: 'جدول 3: مجموع أرقام الناتج يقبل القسمة على 3! 3×7=21→2+1=3 ✓',
    bossName: 'أبواب القاع', completionText: 'عمر استرجع العقد السحري! المملكة أضاءت بألوان قوس قزح!',
  },
  {
    tableNumber: 4, title: 'جبل الحكمة',
    characterName: 'سارة', characterTitle: 'المتسلقة',
    gradientFrom: 'from-amber-400', gradientTo: 'to-orange-500',
    accentColor: 'text-amber-600', bgAccent: 'bg-amber-100',
    iconChar: '٤', storyText: 'سارة المتسلقة تتسلق جبل الحكمة! كل محطة = 4 خطوات. 4 محطات = 16 خطوة. النسر الصغير ينتظر الإنقاذ!',
    learnTip: 'جدول 4 = ضعف جدول 2! 4×6 = 2×(2×6) = 2×12 = 24',
    bossName: 'الجليد الأبدي', completionText: 'سارة أنقذت النسر! ريشة سحرية تقود لوادي الحلوى!',
  },
  {
    tableNumber: 5, title: 'وادي الحلوى',
    characterName: 'نورا', characterTitle: 'الطاهية المبدعة',
    gradientFrom: 'from-pink-400', gradientTo: 'to-rose-500',
    accentColor: 'text-pink-600', bgAccent: 'bg-pink-100',
    iconChar: '٥', storyText: 'نورا الطاهية تصنع الحلويات! كل صندوق = 5 حلويات. ناتج جدول 5 دائماً ينتهي بـ 0 أو 5! المهرجان ينتظر الوصفة السرية.',
    learnTip: 'جدول 5 دائماً ينتهي بـ 0 أو 5! 5×4=20, 5×7=35. فكّر بالساعة!',
    bossName: 'لغز الوصفة', completionText: 'نورا وجدت الوصفة! الحلوى أضاءت الوادي! باب فضائي فتح!',
  },
  {
    tableNumber: 6, title: 'الفضاء المذهل',
    characterName: 'فهد', characterTitle: 'رائد الفضاء',
    gradientFrom: 'from-violet-400', gradientTo: 'to-purple-500',
    accentColor: 'text-violet-600', bgAccent: 'bg-violet-100',
    iconChar: '٦', storyText: 'فهد رائد الفضاء يكتشف كواكب! كل كوكب = 6 نجوم. المحطة الفضائية تستغيث! 6×5=30 وحدة طاقة مطلوبة!',
    learnTip: 'جدول 6 = ضعف جدول 3! 6×4 = 2×(3×4) = 2×12 = 24',
    bossName: 'الثقب الأسود', completionText: 'فهد أنقذ المحطة! جواز سفر سحري للمدينة السحرية!',
  },
  {
    tableNumber: 7, title: 'المدينة السحرية',
    characterName: 'هدى', characterTitle: 'أميرة المحاربين',
    gradientFrom: 'from-orange-400', gradientTo: 'to-red-500',
    accentColor: 'text-orange-600', bgAccent: 'bg-orange-100',
    iconChar: '٧', storyText: 'هدى أميرة المحاربين تحمي المدينة! كل حاجز = 7 طوبات. تنين شرير يقترب! 7×8=56 — تذكّر 5،6،7،8!',
    learnTip: '7×8=56 — السر السحري! فكّر بالترتيب: 5,6,7,8!',
    bossName: 'التنين الناري', completionText: 'هدى هزمت التنين! تحوّل لصديق! مفتاح عالم الألوان!',
  },
  {
    tableNumber: 8, title: 'عالم الألوان',
    characterName: 'ريم', characterTitle: 'الرسامة الخيالية',
    gradientFrom: 'from-rose-400', gradientTo: 'to-pink-500',
    accentColor: 'text-rose-600', bgAccent: 'bg-rose-100',
    iconChar: '٨', storyText: 'ريم الرسامة تعيد الألوان! كل لوحة = 8 ألوان. الألوان تتلاشى! 8×7=56 لوناً مطلوباً لكل لوحة!',
    learnTip: 'جدول 8 = ضعف جدول 4! 8×3 = 2×(4×3) = 2×12 = 24',
    bossName: 'الضباب الرمادي', completionText: 'ريم أعادت الألوان! درج ذهبي يقود لقمة الأبطال!',
  },
  {
    tableNumber: 9, title: 'قمة الأبطال',
    characterName: 'سلطان', characterTitle: 'حارس المعرفة',
    gradientFrom: 'from-yellow-400', gradientTo: 'to-amber-500',
    accentColor: 'text-yellow-600', bgAccent: 'bg-yellow-100',
    iconChar: '٩', storyText: 'سلطان حارس المعرفة ينتظرك! 9 أختام ذهبية تحمي الكنز الأعظم. 9×9=81 — المفتاح النهائي! من أتقن جدول 9 أتقن كل الجداول!',
    learnTip: 'سر جدول 9: مجموع أرقام الناتج دائماً = 9! 9×8=72→7+2=9 ✓',
    bossName: 'الأختام التسعة', completionText: 'أنت البطل الأسطوري! كسرت الأختام وفتحت كنز المعرفة! تاج الحكمة لك!',
  },
];

// ─── Floating Story Elements ─────────────────────────────────────────────────

function FloatingStoryElements() {
  const particles = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 5 + (i * 9) % 90,
      y: 5 + (i * 11) % 85,
      size: 4 + i % 3,
      duration: 4 + i * 0.5,
      delay: i * 0.4,
    })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/15"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -15, 0], opacity: [0.1, 0.25, 0.1], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Stage Progress Bar ──────────────────────────────────────────────────────

function StageProgress({ currentStage, onStageClick, isChapterComplete }: {
  currentStage: StageType;
  onStageClick: (stage: StageType) => void;
  isChapterComplete: boolean;
}) {
  const stages: { id: StageType; label: string; icon: React.ReactNode }[] = [
    { id: 'learn', label: 'تعلّم', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'practice', label: 'تدرّب', icon: <Swords className="w-4 h-4" /> },
    { id: 'master', label: 'أتقن', icon: <Trophy className="w-4 h-4" /> },
  ];

  const stageOrder: StageType[] = ['learn', 'practice', 'master'];
  const currentIdx = stageOrder.indexOf(currentStage);

  return (
    <div className="flex items-center gap-2 justify-center">
      {stages.map((stage, i) => {
        const isComplete = isChapterComplete || i < currentIdx;
        const isCurrent = stage.id === currentStage;

        return (
          <div key={stage.id} className="flex items-center gap-2">
            <motion.button
              onClick={() => {
                if (i <= currentIdx || isChapterComplete) onStageClick(stage.id);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-gradient-to-l from-amber-400 to-orange-500 text-white shadow-lg'
                  : isComplete
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isComplete && !isCurrent ? <CheckCircle className="w-3.5 h-3.5" /> : stage.icon}
              {stage.label}
            </motion.button>
            {i < stages.length - 1 && (
              <div className={`w-6 h-0.5 ${isComplete ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Chapter Card (Map View) ─────────────────────────────────────────────────

function ChapterCard({
  chapter,
  mastery,
  isUnlocked,
  index,
  onClick,
}: {
  chapter: StoryChapter;
  mastery: number;
  isUnlocked: boolean;
  index: number;
  onClick: () => void;
}) {
  const masteryPct = Math.round(mastery * 100);
  const isComplete = masteryPct >= 80;

  // Determine which stage is current
  const stageLabel = isComplete ? 'مكتمل ✅' : masteryPct >= 50 ? 'أتقن' : masteryPct > 0 ? 'تدرّب' : 'تعلّم';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: isUnlocked ? 1 : 0.5, y: 0, scale: isUnlocked ? 1 : 0.92 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.06 }}
      whileHover={isUnlocked ? { scale: 1.03, y: -4 } : {}}
      whileTap={isUnlocked ? { scale: 0.97 } : {}}
      onClick={isUnlocked ? onClick : undefined}
      className={`cursor-${isUnlocked ? 'pointer' : 'not-allowed'}`}
    >
      <Card className={`overflow-hidden border-0 shadow-lg relative ${
        isUnlocked
          ? `bg-gradient-to-br ${chapter.gradientFrom} ${chapter.gradientTo}`
          : 'bg-gradient-to-br from-gray-300 to-gray-400'
      }`}>
        <CardContent className="p-4 flex items-center gap-3 relative z-10">
          {/* Character portrait */}
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isUnlocked ? chapter.bgAccent : 'bg-gray-400'
              }`}
              style={{
                boxShadow: isUnlocked
                  ? 'inset -2px -2px 4px rgba(0,0,0,0.15), inset 2px 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.1)'
                  : 'none',
              }}
            >
              <span className={`text-2xl font-black ${isUnlocked ? 'text-white' : 'text-gray-300'}`}>
                {chapter.iconChar}
              </span>
            </div>
            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white"
              >
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30">
                <Lock className="w-5 h-5 text-gray-200" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`text-sm font-black ${isUnlocked ? 'text-white' : 'text-gray-200'} truncate`}>
                الفصل {chapter.tableNumber}: {chapter.title}
              </h3>
            </div>
            <p className={`text-[10px] ${isUnlocked ? 'text-white/80' : 'text-gray-300'} mb-1`}>
              {chapter.characterName} {chapter.characterTitle}
            </p>
            {isUnlocked ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/70 font-semibold">{stageLabel}</span>
                  <span className="text-[10px] font-bold text-white">{masteryPct}%</span>
                </div>
                <Progress value={masteryPct} className="h-2 bg-white/25" />
              </div>
            ) : (
              <span className="text-[10px] text-gray-200">أكمل الفصل السابق أولاً</span>
            )}
          </div>

          {/* Arrow */}
          {isUnlocked && (
            <div className="shrink-0">
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </div>
          )}
        </CardContent>

        {/* Shimmer for complete */}
        {isComplete && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)' }}
            animate={{ x: [-200, 200] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: index * 0.2 }}
          />
        )}
      </Card>
    </motion.div>
  );
}

// ─── Learn Stage ─────────────────────────────────────────────────────────────

function LearnStage({ chapter }: { chapter: StoryChapter }) {
  const tableNum = chapter.tableNumber;

  return (
    <div className="space-y-4">
      {/* Story text */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${chapter.bgAccent}`}
              style={{ boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.15), inset 1px 1px 3px rgba(255,255,255,0.3)' }}>
              <span className="text-lg font-black text-white">{chapter.iconChar}</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">{chapter.characterName} {chapter.characterTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">{chapter.storyText}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tip */}
      <Card className={`border-0 shadow-lg bg-gradient-to-l ${chapter.bgAccent}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-4 h-4 ${chapter.accentColor}`} />
            <span className="text-sm font-bold text-slate-700">نصيحة الحفظ</span>
          </div>
          <p className="text-sm text-slate-700 font-semibold">{chapter.learnTip}</p>
        </CardContent>
      </Card>

      {/* Multiplication Table */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            جدول {tableNum}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }, (_, i) => {
              const multiplier = i + 1;
              const result = tableNum * multiplier;
              return (
                <motion.div
                  key={multiplier}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-xl p-2 text-center bg-gradient-to-br ${chapter.gradientFrom} ${chapter.gradientTo}`}
                  style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.1)' }}
                >
                  <div className="text-xs font-bold text-white/80">{tableNum} × {multiplier}</div>
                  <div className="text-lg font-black text-white">{result}</div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Practice Stage ──────────────────────────────────────────────────────────

function PracticeStage({ chapter, onPlay }: { chapter: StoryChapter; onPlay: () => void }) {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Swords className={`w-5 h-5 ${chapter.accentColor}`} />
            <h3 className="text-sm font-black text-slate-800">وقت التدريب!</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            ساعد {chapter.characterName} في التغلب على {chapter.bossName}! أجب على الأسئلة بشكل صحيح لتتقدم.
          </p>
          <Button
            onClick={onPlay}
            className={`w-full h-14 text-base font-black bg-gradient-to-l ${chapter.gradientFrom} ${chapter.gradientTo} hover:opacity-90 shadow-lg border-0 rounded-2xl`}
          >
            <Swords className="w-5 h-5 ml-2" />
            ابدأ التدريب!
          </Button>
        </CardContent>
      </Card>

      {/* Boss info */}
      <Card className={`border-0 shadow-lg bg-gradient-to-br ${chapter.gradientFrom} ${chapter.gradientTo}`}>
        <CardContent className="p-4 text-center">
          <div className="text-4xl mb-2">👾</div>
          <h3 className="text-lg font-black text-white">{chapter.bossName}</h3>
          <p className="text-xs text-white/80">تحدّى الزعيم وأثبت مهارتك!</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Master Stage ────────────────────────────────────────────────────────────

function MasterStage({ chapter, mastery, onPlay }: { chapter: StoryChapter; mastery: number; onPlay: () => void }) {
  const masteryPct = Math.round(mastery * 100);
  const stars = masteryPct >= 90 ? 3 : masteryPct >= 70 ? 2 : masteryPct >= 50 ? 1 : 0;

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-800">اختبر إتقانك!</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            اختبر نفسك في جدول {chapter.tableNumber} للحصول على تقييم الإتقان. هل تستطيع الحصول على 3 نجوم؟
          </p>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: s * 0.15 }}>
                <Star className={`w-8 h-8 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              </motion.div>
            ))}
          </div>

          <Progress value={masteryPct} className="h-3 mb-2" />
          <div className="text-center text-xs text-slate-500">{masteryPct}% إتقان</div>

          <Button
            onClick={onPlay}
            className={`w-full h-14 text-base font-black bg-gradient-to-l ${chapter.gradientFrom} ${chapter.gradientTo} hover:opacity-90 shadow-lg border-0 rounded-2xl mt-4`}
          >
            <Zap className="w-5 h-5 ml-2" />
            اختبر الإتقان!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Chapter Completion ──────────────────────────────────────────────────────

function ChapterCompletion({ chapter }: { chapter: StoryChapter }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="text-center py-6"
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="text-6xl mb-4"
      >
        🏆
      </motion.div>
      <div className="flex items-center justify-center gap-1 mb-3">
        {[1, 2, 3].map(s => (
          <motion.div key={s} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5 + s * 0.2, type: 'spring' }}>
            <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
          </motion.div>
        ))}
      </div>
      <h3 className="text-xl font-black text-white mb-2">أتممت الفصل {chapter.tableNumber}!</h3>
      <p className="text-white/80 text-sm max-w-xs mx-auto">{chapter.completionText}</p>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StoryMode({
  tableProgress,
  onSelectChapter,
  onBack,
}: StoryModeProps) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [currentStage, setCurrentStage] = useState<StageType>('learn');

  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    tableProgress.forEach(tp => map.set(tp.tableNumber, tp.masteryLevel));
    return map;
  }, [tableProgress]);

  const isUnlocked = useCallback(
    (tableNumber: number): boolean => {
      if (tableNumber === 1) return true;
      const prev = progressMap.get(tableNumber - 1);
      return (prev ?? 0) > 0;
    },
    [progressMap]
  );

  const handleChapterClick = useCallback((tableNumber: number) => {
    if (isUnlocked(tableNumber)) {
      setSelectedChapter(tableNumber);
      const mastery = progressMap.get(tableNumber) ?? 0;
      if (mastery >= 0.5) setCurrentStage('master');
      else if (mastery > 0) setCurrentStage('practice');
      else setCurrentStage('learn');
    }
  }, [isUnlocked, progressMap]);

  const handlePlay = useCallback(() => {
    if (selectedChapter !== null) {
      onSelectChapter(selectedChapter);
    }
  }, [selectedChapter, onSelectChapter]);

  // ─── Chapter Detail View ───
  if (selectedChapter !== null) {
    const chapter = CHAPTERS.find(c => c.tableNumber === selectedChapter)!;
    const mastery = progressMap.get(selectedChapter) ?? 0;
    const masteryPct = Math.round(mastery * 100);
    const isChapterComplete = masteryPct >= 80;

    return (
      <div className="min-h-screen" dir="rtl" style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #ede9fe 60%, #d1fae5 100%)',
      }}>
        <FloatingStoryElements />

        <div className="relative z-10 max-w-lg mx-auto px-3 md:px-6 flex flex-col gap-4 pt-4 pb-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-l ${chapter.gradientFrom} ${chapter.gradientTo} p-4 rounded-2xl shadow-xl`}
          >
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedChapter(null)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white rotate-180" />
              </motion.button>
              <div className="flex-1">
                <h1 className="text-lg md:text-xl font-black text-white">الفصل {chapter.tableNumber}: {chapter.title}</h1>
                <p className="text-[10px] text-white/80">{chapter.characterName} {chapter.characterTitle}</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.15)' }}
              >
                <span className="text-xl font-black text-white">{chapter.iconChar}</span>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={masteryPct} className="h-2 bg-white/25" />
              <div className="flex justify-between mt-1 text-[10px] text-white/70">
                <span>الإتقان</span>
                <span>{masteryPct}%</span>
              </div>
            </div>
          </motion.div>

          {/* Stage Progress */}
          <StageProgress
            currentStage={currentStage}
            onStageClick={setCurrentStage}
            isChapterComplete={isChapterComplete}
          />

          {/* Stage Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {currentStage === 'learn' && <LearnStage chapter={chapter} />}
              {currentStage === 'practice' && <PracticeStage chapter={chapter} onPlay={handlePlay} />}
              {currentStage === 'master' && <MasterStage chapter={chapter} mastery={mastery} onPlay={handlePlay} />}
            </motion.div>
          </AnimatePresence>

          {/* Completion celebration */}
          {isChapterComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={`border-0 shadow-2xl overflow-hidden bg-gradient-to-br ${chapter.gradientFrom} ${chapter.gradientTo}`}>
                <CardContent className="p-5">
                  <ChapterCompletion chapter={chapter} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ─── Map View ───
  return (
    <div className="min-h-screen" dir="rtl" style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #ede9fe 60%, #d1fae5 100%)',
    }}>
      <FloatingStoryElements />

      <div className="relative z-10 max-w-lg mx-auto px-3 md:px-6 flex flex-col gap-4 pt-4 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-l from-purple-600 to-fuchsia-600 p-4 rounded-2xl shadow-xl"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white rotate-180" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                وضع القصة
              </h1>
              <p className="text-[10px] text-white/80">9 فصول — 9 مغامرات!</p>
            </div>
            <div className="text-4xl">📖</div>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">تقدّم القصة</span>
                <Badge variant="secondary" className="text-xs font-bold">
                  {tableProgress.filter(t => t.masteryLevel >= 0.8).length}/9 فصول
                </Badge>
              </div>
              <Progress
                value={(tableProgress.filter(t => t.masteryLevel >= 0.8).length / 9) * 100}
                className="h-3"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Chapter List */}
        <div className="space-y-3">
          {CHAPTERS.map((chapter, idx) => {
            const mastery = progressMap.get(chapter.tableNumber) ?? 0;
            const unlocked = isUnlocked(chapter.tableNumber);
            return (
              <ChapterCard
                key={chapter.tableNumber}
                chapter={chapter}
                mastery={mastery}
                isUnlocked={unlocked}
                index={idx}
                onClick={() => handleChapterClick(chapter.tableNumber)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
