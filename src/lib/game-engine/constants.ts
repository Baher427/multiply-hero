export const AVATARS = [
  // Animals
  { id: 'lion', name: 'أسد', emoji: '🦁', category: 'animal' as const, unlockLevel: 1 },
  { id: 'cat', name: 'قطة', emoji: '🐱', category: 'animal' as const, unlockLevel: 1 },
  { id: 'bear', name: 'دب', emoji: '🐻', category: 'animal' as const, unlockLevel: 1 },
  { id: 'rabbit', name: 'أرنب', emoji: '🐰', category: 'animal' as const, unlockLevel: 1 },
  { id: 'elephant', name: 'فيل', emoji: '🐘', category: 'animal' as const, unlockLevel: 2 },
  { id: 'tiger', name: 'نمر', emoji: '🐯', category: 'animal' as const, unlockLevel: 2 },
  { id: 'dog', name: 'كلب', emoji: '🐶', category: 'animal' as const, unlockLevel: 1 },
  { id: 'owl', name: 'بومة', emoji: '🦉', category: 'animal' as const, unlockLevel: 3 },
  { id: 'monkey', name: 'قرد', emoji: '🐵', category: 'animal' as const, unlockLevel: 3 },
  { id: 'panda', name: 'باندا', emoji: '🐼', category: 'animal' as const, unlockLevel: 4 },
  { id: 'frog', name: 'ضفدع', emoji: '🐸', category: 'animal' as const, unlockLevel: 2 },
  { id: 'penguin', name: 'بطريق', emoji: '🐧', category: 'animal' as const, unlockLevel: 5 },
  { id: 'fox', name: 'ثعلب', emoji: '🦊', category: 'animal' as const, unlockLevel: 4 },
  { id: 'unicorn', name: 'يونيكورن', emoji: '🦄', category: 'animal' as const, unlockLevel: 6 },
  { id: 'dragon', name: 'تنين', emoji: '🐉', category: 'animal' as const, unlockLevel: 8 },
  // Emoji/Faces
  { id: 'star-face', name: 'نجم سعيد', emoji: '🤩', category: 'emoji' as const, unlockLevel: 1 },
  { id: 'cool-face', name: 'رائع', emoji: '😎', category: 'emoji' as const, unlockLevel: 2 },
  { id: 'heart-face', name: 'قلب', emoji: '😍', category: 'emoji' as const, unlockLevel: 1 },
  { id: 'party-face', name: 'حفلة', emoji: '🥳', category: 'emoji' as const, unlockLevel: 3 },
  { id: 'nerd-face', name: 'ذكي', emoji: '🤓', category: 'emoji' as const, unlockLevel: 5 },
  // Fruits
  { id: 'apple', name: 'تفاحة', emoji: '🍎', category: 'fruit' as const, unlockLevel: 1 },
  { id: 'strawberry', name: 'فراولة', emoji: '🍓', category: 'fruit' as const, unlockLevel: 2 },
  { id: 'watermelon', name: 'بطيخة', emoji: '🍉', category: 'fruit' as const, unlockLevel: 3 },
  { id: 'banana', name: 'موزة', emoji: '🍌', category: 'fruit' as const, unlockLevel: 1 },
  // Objects
  { id: 'rocket', name: 'صاروخ', emoji: '🚀', category: 'object' as const, unlockLevel: 4 },
  { id: 'crown', name: 'تاج', emoji: '👑', category: 'object' as const, unlockLevel: 7 },
  { id: 'gem', name: 'جوهرة', emoji: '💎', category: 'object' as const, unlockLevel: 6 },
  { id: 'trophy', name: 'كأس', emoji: '🏆', category: 'object' as const, unlockLevel: 9 },
  { id: 'rainbow', name: 'قوس قزح', emoji: '🌈', category: 'object' as const, unlockLevel: 5 },
  { id: 'balloon', name: 'بالون', emoji: '🎈', category: 'object' as const, unlockLevel: 1 },
];

