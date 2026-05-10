'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// ─── Props ───────────────────────────────────────────────────────────────────

interface StoryModeProps {
  tableProgress: Array<{ tableNumber: number; masteryLevel: number }>;
  onSelectChapter: (tableNumber: number) => void;
  onBack: () => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoryChapter {
  tableNumber: number;
  emoji: string;
  worldEmoji: string;
  title: string;
  characterName: string;
  characterEmoji: string;
  intro: string;
  problem: string;
  practice: string;
  completion: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  bgAccent: string;
}

// ─── Story Data ──────────────────────────────────────────────────────────────

const STORIES: StoryChapter[] = [
  {
    tableNumber: 1,
    emoji: '🏝️',
    worldEmoji: '🏝️',
    title: 'جزيرة الأرقام',
    characterName: 'نور',
    characterEmoji: '👧',
    intro: 'في جزيرة بعيدة اسمها جزيرة الأرقام، تعيش طفلة اسمها نور. نور تحب العد وتجمع الأصداف على الشاطئ. كل يوم تجمع مجموعة من الأصداف وتعدّها.',
    problem: 'نور وجدت صندوقاً سحرياً على الشاطئ! لفتحه يجب أن تعرف جدول الضرب رقم 1. هل تساعدها؟',
    practice: 'ساعد نور في حل مسائل جدول 1 لفتح الصندوق السحري! كل إجابة صحيحة تقربها من فتح الصندوق.',
    completion: 'مبروك! ساعدت نور في فتح الصندوق السحري! بداخله وجدت خريطة كنز تقود إلى الغابة السحرية! 🗺️✨',
    gradientFrom: 'from-emerald-300',
    gradientTo: 'to-green-400',
    accentColor: 'text-emerald-600',
    bgAccent: 'bg-emerald-100',
  },
  {
    tableNumber: 2,
    emoji: '🌳',
    worldEmoji: '🌳',
    title: 'غابة الألغاز',
    characterName: 'سالم',
    characterEmoji: '🧒',
    intro: 'في غابة الألغاز الكثيفة، يعيش ولد شجاع اسمه سالم. سالم يزور الأشجار السحرية وكل شجرة تعطيه ضعف ما يعطيه الأخرى.',
    problem: 'الأشجار السحرية في خطر! عاصفة قوية أغلقت ممرات الغابة. سالم يحتاج لمعرفة جدول 2 لفتح الممرات وإنقاذ الأشجار!',
    practice: 'ساعد سالم في حل مسائل جدول 2 لفتح ممرات الغابة وإنقاذ الأشجار السحرية!',
    completion: 'أحسنت! ساعدت سالم في إنقاذ الغابة! الأشجار السحرية شكرتك وأعطتك مفتاحاً ذهبياً يقود إلى البحر! 🌊🔑',
    gradientFrom: 'from-lime-300',
    gradientTo: 'to-emerald-400',
    accentColor: 'text-lime-600',
    bgAccent: 'bg-lime-100',
  },
  {
    tableNumber: 3,
    emoji: '🌊',
    worldEmoji: '🌊',
    title: 'بحر الضرب',
    characterName: 'لؤلؤة',
    characterEmoji: '🧜‍♀️',
    intro: 'في أعماق بحر الضرب، تعيش حورية صغيرة اسمها لؤلؤة. لؤلؤة تجمع اللآلئ من المحار وكل محارة تحتوي على 3 لآلئ!',
    problem: 'لؤلؤة فقدت عقد اللآلئ السحري في قاع البحر! لاسترجاعه يجب أن تعرف جدول 3 لتفتح أبواب القاع السحيق!',
    practice: 'ساعد لؤلؤة في حل مسائل جدول 3 لاسترجاع عقد اللآلئ السحري من قاع البحر!',
    completion: 'رائع! ساعدت لؤلؤة في استرجاع عقد اللآلئ! العقد أضاء وأظهر طريقاً سرياً إلى الجبل العظيم! ⛰️💎',
    gradientFrom: 'from-teal-300',
    gradientTo: 'to-cyan-400',
    accentColor: 'text-teal-600',
    bgAccent: 'bg-teal-100',
  },
  {
    tableNumber: 4,
    emoji: '⛰️',
    worldEmoji: '⛰️',
    title: 'جبل الحكمة',
    characterName: 'راشد',
    characterEmoji: '🧗',
    intro: 'فوق قمم جبل الحكمة الشاهق، يعلم متسلق ماهر اسمه راشد. راشد يصعد درجات الجبل 4 خطوات في كل مرة!',
    problem: 'راشد يسمع نداء استغاثة من قمة الجبل! نسر صغير محتجز في عشه. للوصول إليه يجب أن يتسلق بمعرفة جدول 4!',
    practice: 'ساعد راشد في حل مسائل جدول 4 لتسلق الجبل وإنقاذ النسر الصغير!',
    completion: 'بطولي! ساعدت راشد في إنقاذ النسر الصغير! النسر الأم أعطتك ريشة سحرية تقودك إلى وادي الحلوى! 🍬🪶',
    gradientFrom: 'from-amber-300',
    gradientTo: 'to-orange-400',
    accentColor: 'text-amber-600',
    bgAccent: 'bg-amber-100',
  },
  {
    tableNumber: 5,
    emoji: '🍬',
    worldEmoji: '🍬',
    title: 'وادي الحلوى',
    characterName: 'حلا',
    characterEmoji: '👩‍🍳',
    intro: 'في وادي الحلوى اللذيذ، تعيش طاهية ماهرة اسمها حلا. حلا تصنع الحلويات وتضع 5 حلويات في كل صندوق!',
    problem: 'مهرجان الحلوى الكبير على الأبواب لكن حلا فقدت وصفتها السرية! لاسترجاعها يجب أن تحل لغز جدول 5!',
    practice: 'ساعد حلا في حل مسائل جدول 5 لاسترجاع الوصفة السرية وإعداد الحلويات للمهرجان!',
    completion: 'لذيذ! ساعدت حلا في استرجاع الوصفة! الحلوى السحرية فتحت باباً فضائياً يقود إلى الفضاء المذهل! 🚀🍩',
    gradientFrom: 'from-pink-300',
    gradientTo: 'to-rose-400',
    accentColor: 'text-pink-600',
    bgAccent: 'bg-pink-100',
  },
  {
    tableNumber: 6,
    emoji: '🚀',
    worldEmoji: '🚀',
    title: 'الفضاء المذهل',
    characterName: 'فارس',
    characterEmoji: '🧑‍🚀',
    intro: 'في الفضاء المذهل البعيد، يطير رائد فضاء اسمه فارس. فارس يزور الكواكب ويجد 6 نجوم في كل كوكب!',
    problem: 'فارس التقط إشارة استغاثة من محطة فضائية مفقودة! للوصول إليها يجب أن يحسب المسافة بجدول 6!',
    practice: 'ساعد فارس في حل مسائل جدول 6 للوصول إلى المحطة الفضائية وإنقاذ الرواد!',
    completion: 'مذهل! ساعدت فارس في إنقاذ المحطة الفضائية! الرواد أعطوك جواز سفر سحري إلى المدينة السحرية! 🏰🌟',
    gradientFrom: 'from-purple-300',
    gradientTo: 'to-fuchsia-400',
    accentColor: 'text-purple-600',
    bgAccent: 'bg-purple-100',
  },
  {
    tableNumber: 7,
    emoji: '🏰',
    worldEmoji: '🏰',
    title: 'المدينة السحرية',
    characterName: 'أميرة',
    characterEmoji: '👸',
    intro: 'في المدينة السحرية المحاطة بالأسوار، تعيش أميرة ذكية اسمها أميرة. أميرة تحمي المدينة بحواجز سحرية كل واحد يتكون من 7 طوب!',
    problem: 'تنين شرير يقترب من المدينة السحرية! أميرة تحتاج لبناء حاجز سحري بمعرفة جدول 7 لحماية المدينة!',
    practice: 'ساعد أميرة في حل مسائل جدول 7 لبناء الحاجز السحري وحماية المدينة من التنين!',
    completion: 'شجاع! ساعدت أميرة في هزيمة التنين وبناء الحاجز! التنين تحول إلى صديق وأعطاك مفتاح عالم الألوان! 🎨🐉',
    gradientFrom: 'from-orange-300',
    gradientTo: 'to-red-400',
    accentColor: 'text-orange-600',
    bgAccent: 'bg-orange-100',
  },
  {
    tableNumber: 8,
    emoji: '🎨',
    worldEmoji: '🎨',
    title: 'عالم الألوان',
    characterName: 'بدور',
    characterEmoji: '🎨',
    intro: 'في عالم الألوان الرائع، تعيش رسامة موهوبة اسمها بدور. بدور ترسم لوحات سحرية وكل لوحة تحتاج 8 ألوان!',
    problem: 'ألوان عالم الألوان تتلاشى! اللون السحري الوحيد المتبقي يحتاج لمعرفة جدول 8 لإعادة كل الألوان!',
    practice: 'ساعد بدور في حل مسائل جدول 8 لإعادة الألوان إلى عالم الألوان وإنقاذ الفن!',
    completion: 'مبدع! ساعدت بدور في إعادة الألوان! ألوان قوس قزح أظهرت درجاً ذهبياً يقود إلى قمة الأبطال! 👑🌈',
    gradientFrom: 'from-rose-300',
    gradientTo: 'to-pink-400',
    accentColor: 'text-rose-600',
    bgAccent: 'bg-rose-100',
  },
  {
    tableNumber: 9,
    emoji: '👑',
    worldEmoji: '👑',
    title: 'قمة الأبطال',
    characterName: 'سلطان',
    characterEmoji: '🤴',
    intro: 'في قمة الأبطال الأسطورية، ينتظر سلطان الحكمة. سلطان يحرس كنز المعرفة الأعظم وكل كنز محمي بـ 9 أختام!',
    problem: 'كنز المعرفة الأعظم ينتظر بطلاً حقيقياً! لفتح الأختام التسعة يجب أن تثبت إتقانك لجدول 9 الأصعب!',
    practice: 'اثبت أنك البطل الحقيقي! ساعد سلطان في حل مسائل جدول 9 لفتح كنز المعرفة الأعظم!',
    completion: 'أسطوري! أنت البطل الحقيقي! فتحت كنز المعرفة وأتقنت جميع الجداول! أنت الآن ملك الضرب! 👑🏆🎉',
    gradientFrom: 'from-yellow-300',
    gradientTo: 'to-amber-400',
    accentColor: 'text-yellow-600',
    bgAccent: 'bg-yellow-100',
  },
];

// ─── Chapter Stage ───────────────────────────────────────────────────────────

type ChapterStage = 'intro' | 'problem' | 'practice' | 'completion';

// ─── Chapter Detail View ─────────────────────────────────────────────────────

function ChapterDetail({
  story,
  masteryLevel,
  onPlay,
  onBack,
}: {
  story: StoryChapter;
  masteryLevel: number;
  onPlay: () => void;
  onBack: () => void;
}) {
  const [stage, setStage] = useState<ChapterStage>('intro');

  const stageOrder: ChapterStage[] = ['intro', 'problem', 'practice', 'completion'];
  const currentStageIdx = stageOrder.indexOf(stage);
  const isCompleted = masteryLevel >= 80;

  // If completed, allow viewing all stages
  const canAdvance = isCompleted || stage !== 'practice';

  const stageContent: Record<ChapterStage, { title: string; emoji: string; text: string }> = {
    intro: {
      title: 'البداية',
      emoji: '📖',
      text: story.intro,
    },
    problem: {
      title: 'المشكلة',
      emoji: '⚠️',
      text: story.problem,
    },
    practice: {
      title: 'التدريب',
      emoji: '💪',
      text: story.practice,
    },
    completion: {
      title: 'الإنجاز',
      emoji: '🎉',
      text: story.completion,
    },
  };

  const handleNext = () => {
    if (stage === 'practice') {
      onPlay();
      return;
    }
    const nextIdx = currentStageIdx + 1;
    if (nextIdx < stageOrder.length) {
      setStage(stageOrder[nextIdx]);
    }
  };

  const handlePrev = () => {
    const prevIdx = currentStageIdx - 1;
    if (prevIdx >= 0) {
      setStage(stageOrder[prevIdx]);
    } else {
      onBack();
    }
  };

  const content = stageContent[stage];

  return (
    <div className="flex flex-col gap-4">
      {/* Stage indicator */}
      <div className="flex items-center gap-2 justify-center">
        {stageOrder.map((s, idx) => (
          <motion.button
            key={s}
            onClick={() => {
              if (idx <= currentStageIdx || (isCompleted && idx === 3)) {
                setStage(s);
              }
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              idx === currentStageIdx
                ? `bg-gradient-to-br ${story.gradientFrom} ${story.gradientTo} text-white shadow-lg scale-110`
                : idx < currentStageIdx || (isCompleted && idx === 3)
                  ? 'bg-emerald-400 text-white'
                  : 'bg-gray-200 text-gray-400'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {idx + 1}
          </motion.button>
        ))}
      </div>

      {/* Story content card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card
            className={`border-0 shadow-2xl overflow-hidden bg-gradient-to-br ${story.gradientFrom} ${story.gradientTo} relative`}
          >
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-6 text-7xl rotate-12">{story.worldEmoji}</div>
              <div className="absolute bottom-4 right-8 text-6xl -rotate-6">{story.characterEmoji}</div>
            </div>

            <CardContent className="p-5 md:p-8 relative z-10">
              {/* Character and stage title */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="text-5xl"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, -3, 3, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                  {stage === 'practice' ? '💪' : story.characterEmoji}
                </motion.div>
                <div>
                  <Badge className="bg-white/25 text-white border-0 font-bold text-xs">
                    {content.title} {content.emoji}
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                    {story.title}
                  </h2>
                </div>
              </div>

              {/* Illustration area */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-center gap-4 text-4xl md:text-5xl">
                  {stage === 'intro' && (
                    <>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        {story.characterEmoji}
                      </motion.span>
                      <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                        {story.worldEmoji}
                      </motion.span>
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        ✨
                      </motion.span>
                    </>
                  )}
                  {stage === 'problem' && (
                    <>
                      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        ⚠️
                      </motion.span>
                      <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        {story.characterEmoji}
                      </motion.span>
                      <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        ❓
                      </motion.span>
                    </>
                  )}
                  {stage === 'practice' && (
                    <>
                      <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        🧮
                      </motion.span>
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        💪
                      </motion.span>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        🎯
                      </motion.span>
                    </>
                  )}
                  {stage === 'completion' && (
                    <>
                      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        🎉
                      </motion.span>
                      <motion.span animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 4 }}>
                        ⭐
                      </motion.span>
                      <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        🏆
                      </motion.span>
                    </>
                  )}
                </div>
              </div>

              {/* Narrative text */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4">
                <p className="text-white text-base md:text-lg font-semibold leading-relaxed">
                  {content.text}
                </p>
              </div>

              {/* Mastery progress (in practice stage) */}
              {stage === 'practice' && (
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white/80">مستوى الإتقان</span>
                    <span className="text-xs font-extrabold text-white">{Math.round(masteryLevel)}%</span>
                  </div>
                  <Progress
                    value={masteryLevel}
                    className="h-3 rounded-full bg-white/25 [&>div]:from-white/80 [&>div]:to-white [&>div]:bg-gradient-to-l"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handlePrev}
          variant="outline"
          className="flex-1 h-12 rounded-xl font-bold text-sm bg-white/80"
        >
          {currentStageIdx === 0 ? '→ رجوع' : '→ السابق'}
        </Button>
        <Button
          onClick={handleNext}
          className={`flex-1 h-12 rounded-xl font-bold text-sm shadow-lg bg-gradient-to-l ${story.gradientFrom} ${story.gradientTo} text-white border-0 hover:opacity-90`}
        >
          {stage === 'practice'
            ? '🎮 ابدأ التدريب!'
            : currentStageIdx === stageOrder.length - 1
              ? '🎉 إنهاء'
              : '← التالي'}
        </Button>
      </div>
    </div>
  );
}

// ─── Chapter Card Component ──────────────────────────────────────────────────

function ChapterCard({
  story,
  masteryLevel,
  index,
  onClick,
}: {
  story: StoryChapter;
  masteryLevel: number;
  index: number;
  onClick: () => void;
}) {
  const isCompleted = masteryLevel >= 80;
  const isInProgress = masteryLevel > 0 && masteryLevel < 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.06,
      }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card
        className={`overflow-hidden border-0 shadow-lg relative bg-gradient-to-br ${story.gradientFrom} ${story.gradientTo}`}
      >
        {/* Status badge */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-2 z-20"
          >
            <Badge className="bg-emerald-500 text-white border-0 font-bold text-[10px] px-2 shadow-md">
              ✅ مكتمل
            </Badge>
          </motion.div>
        )}
        {isInProgress && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-2 z-20"
          >
            <Badge className="bg-amber-500 text-white border-0 font-bold text-[10px] px-2 shadow-md">
              📖 قيد التعلم
            </Badge>
          </motion.div>
        )}

        <CardContent className="p-4 flex items-center gap-3 relative z-10">
          {/* Character emoji */}
          <motion.div
            className="text-3xl md:text-4xl shrink-0"
            animate={isCompleted ? { rotate: [0, -5, 5, -5, 0] } : {}}
            transition={isCompleted ? { repeat: Infinity, duration: 4, ease: 'easeInOut' } : {}}
          >
            {story.characterEmoji}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xl font-black text-white">{story.tableNumber}</span>
              <span className="text-xs text-white/80 font-bold">×</span>
              <span className="text-sm font-bold text-white/90 truncate">{story.title}</span>
            </div>
            <p className="text-[10px] text-white/70 line-clamp-2 leading-snug">
              {story.intro}
            </p>
            {isInProgress && (
              <div className="mt-2">
                <Progress
                  value={masteryLevel}
                  className="h-2 rounded-full bg-white/25 [&>div]:from-white/80 [&>div]:to-white [&>div]:bg-gradient-to-l"
                />
              </div>
            )}
          </div>

          {/* Play indicator */}
          <div className="shrink-0 w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
            <span className="text-sm">▶️</span>
          </div>
        </CardContent>
      </Card>
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

  // Build progress map
  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    tableProgress.forEach((tp) => map.set(tp.tableNumber, tp.masteryLevel));
    return map;
  }, [tableProgress]);

