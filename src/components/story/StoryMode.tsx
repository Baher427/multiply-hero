'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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

type AppView = 'map' | 'dialogue' | 'chapter' | 'completion';
type ChapterStage = 'story1' | 'story2' | 'story3' | 'boss' | 'practice';

interface StoryDialogue {
  speaker: string;
  emoji: string;
  text: string;
}

interface StoryChapter {
  tableNumber: number;
  emoji: string;
  worldEmoji: string;
  title: string;
  characterName: string;
  characterEmoji: string;
  characterPersonality: string;
  paragraphs: [string, string, string]; // 3 story paragraphs
  bossChallenge: string;
  completion: string;
  dialogues: StoryDialogue[];
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  bgAccent: string;
  pathEmoji: string;
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
    characterPersonality: 'فضولية ومحبة للاستكشاف',
    paragraphs: [
      'في جزيرة بعيدة وسط بحرٍ لامتناهي، تعيش طفلة فضولية اسمها نور. نور تحب العد وتجمع الأصداف على الشاطئ كل صباح. كلما وجدت صدفة جميلة، تبتسم وتقول: "واحدة جديدة!" وترتبها في صفوف أنيقة.',
      'في يوم من الأيام، بينما نور تعدّ أصدافها، لاحظت شيئاً غريباً! كل صف من الأصداف يحتوي على عدد واحد فقط — صف واحد، صدفة واحدة. "لو أردت صفين، سأحتاج صدفتين!" قالت نور بحماس. "ولو أردت ثلاثة صفوف، سأحتاج ثلاث أصداف!"',
      'فجأة، ظهر صندوق سحري على الشاطئ يلمع بضوء ذهبي! على الصندوق كُتب: "لفتحي، أحسبي: كم صدفة تحتاجين لـ 4 صفوف؟ و5 صفوف؟ و6 صفوف؟" نور ابتسمت وقالت: "هذه أسهل مسألة! جدول 1 هو أصدقائي الصغار!"',
    ],
    bossChallenge: 'الصندوق السحري يتحداك! أثبتي أنك تتقنين جدول 1 وافتحي الصندوق لتحصلي على خريطة الكنز! 🗺️✨',
    completion: 'مبروك! ساعدت نور في فتح الصندوق السحري! بداخله وجدت خريطة كنز قديمة تقود إلى غابة الألغاز السحرية! نور شكرتك وقالت: "أنت بطلة حقيقية! رحلتنا تبدأ الآن!" 🗺️✨',
    dialogues: [
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'مرحباً! أنا بطل الضرب! هل أنت مستعد لمغامرة رائعة؟ 🌟' },
      { speaker: 'نور', emoji: '👧', text: 'أنا نور! وجدت صندوقاً سحرياً لكنه مقفل! هل تساعدني؟ 📦' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'بالطبع! لتفتحي الصندوق، عليكِ أولاً إتقان جدول الضرب رقم 1! 💪' },
    ],
    gradientFrom: 'from-emerald-400',
    gradientTo: 'to-green-500',
    accentColor: 'text-emerald-600',
    bgAccent: 'bg-emerald-100',
    pathEmoji: '🐚',
  },
  {
    tableNumber: 2,
    emoji: '🌳',
    worldEmoji: '🌳',
    title: 'غابة الألغاز',
    characterName: 'سالم',
    characterEmoji: '🧒',
    characterPersonality: 'شجاع ومحب للطبيعة',
    paragraphs: [
      'في غابة الألغاز الكثيفة المليئة بالأشجار السحرية، يعيش ولد شجاع اسمه سالم. سالم يحب الطبيعة ويهتم بكل شجرة وشجيرة. كل شجرة سحرية في الغابة تعطي ثماراً مضاعفة — كل ثمرة تنقسم إلى اثنتين!',
      'سالم لاحظ أن الأشجار تتكاثر بطريقة عجيبة: شجرة واحدة تعطي ثمرتين، وشجرتان تعطيان 4 ثمار، وثلاث أشجار تعطي 6 ثمار! "يا إلهي!" قال سالم، "كل شيء هنا يأتي أزواجاً! هذا جدول 2!"',
      'لكن عاصفة قوية هبّت على الغابة وأغلقت الممرات بين الأشجار! الحيوانات الصغيرة محتجزة ولا تستطيع العودة إلى بيوتها. سالم قال بتصميم: "سأفتح الممرات! كل ممر يحتاج العدد الصحيح من المفاتيح — وكلها أعداد زوجية!"',
    ],
    bossChallenge: 'عاصفة الغابة تتحداك! استخدم جدول 2 لفتح جميع الممرات وإنقاذ الحيوانات المحتجزة! كل إجابة صحيحة تفتح ممراً! 🌪️🔓',
    completion: 'أحسنت! ساعدت سالم في إنقاذ الغابة والحيوانات! الأشجار السحرية شكرتك وأزهار الغابة تفتحت فرحاً! سالم أعطاك مفتاحاً ذهبياً يقود إلى بحر الضرب العميق! 🌊🔑',
    dialogues: [
      { speaker: 'سالم', emoji: '🧒', text: 'مرحباً! أنا سالم! الغابة في خطر والعاصفة أغلقت الممرات! 🌪️' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'لا تقلق! جدول 2 هو المفتاح! كل شيء هنا يأتي أزواجاً! 🔑' },
      { speaker: 'سالم', emoji: '🧒', text: 'هيا بنا! الحيوانات تنتظر مساعدتنا! 🐿️🐰' },
    ],
    gradientFrom: 'from-lime-400',
    gradientTo: 'to-emerald-500',
    accentColor: 'text-lime-600',
    bgAccent: 'bg-lime-100',
    pathEmoji: '🍃',
  },
  {
    tableNumber: 3,
    emoji: '🌊',
    worldEmoji: '🌊',
    title: 'بحر الضرب',
    characterName: 'لؤلؤة',
    characterEmoji: '🧜‍♀️',
    characterPersonality: 'لطيفة وذكية',
    paragraphs: [
      'في أعماق بحر الضرب الأزرق العميق، تعيش حورية لطيفة وذكية اسمها لؤلؤة. لؤلؤة تجمع اللآلئ من المحار وتصنع منها عقوداً جميلة. كل محارة تحتوي على 3 لآلئ برّاقة! "واحدة، اثنتان، ثلاث!" تغني وهي تجمعها.',
      'لؤلؤة تعرف أن 2 محارة تعطي 6 لآلئ، و3 محارات تعطي 9 لآلئ. "جدول 3 مثل أغنية البحر!" قالت لؤلؤة وهي تسبح بين الشعاب المرجانية الملونة. الأسماك الصغيرة تسبح حولها فرحانة.',
      'لكن فجأة، تلاشى ضوء عقد اللآلئ السحري الذي يحمي المملكة! العقد سقط في قاع المحيط المظلم. لؤلؤة قالت بشجاعة: "لأسترجع العقد، يجب أن أفتح أبواب القاع السحيق — وكل باب يحتاج عدداً من جدول 3!"',
    ],
    bossChallenge: 'أبواب القاع السحيق مقفلة! استخدم جدول 3 لفتح كل باب واسترجاع عقد اللآلئ السحري! كل إجابة صحيحة تضيء درجاً! 🔐🌊',
    completion: 'رائع! ساعدت لؤلؤة في استرجاع عقد اللآلئ السحري! العقد أضاء المملكة بألوان قوس قزح تحت الماء! لؤلؤة أعطتك لؤلؤة سحرية تقودك إلى جبل الحكمة العظيم! ⛰️💎',
    dialogues: [
      { speaker: 'لؤلؤة', emoji: '🧜‍♀️', text: 'أهلاً وسهلاً في بحري! لكن عقد اللآلئ السحري فُقد! 😰' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'سأساعدك! كل محارة فيها 3 لآلئ — هذا جدول 3! 🦪' },
      { speaker: 'لؤلؤة', emoji: '🧜‍♀️', text: 'هيا! المملكة تحتاج نور العقد السحري! ✨' },
    ],
    gradientFrom: 'from-teal-400',
    gradientTo: 'to-cyan-500',
    accentColor: 'text-teal-600',
    bgAccent: 'bg-teal-100',
    pathEmoji: '🦪',
  },
  {
    tableNumber: 4,
    emoji: '⛰️',
    worldEmoji: '⛰️',
    title: 'جبل الحكمة',
    characterName: 'راشد',
    characterEmoji: '🧗',
    characterPersonality: 'مثابر ولا يستسلم أبداً',
    paragraphs: [
      'فوق قمم جبل الحكمة الشاهقة المكللة بالثلج، يعيش متسلق ماهر اسمه راشد. راشد لا يستسلم أبداً مهما كان الطريق صعباً! كل درجة من الجبل تتكون من 4 خطوات صغيرة. "1-2-3-4، وصلت!" يهتف وهو يتسلق.',
      'راشد يعلم أن صخرة واحدة تعني 4 خطوات، وصخرتين تعني 8 خطوات، و3 صخور تعني 12 خطوة! "جدول 4 هو سر التسلق!" قال راشد بثقة وهو ينظر إلى القمة البعيدة. النسور تحلق فوقه مبتهجة.',
      'فجأة، سمع نداء استغاثة من أعلى القمة! نسر صغير محتجز في عشه والجليد يسدّ الطريق! راشد شدّ حيلامه وقال: "سأنقذك يا صغيري! كل محطة في الطريق تحتاج أن أحسب جدول 4 لأعرف كم خطوة أحتاج!"',
    ],
    bossChallenge: 'جليد الجبل يتحداك! استخدم جدول 4 لحساب الخطوات الصحيحة وتسلق كل محطة لإنقاذ النسر الصغير! كل إجابة صحيحة تذيب جليداً! 🧊🏔️',
    completion: 'بطولي! ساعدت راشد في تسلق الجبل وإنقاذ النسر الصغير! النسر الأم حضنت صغيرها فرحانة وأعطتك ريشة سحرية تقودك إلى وادي الحلوى اللذيذ! 🍬🪶',
    dialogues: [
      { speaker: 'راشد', emoji: '🧗', text: 'أهلاً! أنا راشد وأتسلق الجبال! لكن نسراً صغيراً يحتاج مساعدة! 🦅' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'كل درجة فيها 4 خطوات — هذا جدول 4! سنصل للقمة! ⛰️' },
      { speaker: 'راشد', emoji: '🧗', text: 'هيا! لا شيء يستحيل مع المثابرة! 💪' },
    ],
    gradientFrom: 'from-amber-400',
    gradientTo: 'to-orange-500',
    accentColor: 'text-amber-600',
    bgAccent: 'bg-amber-100',
    pathEmoji: '🪨',
  },
  {
    tableNumber: 5,
    emoji: '🍬',
    worldEmoji: '🍬',
    title: 'وادي الحلوى',
    characterName: 'حلا',
    characterEmoji: '👩‍🍳',
    characterPersonality: 'مبدعة ومتفائلة دائماً',
    paragraphs: [
      'في وادي الحلوى الساحر حيث كل شيء مصنوع من الحلويات، تعيش طاهية مبدعة اسمها حلا. حلا دائماً متفائلة وتبتسم حتى في أصعب الأوقات! هي تصنع أجمل الحلويات وتضع 5 حلويات في كل صندوق مزين.',
      'صندوق واحد = 5 حلويات، وصندوقان = 10 حلويات، و3 صناديق = 15 حلوية! "جدول 5 هو وصفتي السرية!" تهمس حلا بمرح وهي تزين كعكة عملاقة بالكريمة والفواكه.',
      'مهرجان الحلوى الكبير على الأبواب وأطفال الوادي كلهم ينتظرون! لكن كارثة! وصفتها السرية فُقدت وبدونها لن تستطيع إعداد الحلوى في الوقت المحدد! حلا قالت بأمل: "أعرف أن الوصفة مخبأة خلف لغز جدول 5! سأحله!"',
    ],
    bossChallenge: 'لغز الوصفة السرية يتحداك! استخدم جدول 5 لفتح كل قفل واسترجاع الوصفة السرية قبل بدء المهرجان! كل إجابة صحيحة تكشف حرفاً من الوصفة! 📜🍬',
    completion: 'لذيذ! ساعدت حلا في استرجاع الوصفة السرية! الحلوى السحرية أضاءت الوادي بألوان مبهجة! حلا أعطتك كعكة سحرية تفتح باباً فضائياً يقود إلى الفضاء المذهل! 🚀🍩',
    dialogues: [
      { speaker: 'حلا', emoji: '👩‍🍳', text: 'مرحباً يا بطل! وصفتي السرية ضاعت! المهرجان بعد قليل! 😱' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'لا تقلقي! كل صندوق فيه 5 حلويات — جدول 5 سيحل اللغز! 🎂' },
      { speaker: 'حلا', emoji: '👩‍🍳', text: 'هيا! الأطفال ينتظرون حلوى المهرجان! 🎉' },
    ],
    gradientFrom: 'from-pink-400',
    gradientTo: 'to-rose-500',
    accentColor: 'text-pink-600',
    bgAccent: 'bg-pink-100',
    pathEmoji: '🍭',
  },
  {
    tableNumber: 6,
    emoji: '🚀',
    worldEmoji: '🚀',
    title: 'الفضاء المذهل',
    characterName: 'فارس',
    characterEmoji: '🧑‍🚀',
    characterPersonality: 'جريء ويحب المغامرات الكونية',
    paragraphs: [
      'في الفضاء المذهل البعيد بين النجوم والمجرات، يطير رائد فضاء جريء اسمه فارس. فارس يحب المغامرات ويستكشف كواكب لم يزرها أحد من قبل! في كل كوكب يكتشفه، يجد 6 نجوم برّاقة متلألئة.',
      'فارس يعرف أن كوكباً واحداً = 6 نجوم، وكوكبان = 12 نجمة، و3 كواكب = 18 نجمة! "جدول 6 هو خريطة النجوم!" قال فارس وهو يتأمل السماء من نافذة سفينته الفضائية اللامعة.',
      'فجأة، التقط إشارة استغاثة من محطة فضائية مفقودة! الرواد محتجزون والأكسجين ينفد! فارس قال بتصميم: "للوصول إليهم يجب أن أحسب المسافة بدقة باستخدام جدول 6! كل محطة توقف تحتاج العدد الصحيح من وحدات الطاقة!"',
    ],
    bossChallenge: 'المحطة الفضائية المفقودة تنادي! استخدم جدول 6 لحساب المسافات وتعبئة الوقود للوصول إليهم في الوقت المناسب! كل إجابة صحيحة تقربك من المحطة! 🛸⏰',
    completion: 'مذهل! ساعدت فارس في إنقاذ المحطة الفضائية والرواد! الرواد شكروك بحرارة وأعطوك جواز سفر سحري يقودك إلى المدينة السحرية الأسطورية! 🏰🌟',
    dialogues: [
      { speaker: 'فارس', emoji: '🧑‍🚀', text: 'إشارة استغاثة! المحطة الفضائية في خطر! 🆘' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'كل كوكب فيه 6 نجوم — جدول 6 سيقودنا! 🌟' },
      { speaker: 'فارس', emoji: '🧑‍🚀', text: 'انطلق! الوقت ينفد والأكسجين أيضاً! 🚀' },
    ],
    gradientFrom: 'from-violet-400',
    gradientTo: 'to-purple-500',
    accentColor: 'text-violet-600',
    bgAccent: 'bg-violet-100',
    pathEmoji: '🌟',
  },
  {
    tableNumber: 7,
    emoji: '🏰',
    worldEmoji: '🏰',
    title: 'المدينة السحرية',
    characterName: 'أميرة',
    characterEmoji: '👸',
    characterPersonality: 'حكيمة وشجاعة تحمي شعبها',
    paragraphs: [
      'في المدينة السحرية المحاطة بأسوار ذهبية عظيمة، تعيش أميرة حكيمة وشجاعة اسمها أميرة. أميرة تحمي مدينتها ومواطنيها بكل ما أوتيت من قوة! كل حاجز سحري في سور المدينة يتكون من 7 طوبات سحرية مضيئة.',
      'أميرة تعلم أن حاجزاً واحداً = 7 طوبات، وحاجزين = 14 طوبة، و3 حواجز = 21 طوبة! "جدول 7 هو درع مدينتي!" قالت أميرة بفخر وهي تفحص الأسوار المضيئة في ضوء القمر.',
      'لكن تنيناً شريراً يقترب من المدينة وينفث النار! الحواجز القديمة تضعف والمواطنون خائفون! أميرة وقفت بشجاعة وقالت: "سأبني حواجز جديدة! كل حاجز يحتاج جدول 7 ليكمل سحره! من يساعدني؟"',
    ],
    bossChallenge: 'التنين الشرير يقترب! استخدم جدول 7 لبناء الحواجز السحرية وحماية المدينة! كل إجابة صحيحة تبني طوبة في الحاجز! 🐉🧱',
    completion: 'شجاع! ساعدت أميرة في بناء الحواجز وهزيمة التنين! التنين تحول إلى صديق لطيف واعتذر عن أذاه! أميرة أعطتك مفتاح عالم الألوان المذهل! 🎨🐉',
    dialogues: [
      { speaker: 'أميرة', emoji: '👸', text: 'المدينة في خطر! تنين شرير يقترب! 😨🔥' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'كل حاجز فيه 7 طوبات — جدول 7 هو الدرع! 🛡️' },
      { speaker: 'أميرة', emoji: '👸', text: 'هيا نبني الحواجز قبل أن يصل التنين! ⏳' },
    ],
    gradientFrom: 'from-orange-400',
    gradientTo: 'to-red-500',
    accentColor: 'text-orange-600',
    bgAccent: 'bg-orange-100',
    pathEmoji: '🧱',
  },
  {
    tableNumber: 8,
    emoji: '🎨',
    worldEmoji: '🎨',
    title: 'عالم الألوان',
    characterName: 'بدور',
    characterEmoji: '🎨',
    characterPersonality: 'موهوبة وخيالية ترى الجمال في كل شيء',
    paragraphs: [
      'في عالم الألوان الرائع حيث كل شيء ملون وجميل، تعيش رسامة موهوبة وخيالية اسمها بدور. بدور ترى الجمال في كل شيء وتحوله إلى لوحات سحرية مذهلة! كل لوحة ترسمها تحتاج 8 ألوان مختلفة من قوس قزح السحري.',
      'بدور تعرف أن لوحة واحدة = 8 ألوان، ولوحتان = 16 لوناً، و3 لوحات = 24 لوناً! "جدول 8 هو لوحة ألواني!" قالت بدور وهي ترسم لوحة جديدة بألوان مبهرة تتلألأ كالجواهر.',
      'فجأة، بدأت ألوان عالم الألوان تتلاشى واحدة تلو الأخرى! الأشجار رمادية والسماء بيضاء والأزهار باهتة! بدور قالت بعزيمة: "اللون السحري الوحيد المتبقي يحتاج معرفة جدول 8 لإعادة كل الألوان! سأنقذ عالمي!"',
    ],
    bossChallenge: 'الألوان تتلاشى! استخدم جدول 8 لإعادة كل لون إلى عالم الألوان وإنقاذ الفن والجمال! كل إجابة صحيحة تعيد لوناً! 🌈🖌️',
    completion: 'مبدع! ساعدت بدور في إعادة الألوان إلى عالمها! كل شيء عاد جميلاً وملوناً! ألوان قوس قزح أظهرت درجاً ذهبياً سحرياً يقود إلى قمة الأبطال الأسطورية! 👑🌈',
    dialogues: [
      { speaker: 'بدور', emoji: '🎨', text: 'عالمي يفقد ألوانه! كل شيء يصبح رمادياً! 😢' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'كل لوحة تحتاج 8 ألوان — جدول 8 سيعيد الألوان! 🖌️' },
      { speaker: 'بدور', emoji: '🎨', text: 'هيا! العالم يحتاج ألوانه من جديد! 🌈' },
    ],
    gradientFrom: 'from-rose-400',
    gradientTo: 'to-pink-500',
    accentColor: 'text-rose-600',
    bgAccent: 'bg-rose-100',
    pathEmoji: '🎨',
  },
  {
    tableNumber: 9,
    emoji: '👑',
    worldEmoji: '👑',
    title: 'قمة الأبطال',
    characterName: 'سلطان',
    characterEmoji: '🤴',
    characterPersonality: 'حكيم ونبيل يحرس المعرفة',
    paragraphs: [
      'في قمة الأبطال الأسطورية فوق السحاب حيث تعيش الأساطير، ينتظر سلطان الحكمة النبيل. سلطان يحرس كنز المعرفة الأعظم منذ ألف سنة! كل كنز من كنوز المعرفة محمي بـ 9 أختام سحرية ذهبية.',
      'سلطان يعلم أن كنزاً واحداً = 9 أختام، وكنزين = 18 ختماً، و3 كنوز = 27 ختماً! "جدول 9 هو مفتاح الحكمة الأعظم!" قال سلطان بعظمته وهو يمسك عصا الحكمة المضيئة.',
      'الكنز الأعظم ينتظر بطلاً حقيقياً يثبت حكمته وشجاعته! تسعة أختام ذهبية تحمي الكنز وكل ختم يحتاج إتقان جدول 9! سلطان قال بصوت عميق: "من أتقن جدول 9، أتقن كل الجداول! فهل أنت البطل المنتظر؟"',
    ],
    bossChallenge: 'الأختام التسعة الذهبية تتحداك! استخدم جدول 9 — أصعب الجداول — لكسر كل ختم والكشف عن كنز المعرفة الأعظم! كل إجابة صحيحة تكسر ختماً! 🏆🔓',
    completion: 'أسطوري! أنت البطل الحقيقي! كسرت الأختام التسعة وفتحت كنز المعرفة الأعظم! بداخله وجدت تاج الحكمة الذهبي! أنت الآن ملك جداول الضرب! سلطان وضع التاج على رأسك وقال: "أنت أحق مني به!" 👑🏆🎉',
    dialogues: [
      { speaker: 'سلطان', emoji: '🤴', text: 'أهلاً أيها البالبطل! الكنز الأعظم ينتظر حكيماً! 👑' },
      { speaker: 'بطل الضرب', emoji: '🦸', text: 'جدول 9 — الأصعب والأعظم! أنا مستعد! 💪' },
      { speaker: 'سلطان', emoji: '🤴', text: 'أثبت حكمتك وستحصل على تاج الحكمة! ✨' },
    ],
    gradientFrom: 'from-yellow-400',
    gradientTo: 'to-amber-500',
    accentColor: 'text-yellow-600',
    bgAccent: 'bg-yellow-100',
    pathEmoji: '🗝️',
  },
];