export const WORLD_THEMES = [
  { tableNumber: 1, name: 'جزيرة الأرقام', emoji: '🏝️', bgColor: 'from-emerald-100 to-teal-100', accentColor: 'emerald', description: 'ابدأ رحلتك مع جدول 1!' },
  { tableNumber: 2, name: 'غابة الألغاز', emoji: '🌳', bgColor: 'from-green-100 to-lime-100', accentColor: 'green', description: 'اكتشف أسرار جدول 2!' },
  { tableNumber: 3, name: 'بحر الضرب', emoji: '🌊', bgColor: 'from-cyan-100 to-blue-100', accentColor: 'cyan', description: 'أبحر في جدول 3!' },
  { tableNumber: 4, name: 'جبل الحكمة', emoji: '⛰️', bgColor: 'from-amber-100 to-yellow-100', accentColor: 'amber', description: 'تسلق جدول 4!' },
  { tableNumber: 5, name: 'وادي الحلوى', emoji: '🍬', bgColor: 'from-pink-100 to-rose-100', accentColor: 'pink', description: 'استمتع بجدول 5!' },
  { tableNumber: 6, name: 'الفضاء المذهل', emoji: '🚀', bgColor: 'from-violet-100 to-purple-100', accentColor: 'violet', description: 'انطلق مع جدول 6!' },
  { tableNumber: 7, name: 'المدينة السحرية', emoji: '🏰', bgColor: 'from-orange-100 to-red-100', accentColor: 'orange', description: 'اكتشف سحر جدول 7!' },
  { tableNumber: 8, name: 'عالم الألوان', emoji: '🎨', bgColor: 'from-fuchsia-100 to-pink-100', accentColor: 'fuchsia', description: 'ارسم جدول 8!' },
  { tableNumber: 9, name: 'قمة الأبطال', emoji: '👑', bgColor: 'from-yellow-100 to-amber-100', accentColor: 'yellow', description: 'أبط جدول 9!' },
];

export const BADGE_DEFINITIONS = [
  { type: 'first-game' as const, name: 'البداية', description: 'أول لعبة لك!', icon: '🎮', requirement: 'أكمل أول لعبة' },
  { type: 'table-master-1' as const, name: 'بطل جدول 1', description: 'أتقنت جدول 1', icon: '🏆', requirement: 'إتقان جدول 1' },
  { type: 'table-master-2' as const, name: 'بطل جدول 2', description: 'أتقنت جدول 2', icon: '🏆', requirement: 'إتقان جدول 2' },
  { type: 'table-master-3' as const, name: 'بطل جدول 3', description: 'أتقنت جدول 3', icon: '🏆', requirement: 'إتقان جدول 3' },
  { type: 'table-master-4' as const, name: 'بطل جدول 4', description: 'أتقنت جدول 4', icon: '🏆', requirement: 'إتقان جدول 4' },
  { type: 'table-master-5' as const, name: 'بطل جدول 5', description: 'أتقنت جدول 5', icon: '🏆', requirement: 'إتقان جدول 5' },
  { type: 'table-master-6' as const, name: 'بطل جدول 6', description: 'أتقنت جدول 6', icon: '🏆', requirement: 'إتقان جدول 6' },
  { type: 'table-master-7' as const, name: 'بطل جدول 7', description: 'أتقنت جدول 7', icon: '🏆', requirement: 'إتقان جدول 7' },
  { type: 'table-master-8' as const, name: 'بطل جدول 8', description: 'أتقنت جدول 8', icon: '🏆', requirement: 'إتقان جدول 8' },
  { type: 'table-master-9' as const, name: 'بطل جدول 9', description: 'أتقنت جدول 9', icon: '🏆', requirement: 'إتقان جدول 9' },
  { type: 'combo-5' as const, name: 'سلسلة 5', description: '5 إجابات صحيحة متتالية', icon: '🔥', requirement: '5 إجابات صحيحة متتالية' },
  { type: 'combo-10' as const, name: 'سلسلة 10', description: '10 إجابات صحيحة متتالية', icon: '💥', requirement: '10 إجابات صحيحة متتالية' },
  { type: 'combo-25' as const, name: 'سلسلة 25', description: '25 إجابات صحيحة متتالية', icon: '⚡', requirement: '25 إجابات صحيحة متتالية' },
  { type: 'combo-50' as const, name: 'سلسلة 50', description: '50 إجابات صحيحة متتالية', icon: '🌟', requirement: '50 إجابات صحيحة متتالية' },
  { type: 'speed-demon' as const, name: 'سرعة البرق', description: 'أجبت في أقل من 3 ثوان', icon: '⚡', requirement: 'إجابة سريعة جداً' },
  { type: 'daily-warrior' as const, name: 'محارب يومي', description: 'أكمل التحدي اليومي', icon: '📅', requirement: 'أكمل تحدي يومي' },
  { type: 'streak-3' as const, name: 'مواظب 3 أيام', description: '3 أيام متتالية', icon: '🔥', requirement: 'العب 3 أيام متتالية' },
  { type: 'streak-7' as const, name: 'مواظب أسبوع', description: '7 أيام متتالية', icon: '💫', requirement: 'العب 7 أيام متتالية' },
  { type: 'streak-14' as const, name: 'مواظب أسبوعين', description: '14 يوماً متتالياً', icon: '⭐', requirement: 'العب 14 يوماً متتالياً' },
  { type: 'streak-30' as const, name: 'مواظب شهر', description: '30 يوماً متتالياً', icon: '👑', requirement: 'العب 30 يوماً متتالياً' },
  { type: 'points-100' as const, name: '100 نقطة', description: 'جمعت 100 نقطة', icon: '💯', requirement: 'اجمع 100 نقطة' },
  { type: 'points-500' as const, name: '500 نقطة', description: 'جمعت 500 نقطة', icon: '🎯', requirement: 'اجمع 500 نقطة' },
  { type: 'points-1000' as const, name: '1000 نقطة', description: 'جمعت 1000 نقطة', icon: '🎪', requirement: 'اجمع 1000 نقطة' },
  { type: 'points-5000' as const, name: '5000 نقطة', description: 'جمعت 5000 نقطة', icon: '🏅', requirement: 'اجمع 5000 نقطة' },
  { type: 'perfect-game' as const, name: 'لعبة مثالية', description: 'بدون أي خطأ!', icon: '✨', requirement: 'أكمل لعبة بدون أخطاء' },
  { type: 'explorer' as const, name: 'مستكشف', description: 'العب كل أنواع الألعاب', icon: '🗺️', requirement: 'جرّب كل الألعاب' },
  { type: 'all-tables' as const, name: 'بطل الكل', description: 'أتقنت كل الجداول!', icon: '🎓', requirement: 'إتقان كل الجداول' },
];