  // Stats
  const completedChapters = useMemo(() => {
    return tableProgress.filter((tp) => tp.masteryLevel >= 80).length;
  }, [tableProgress]);

  const totalProgress = useMemo(() => {
    if (tableProgress.length === 0) return 0;
    return Math.round(
      tableProgress.reduce((acc, tp) => acc + tp.masteryLevel, 0) / 9
    );
  }, [tableProgress]);

  // Get selected story
  const selectedStory = useMemo(() => {
    if (selectedChapter === null) return null;
    return STORIES.find((s) => s.tableNumber === selectedChapter) ?? null;
  }, [selectedChapter]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full pb-8"
      style={{
        background: selectedStory
          ? `linear-gradient(135deg, #fdf4ff 0%, #fce7f3 30%, #f3e8ff 60%, #ede9fe 100%)`
          : 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 30%, #fef3c7 60%, #d1fae5 100%)',
      }}
    >
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute top-20 right-10 text-5xl opacity-15"
        >
          📖
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute top-48 left-12 text-4xl opacity-15"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute bottom-32 right-16 text-4xl opacity-15"
        >
          🌟
        </motion.div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-3 md:px-6 flex flex-col gap-4">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-purple-500 via-fuchsia-500 to-pink-400 overflow-hidden relative">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => {
                    if (selectedChapter !== null) {
                      setSelectedChapter(null);
                    } else {
                      onBack();
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg backdrop-blur-sm"
                  aria-label="رجوع"
                >
                  →
                </motion.button>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                    📖 وضع القصة
                  </h1>
                  <p className="text-xs text-white/70 mt-1">
                    {selectedChapter !== null
                      ? `الفصل ${selectedChapter} - ${selectedStory?.title}`
                      : 'عش المغامرات وتعلم الجداول!'}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-4xl"
                >
                  {selectedStory?.emoji ?? '📖'}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Stats (only in list view) ─── */}
        {selectedChapter === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-3 gap-2">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center">
                  <span className="text-2xl">📚</span>
                  <span className="text-lg font-black text-purple-600">{completedChapters}/9</span>
                  <span className="text-[10px] text-gray-500 font-semibold">فصول مكتملة</span>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center">
                  <span className="text-2xl">📊</span>
                  <span className="text-lg font-black text-fuchsia-600">{totalProgress}%</span>
                  <span className="text-[10px] text-gray-500 font-semibold">إجمالي التقدم</span>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center">
                  <span className="text-2xl">⭐</span>
                  <span className="text-lg font-black text-amber-600">
                    {completedChapters * 10}
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold">نجوم مكتسبة</span>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ─── Overall progress (only in list view) ─── */}
        {selectedChapter === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">رحلة القصة الكاملة 🗺️</span>
                  <span className="text-sm font-extrabold text-purple-600">{totalProgress}%</span>
                </div>
                <Progress
                  value={totalProgress}
                  className="h-4 rounded-full bg-purple-100 [&>div]:from-purple-400 [&>div]:to-fuchsia-500 [&>div]:bg-gradient-to-l"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Chapter Detail or Chapter List ─── */}
        <AnimatePresence mode="wait">
          {selectedStory ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <ChapterDetail
                story={selectedStory}
                masteryLevel={progressMap.get(selectedStory.tableNumber) ?? 0}
                onPlay={() => onSelectChapter(selectedStory.tableNumber)}
                onBack={() => setSelectedChapter(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                📚 فصول القصة
              </h2>
              {STORIES.map((story, idx) => {
                const mastery = progressMap.get(story.tableNumber) ?? 0;
                return (
                  <ChapterCard
                    key={story.tableNumber}
                    story={story}
                    masteryLevel={mastery}
                    index={idx}
                    onClick={() => setSelectedChapter(story.tableNumber)}
                  />
                );
              })}

              {/* Completion celebration */}
              {completedChapters === 9 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400">
                    <CardContent className="p-6 flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="text-6xl"
                      >
                        👑
                      </motion.div>
                      <h3 className="text-2xl font-black text-white">
                        مبروك! أكملت كل القصة! 🎉
                      </h3>
                      <p className="text-sm text-white/80 font-semibold">
                        أنت بطل جداول الضرب الحقيقي!
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Tip card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-l from-purple-50 to-fuchsia-50 border-r-4 border-r-purple-400">
                  <CardContent className="p-4 flex items-start gap-3">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="text-3xl shrink-0"
                    >
                      📖
                    </motion.div>
                    <div>
                      <div className="text-xs font-bold text-purple-600 mb-1">
                        نصيحة
                      </div>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                        كل فصل يحكي قصة شخصية تحتاج مساعدتك! تعلم جدول الضرب من خلال مغامرات ممتعة وساعد الأصدقاء في حل مشاكلهم! 🌟
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