// ─── Floating Particles ──────────────────────────────────────────────────────

function FloatingStoryElements() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        emoji: ['✨', '⭐', '💫', '🌟', '📖', '🎭', '🔮', '🎪', '🌟', '✨', '💫', '⭐', '✨', '💫'][i],
        x: Math.random() * 90 + 5,
        y: Math.random() * 85 + 5,
        size: 14 + Math.random() * 16,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 4,
        drift: -8 + Math.random() * 16,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
          animate={{
            y: [0, -14, 0],
            x: [0, p.drift, 0],
            rotate: [0, 360],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Chapter Map (Storybook Path) ───────────────────────────────────────────

function ChapterMap({
  progressMap,
  onChapterClick,
}: {
  progressMap: Map<number, { masteryLevel: number; totalAttempts: number }>;
  onChapterClick: (tableNumber: number, isUnlocked: boolean) => void;
}) {
  // Determine unlock status
  const isUnlocked = useCallback(
    (tableNumber: number): boolean => {
      if (tableNumber === 1) return true;
      const prev = progressMap.get(tableNumber - 1);
      return (prev?.totalAttempts ?? 0) > 0 || (prev?.masteryLevel ?? 0) > 0;
    },
    [progressMap]
  );

  const isCompleted = useCallback(
    (tableNumber: number): boolean => {
      return (progressMap.get(tableNumber)?.masteryLevel ?? 0) >= 80;
    },
    [progressMap]
  );

  // Zigzag positions for path effect
  const pathPositions = [
    { x: 75, y: 0 },   // 1
    { x: 25, y: 11 },  // 2
    { x: 75, y: 22 },  // 3
    { x: 25, y: 33 },  // 4
    { x: 75, y: 44 },  // 5
    { x: 25, y: 55 },  // 6
    { x: 75, y: 66 },  // 7
    { x: 25, y: 77 },  // 8
    { x: 50, y: 88 },  // 9 - center for finale
  ];

  return (
    <div className="relative w-full" style={{ minHeight: 780 }}>
      {/* SVG connecting path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ minHeight: 780 }}
        preserveAspectRatio="none"
      >
        <motion.path
          d={pathPositions
            .map((p, i) =>
              i === 0 ? `M ${p.x}% ${p.y + 3}%` : `L ${p.x}% ${p.y + 3}%`
            )
            .join(' ')}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="4"
          strokeDasharray="8 6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>

      {/* Chapter nodes */}
      {STORIES.map((story, idx) => {
        const pos = pathPositions[idx];
        const unlocked = isUnlocked(story.tableNumber);
        const completed = isCompleted(story.tableNumber);
        const mastery = progressMap.get(story.tableNumber)?.masteryLevel ?? 0;

        return (
          <motion.div
            key={story.tableNumber}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: idx * 0.1,
            }}
          >
            <motion.button
              onClick={() => onChapterClick(story.tableNumber, unlocked)}
              whileHover={unlocked ? { scale: 1.12 } : {}}
              whileTap={unlocked ? { scale: 0.93 } : {}}
              className={`relative flex flex-col items-center gap-1 ${
                unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              {/* Node circle */}
              <div
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 transition-all ${
                  completed
                    ? `bg-gradient-to-br ${story.gradientFrom} ${story.gradientTo} border-white/60 shadow-xl`
                    : unlocked
                      ? `bg-gradient-to-br ${story.gradientFrom} ${story.gradientTo} border-white/40 shadow-md`
                      : 'bg-gray-300/80 border-gray-400/40 shadow-sm'
                }`}
              >
                {/* Status indicator */}
                {completed ? (
                  <motion.div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <span className="text-xs">✅</span>
                  </motion.div>
                ) : !unlocked ? (
                  <motion.div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center shadow-md border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-xs">🔒</span>
                  </motion.div>
                ) : null}

                {/* Content */}
                {unlocked ? (
                  <>
                    <span className="text-2xl md:text-3xl">
                      {story.worldEmoji}
                    </span>
                    <span className="text-[8px] md:text-[10px] font-black text-white/90 leading-none">
                      ×{story.tableNumber}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl md:text-3xl opacity-50">🔒</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-500/70 leading-none">
                      ×{story.tableNumber}
                    </span>
                  </>
                )}

                {/* Mastery bar for in-progress */}
                {unlocked && !completed && mastery > 0 && (
                  <div className="absolute -bottom-1 left-1 right-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white/80 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 + 0.5 }}
                    />
                  </div>
                )}

                {/* Sparkle effect for completed */}
                {completed && (
                  <motion.div
                    className="absolute -inset-2 rounded-2xl"
                    animate={{
                      boxShadow: [
                        '0 0 0px rgba(255,255,255,0)',
                        '0 0 12px rgba(255,255,200,0.4)',
                        '0 0 0px rgba(255,255,255,0)',
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  />
                )}
              </div>

              {/* Chapter label */}
              <span
                className={`text-[9px] md:text-[11px] font-bold leading-tight text-center max-w-[72px] md:max-w-[90px] ${
                  completed ? 'text-gray-800' : unlocked ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {story.title}
              </span>
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Animated Dialogue Sequence ──────────────────────────────────────────────

function DialogueSequence({
  dialogues,
  onComplete,
  characterEmoji,
  characterName,
}: {
  dialogues: StoryDialogue[];
  onComplete: () => void;
  characterEmoji: string;
  characterName: string;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentDialogue = dialogues[currentIdx];

  // Typewriter effect
  useEffect(() => {
    if (!currentDialogue) return;
    setDisplayedText('');
    setIsTyping(true);
    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx++;
      setDisplayedText(currentDialogue.text.slice(0, charIdx));
      if (charIdx >= currentDialogue.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [currentIdx, currentDialogue]);

  const handleNext = () => {
    if (isTyping) {
      // Skip typing, show full text
      setDisplayedText(currentDialogue.text);
      setIsTyping(false);
      return;
    }
    if (currentIdx < dialogues.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete();
    }
  };

  if (!currentDialogue) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6 items-center"
      onClick={handleNext}
    >
      {/* Character display */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="text-7xl md:text-8xl"
      >
        {currentDialogue.emoji}
      </motion.div>

      {/* Speaker name */}
      <motion.div
        key={`name-${currentIdx}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Badge className="bg-gradient-to-l from-purple-500 to-fuchsia-500 text-white border-0 font-bold text-sm px-4 py-1">
          {currentDialogue.speaker}
        </Badge>
      </motion.div>

      {/* Dialogue bubble */}
      <motion.div
        key={`bubble-${currentIdx}`}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-sm"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm relative overflow-visible">
          {/* Speech bubble tail */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/95 rotate-45 rounded-sm" />
          <CardContent className="p-5 pt-6">
            <p className="text-base md:text-lg font-semibold text-slate-800 leading-relaxed text-center min-h-[48px]">
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="inline-block w-0.5 h-5 bg-slate-800 mr-0.5 align-middle"
                />
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tap indicator */}
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="text-xs text-slate-400 font-semibold"
      >
        {currentIdx < dialogues.length - 1 ? 'اضغط للمتابعة ←' : 'اضغط للبدء! 🎮'}
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {dialogues.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIdx
                ? 'bg-purple-500 scale-125'
                : i < currentIdx
                  ? 'bg-purple-300'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Chapter Detail (Book-like Design) ───────────────────────────────────────

function ChapterDetail({
  story,
  masteryLevel,
  onPlay,
  onBack,
  onComplete,
}: {
  story: StoryChapter;
  masteryLevel: number;
  onPlay: () => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [stage, setStage] = useState<ChapterStage>('story1');

  const stageOrder: ChapterStage[] = ['story1', 'story2', 'story3', 'boss', 'practice'];
  const currentStageIdx = stageOrder.indexOf(stage);
  const isChapterCompleted = masteryLevel >= 80;

  const stageContent: Record<ChapterStage, { title: string; emoji: string; text: string }> = {
    story1: { title: 'البداية', emoji: '📖', text: story.paragraphs[0] },
    story2: { title: 'التطور', emoji: '🌟', text: story.paragraphs[1] },
    story3: { title: 'المواجهة', emoji: '⚡', text: story.paragraphs[2] },
    boss: { title: 'تحدّي الزعيم', emoji: '👾', text: story.bossChallenge },
    practice: { title: 'المعركة', emoji: '⚔️', text: 'حان وقت المعركة! أجب على الأسئلة لهزيمة الزعيم وإكمال الفصل!' },
  };

  const handleNext = () => {
    if (stage === 'practice') {
      onPlay();
      return;
    }
    const nextIdx = currentStageIdx + 1;
    if (nextIdx < stageOrder.length) {
      setStage(stageOrder[nextIdx]);
    } else {
      onComplete();
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

  // Get star count
  const starsEarned = masteryLevel >= 90 ? 3 : masteryLevel >= 70 ? 2 : masteryLevel >= 40 ? 1 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Page indicator */}
      <div className="flex items-center gap-2 justify-center">
        {stageOrder.map((s, idx) => (
          <motion.button
            key={s}
            onClick={() => {
              // Allow navigating back to any completed stage or current
              if (idx <= currentStageIdx || (isChapterCompleted && idx < stageOrder.length - 1)) {
                setStage(s);
              }
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              idx === currentStageIdx
                ? `bg-gradient-to-br ${story.gradientFrom} ${story.gradientTo} text-white shadow-lg scale-110`
                : idx < currentStageIdx || (isChapterCompleted && idx < stageOrder.length - 1)
                  ? 'bg-emerald-400 text-white'
                  : 'bg-gray-200 text-gray-400'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {idx < currentStageIdx ? '✓' : idx + 1}
          </motion.button>
        ))}
      </div>

      {/* Story content card - book-like design */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, rotateY: -15, scale: 0.92 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: 15, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          style={{ perspective: 1200 }}
        >
          <Card
            className={`border-0 shadow-2xl overflow-hidden bg-gradient-to-br ${story.gradientFrom} ${story.gradientTo} relative rounded-3xl`}
          >
            {/* Book page curl effect */}
            <div className="absolute top-0 left-0 w-12 h-12 z-20">
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(225deg, transparent 50%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.02) 60%, transparent 60%)',
                }}
              />
            </div>

            {/* Decorative background */}
            <div className="absolute inset-0 opacity-10 overflow-hidden">
              <motion.div
                className="absolute top-4 left-6 text-7xl rotate-12"
                animate={{ rotate: [12, 18, 12] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              >
                {story.worldEmoji}
              </motion.div>
              <motion.div
                className="absolute bottom-4 right-8 text-6xl -rotate-6"
                animate={{ rotate: [-6, 2, -6] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              >
                {story.characterEmoji}
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">
                {story.pathEmoji}
              </div>
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
                  {stage === 'boss' ? '👾' : stage === 'practice' ? '⚔️' : story.characterEmoji}
                </motion.div>
                <div>
                  <Badge className="bg-white/25 text-white border-0 font-bold text-xs">
                    {content.title} {content.emoji}
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                    {story.title}
                  </h2>
                  <p className="text-[10px] text-white/60 font-semibold">
                    {story.characterName} — {story.characterPersonality}
                  </p>
                </div>
              </div>

              {/* Illustration area */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-center gap-3 text-3xl md:text-4xl">
                  {stage === 'story1' && (
                    <>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        {story.characterEmoji}
                      </motion.span>
                      <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                        {story.worldEmoji}
                      </motion.span>
                      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        ✨
                      </motion.span>
                    </>
                  )}
                  {stage === 'story2' && (
                    <>
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        🧮
                      </motion.span>
                      <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        {story.pathEmoji}
                      </motion.span>
                      <motion.span animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 8 }}>
                        💡
                      </motion.span>
                    </>
                  )}
                  {stage === 'story3' && (
                    <>
                      <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                        ⚡
                      </motion.span>
                      <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        {story.characterEmoji}
                      </motion.span>
                      <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        ❗
                      </motion.span>
                    </>
                  )}
                  {stage === 'boss' && (
                    <>
                      <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        👾
                      </motion.span>
                      <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        🔥
                      </motion.span>
                      <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        ⚔️
                      </motion.span>
                    </>
                  )}
                  {stage === 'practice' && (
                    <>
                      <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        🎯
                      </motion.span>
                      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        💪
                      </motion.span>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        🏆
                      </motion.span>
                    </>
                  )}
                </div>
              </div>

              {/* Narrative text - book page style */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4 relative">
                {/* Decorative quote mark */}
                <div className="absolute top-1 right-2 text-4xl text-white/10 font-serif leading-none">
                  &ldquo;
                </div>
                <p className="text-white text-base md:text-lg font-semibold leading-relaxed relative z-10">
                  {content.text}
                </p>
                <div className="absolute bottom-1 left-2 text-4xl text-white/10 font-serif leading-none rotate-180">
                  &ldquo;
                </div>
              </div>

              {/* Boss challenge flair */}
              {stage === 'boss' && (
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(255,100,50,0)',
                      '0 0 20px rgba(255,100,50,0.3)',
                      '0 0 0px rgba(255,100,50,0)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/20 text-center"
                >
                  <span className="text-white font-black text-lg">👾 تحدّي الزعيم! 👾</span>
                </motion.div>
              )}

              {/* Mastery progress (in practice stage) */}
              {stage === 'practice' && (
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white/80">مستوى الإتقان</span>
                    <span className="text-xs font-extrabold text-white">{Math.round(masteryLevel)}%</span>
                  </div>
                  <Progress
                    value={masteryLevel}
                    className="h-3 rounded-full bg-white/25 [&>div]:from-white/80 [&>div]:to-white [&>div]:bg-gradient-to-l"
                  />
                  {/* Stars preview */}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3].map((s) => (
                      <motion.span
                        key={s}
                        className="text-xl"
                        animate={s <= starsEarned ? { scale: [1, 1.2, 1] } : {}}
                        transition={s <= starsEarned ? { repeat: Infinity, duration: 1.5, delay: s * 0.2 } : {}}
                      >
                        {s <= starsEarned ? '⭐' : '☆'}
                      </motion.span>
                    ))}
                  </div>
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
            ? '⚔️ ابدأ المعركة!'
            : stage === 'boss'
              ? '⚔️ واجه الزعيم!'
              : '← التالي'}
        </Button>
      </div>
    </div>
  );
}

// ─── Chapter Completion Screen ───────────────────────────────────────────────

function ChapterCompletion({
  story,
  masteryLevel,
  onNextChapter,
  onBackToMap,
}: {
  story: StoryChapter;
  masteryLevel: number;
  onNextChapter: () => void;
  onBackToMap: () => void;
}) {
  const starsEarned = masteryLevel >= 90 ? 3 : masteryLevel >= 70 ? 2 : masteryLevel >= 40 ? 1 : 0;

  // Celebration particles
  const celebrationEmojis = useMemo(
    () => ['🎉', '⭐', '✨', '🏆', '🌟', '💫', '🎊', '👑'],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 items-center"
    >
      {/* Celebration particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {celebrationEmojis.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 11}%`,
              fontSize: 20 + Math.random() * 16,
            }}
            initial={{ y: -50, opacity: 0, rotate: 0 }}
            animate={{
              y: window.innerHeight + 50,
              opacity: [0, 1, 1, 0],
              rotate: 360 * (i % 2 === 0 ? 1 : -1),
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeOut',
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Main completion card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-full relative z-10"
      >
        <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-300 rounded-3xl">
          <CardContent className="p-6 md:p-8 flex flex-col items-center gap-4">
            {/* Trophy */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="text-6xl md:text-7xl"
            >
              🏆
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-3xl font-black text-amber-900 text-center"
            >
              أكملت الفصل {story.tableNumber}! 🎉
            </motion.h2>

            {/* Chapter name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Badge className="bg-amber-800/20 text-amber-900 border-0 font-bold text-sm px-4 py-1">
                {story.worldEmoji} {story.title}
              </Badge>
            </motion.div>

            {/* Stars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.9 }}
              className="flex items-center gap-2"
            >
              {[1, 2, 3].map((s) => (
                <motion.span
                  key={s}
                  className="text-4xl md:text-5xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={s <= starsEarned ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                    delay: 1 + s * 0.2,
                  }}
                >
                  {s <= starsEarned ? '⭐' : '☆'}
                </motion.span>
              ))}
            </motion.div>

            {/* Story conclusion */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="bg-white/40 backdrop-blur-sm rounded-xl p-4 w-full"
            >
              <p className="text-amber-900 text-base md:text-lg font-semibold leading-relaxed text-center">
                {story.completion}
              </p>
            </motion.div>

            {/* Mastery info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="flex items-center gap-4 text-sm font-bold text-amber-800"
            >
              <span>📊 {Math.round(masteryLevel)}% إتقان</span>
              <span>⭐ {starsEarned} نجوم</span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="w-full flex flex-col gap-3"
      >
        {story.tableNumber < 9 && (
          <Button
            onClick={onNextChapter}
            className="h-14 rounded-2xl font-bold text-lg shadow-lg bg-gradient-to-l from-purple-500 to-fuchsia-500 text-white border-0 hover:opacity-90"
          >
            📖 الفصل التالي ←
          </Button>
        )}
        <Button
          onClick={onBackToMap}
          variant="outline"
          className="h-12 rounded-xl font-bold text-sm bg-white/80"
        >
          🗺️ العودة لخريطة القصة
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StoryMode({
  tableProgress,
  onSelectChapter,
  onBack,
}: StoryModeProps) {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  // Build progress map with full data
  const progressMap = useMemo(() => {
    const map = new Map<number, { masteryLevel: number; totalAttempts: number }>();
    tableProgress.forEach((tp) =>
      map.set(tp.tableNumber, {
        masteryLevel: tp.masteryLevel,
        totalAttempts: tp.totalAttempts,
      })
    );
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

  // Is a chapter completed?
  const isChapterCompleted = useMemo(() => {
    if (selectedChapter === null) return false;
    return (progressMap.get(selectedChapter)?.masteryLevel ?? 0) >= 80;
  }, [selectedChapter, progressMap]);

  // Check if a chapter is unlocked
  const isUnlocked = useCallback(
    (tableNumber: number): boolean => {
      if (tableNumber === 1) return true;
      const prev = progressMap.get(tableNumber - 1);
      return (prev?.totalAttempts ?? 0) > 0 || (prev?.masteryLevel ?? 0) > 0;
    },
    [progressMap]
  );

  // Handle chapter click from map
  const handleChapterClick = (tableNumber: number, unlocked: boolean) => {
    if (!unlocked) return;
    setSelectedChapter(tableNumber);

    // If chapter already completed, go directly to chapter detail
    const mastery = progressMap.get(tableNumber)?.masteryLevel ?? 0;
    if (mastery >= 80) {
      setCurrentView('chapter');
      setShowCompletion(true);
    } else {
      setCurrentView('dialogue');
      setShowCompletion(false);
    }
  };

  // Handle dialogue complete -> go to chapter
  const handleDialogueComplete = () => {
    setCurrentView('chapter');
  };

  // Handle play from chapter detail
  const handlePlay = () => {
    if (selectedChapter !== null) {
      onSelectChapter(selectedChapter);
    }
  };

  // Handle chapter complete
  const handleChapterComplete = () => {
    if (isChapterCompleted) {
      setCurrentView('completion');
    }
  };

  // Handle next chapter
  const handleNextChapter = () => {
    if (selectedChapter !== null && selectedChapter < 9) {
      const nextTable = selectedChapter + 1;
      if (isUnlocked(nextTable)) {
        setSelectedChapter(nextTable);
        setCurrentView('dialogue');
        setShowCompletion(false);
      } else {
        setCurrentView('map');
        setSelectedChapter(null);
      }
    }
  };

  // Handle back to map
  const handleBackToMap = () => {
    setCurrentView('map');
    setSelectedChapter(null);
    setShowCompletion(false);
  };

  // Background gradient based on story
  const bgStyle = selectedStory
    ? `linear-gradient(135deg, #fdf4ff 0%, #fce7f3 30%, #f3e8ff 60%, #ede9fe 100%)`
    : 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 30%, #fef3c7 60%, #d1fae5 100%)';

  return (
    <div dir="rtl" className="min-h-screen w-full pb-8" style={{ background: bgStyle }}>
      <FloatingStoryElements />

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
                    if (currentView === 'map') {
                      onBack();
                    } else {
                      handleBackToMap();
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
                    {currentView === 'map'
                      ? 'عش المغامرات وتعلم الجداول!'
                      : currentView === 'dialogue'
                        ? `مقدمة الفصل ${selectedChapter}`
                        : currentView === 'completion'
                          ? `أكملت الفصل ${selectedChapter}!`
                          : `الفصل ${selectedChapter} - ${selectedStory?.title}`}
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

        {/* ─── Stats (only in map view) ─── */}
        {currentView === 'map' && (
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
                  <span className="text-lg font-black text-amber-600">{completedChapters * 10}</span>
                  <span className="text-[10px] text-gray-500 font-semibold">نجوم مكتسبة</span>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ─── Overall progress (only in map view) ─── */}
        {currentView === 'map' && (
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

        {/* ─── Main Content Area ─── */}
        <AnimatePresence mode="wait">
          {currentView === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-col gap-4"
            >
              {/* Chapter Map */}
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                🗺️ خريطة المغامرة
              </h2>
              <ChapterMap progressMap={progressMap} onChapterClick={handleChapterClick} />

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
                      <h3 className="text-2xl font-black text-white">مبروك! أكملت كل القصة! 🎉</h3>
                      <p className="text-sm text-white/80 font-semibold">أنت بطل جداول الضرب الحقيقي!</p>
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
                      <div className="text-xs font-bold text-purple-600 mb-1">نصيحة</div>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                        كل فصل يحكي قصة شخصية تحتاج مساعدتك! تعلم جدول الضرب من خلال مغامرات ممتعة وساعد
                        الأصدقاء في حل مشاكلهم! أكمل فصلاً لفتح الفصل التالي! 🌟
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {currentView === 'dialogue' && selectedStory && (
            <motion.div
              key="dialogue"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="pt-8"
            >
              <DialogueSequence
                dialogues={selectedStory.dialogues}
                onComplete={handleDialogueComplete}
                characterEmoji={selectedStory.characterEmoji}
                characterName={selectedStory.characterName}
              />
            </motion.div>
          )}

          {currentView === 'chapter' && selectedStory && (
            <motion.div
              key="chapter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <ChapterDetail
                story={selectedStory}
                masteryLevel={progressMap.get(selectedStory.tableNumber)?.masteryLevel ?? 0}
                onPlay={handlePlay}
                onBack={handleBackToMap}
                onComplete={handleChapterComplete}
              />
            </motion.div>
          )}

          {currentView === 'completion' && selectedStory && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="pt-4"
            >
              <ChapterCompletion
                story={selectedStory}
                masteryLevel={progressMap.get(selectedStory.tableNumber)?.masteryLevel ?? 0}
                onNextChapter={handleNextChapter}
                onBackToMap={handleBackToMap}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