export const COLORS = [
  { id: 'emerald', name: 'أخضر', value: '#10b981' },
  { id: 'cyan', name: 'سماوي', value: '#06b6d4' },
  { id: 'amber', name: 'ذهبي', value: '#f59e0b' },
  { id: 'rose', name: 'وردي', value: '#f43f5e' },
  { id: 'violet', name: 'بنفسجي', value: '#8b5cf6' },
  { id: 'orange', name: 'برتقالي', value: '#f97316' },
  { id: 'teal', name: 'تيل', value: '#14b8a6' },
  { id: 'pink', name: 'وردي فاتح', value: '#ec4899' },
];

export const COACH_MESSAGES = {
  encouragement: [
    'أنت رائع! استمر! 🌟',
    'يا بطل، أنت تقترب! 💪',
    'ممتاز! أنت ذكي جداً! 🧠',
    'واصل المحاولة، أنت تبلي حسناً! ⭐',
    'لا تستسلم، أنت قوي! 💫',
    'كل محاولة تجعلك أفضل! 🎯',
    'أنت نجم اليوم! ⭐',
    'عظيم! أنت تتعلم بسرعة! 🚀',
  ],
  hint: [
    'فكّر: كم مرة يتكرر العدد؟ 🤔',
    'جرّب أن تضيف العدد على نفسه 📝',
    'تذكر: الضرب هو جمع متكرر 💡',
    'اقسم الإجابة على العدد الأول 🎯',
    'فكّر بالجدول الذي درسته 📚',
  ],
  celebration: [
    '🎉 أحسنت! إجابة صحيحة!',
    '🌟 ممتاز! أنت عبقري!',
    '🏆 رائع! أنت بطل!',
    '💎 مذهل! أنت الأفضل!',
    '🚀 ممتاز! انطلقت!',
    '⭐ إجابة مثالية!',
    '🔥 سلسلة رائعة!',
  ],
  comfort: [
    'لا بأس! الأخطاء جزء من التعلم 💚',
    'حاول مرة أخرى، أنت تستطيع! 🌈',
    'لا تقلق، الجميع يخطئ! 😊',
    'الإجابة الصحيحة ظهرت، تذكرها! 📝',
    'كل خطأ يجعلك أقوى! 💪',
  ],
  guidance: [
    'جرّب جدول {table}، يحتاج تمرين أكثر 🎯',
    'أنت جيد في جدول {strongTable}! واصل! ⭐',
    'التحدي اليومي ينتظرك! 📅',
    'لديك نجوم كافية لفتح شخصية جديدة! 🎁',
  ],
};

export function getRandomCoachMessage(type: keyof typeof COACH_MESSAGES): string {
  const messages = COACH_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
}
