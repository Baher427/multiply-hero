'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Coins, Gem, Star, Clock, Sparkles, Heart, Package, Tag, Flame, Crown, Palette, Zap, Shield, Timer } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ShopPageProps {
  currentChild: {
    id: string;
    name: string;
    displayName: string;
    avatarId: string;
    coins: number;
    gems: number;
    points: number;
    level: number;
  };
  onBack: () => void;
  onPurchase: (itemType: string, itemId: string, cost: number, currency: 'coins' | 'gems') => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'coins' | 'gems';
  category: 'avatars' | 'backgrounds' | 'powerups' | 'themes';
  previewGradient: string;
  iconChar: string;
  isNew?: boolean;
  isPopular?: boolean;
  levelRequired?: number;
  bundle?: { items: string[]; originalCost: number };
}

// ─── Items ───────────────────────────────────────────────────────────────────

const AVATAR_ITEMS: ShopItem[] = [
  { id: 'avatar-phoenix', name: 'العنقاء', description: 'طائر ناري أسطوري!', cost: 200, currency: 'coins', category: 'avatars', previewGradient: 'from-red-400 to-orange-500', iconChar: '🔥', isPopular: true },
  { id: 'avatar-wizard', name: 'الساحر', description: 'ساحر حكيم وقوي!', cost: 150, currency: 'coins', category: 'avatars', previewGradient: 'from-purple-400 to-fuchsia-500', iconChar: '🧙' },
  { id: 'avatar-astronaut', name: 'رائد فضاء', description: 'استكشف الكون!', cost: 180, currency: 'coins', category: 'avatars', previewGradient: 'from-sky-400 to-cyan-500', iconChar: '🚀', isNew: true },
  { id: 'avatar-ninja', name: 'النينجا', description: 'سريع كالريح!', cost: 160, currency: 'coins', category: 'avatars', previewGradient: 'from-slate-600 to-slate-800', iconChar: '🥷' },
  { id: 'avatar-princess', name: 'الأميرة', description: 'ملكة المملكة!', cost: 120, currency: 'coins', category: 'avatars', previewGradient: 'from-pink-400 to-rose-500', iconChar: '👸', isPopular: true },
  { id: 'avatar-dragon', name: 'التنين', description: 'قوة لا تُقهر!', cost: 50, currency: 'gems', category: 'avatars', previewGradient: 'from-green-500 to-emerald-600', iconChar: '🐉', isNew: true },
  { id: 'avatar-robot', name: 'الروبوت', description: 'ذكاء اصطناعي!', cost: 250, currency: 'coins', category: 'avatars', previewGradient: 'from-cyan-400 to-blue-500', iconChar: '🤖' },
  { id: 'avatar-knight', name: 'الفارس', description: 'شجاعة وفروسية!', cost: 200, currency: 'coins', category: 'avatars', previewGradient: 'from-amber-500 to-yellow-600', iconChar: '⚔️' },
  { id: 'avatar-mermaid', name: 'حورية البحر', description: 'سحر الأعماق!', cost: 180, currency: 'coins', category: 'avatars', previewGradient: 'from-teal-400 to-cyan-600', iconChar: '🧜' },
  { id: 'avatar-pirate', name: 'القرصان', description: 'مغامر شجاع!', cost: 50, currency: 'gems', category: 'avatars', previewGradient: 'from-amber-600 to-yellow-700', iconChar: '🏴‍☠️' },
  { id: 'avatar-fairy', name: 'الجنية', description: 'سحر وأجنحة!', cost: 220, currency: 'coins', category: 'avatars', previewGradient: 'from-pink-300 to-violet-400', iconChar: '🧚', isNew: true },
  { id: 'avatar-alien', name: 'الفضائي', description: 'من كوكب آخر!', cost: 300, currency: 'coins', category: 'avatars', previewGradient: 'from-lime-400 to-green-500', iconChar: '👽' },
  { id: 'avatar-pharaoh', name: 'الفرعون', description: 'حاكم مصر القديمة!', cost: 80, currency: 'gems', category: 'avatars', previewGradient: 'from-yellow-400 to-amber-600', iconChar: '👤' },
  { id: 'avatar-samurai', name: 'الساموراي', description: 'محارب اليابان!', cost: 280, currency: 'coins', category: 'avatars', previewGradient: 'from-red-500 to-rose-700', iconChar: '🗾' },
  { id: 'avatar-angel', name: 'الملاك', description: 'نور من السماء!', cost: 100, currency: 'gems', category: 'avatars', previewGradient: 'from-white to-amber-100', iconChar: '😇' },
];

const BACKGROUND_ITEMS: ShopItem[] = [
  { id: 'bg-sunset', name: 'غروب الشمس', description: 'ألوان دافئة ساحرة', cost: 30, currency: 'coins', category: 'backgrounds', previewGradient: 'from-orange-300 to-rose-400', iconChar: '🌅', isPopular: true },
  { id: 'bg-ocean', name: 'أعماق المحيط', description: 'رحلة تحت الماء', cost: 50, currency: 'coins', category: 'backgrounds', previewGradient: 'from-cyan-300 to-blue-500', iconChar: '🌊' },
  { id: 'bg-forest', name: 'الغابة السحرية', description: 'أشجار مضيئة بالنجوم', cost: 40, currency: 'coins', category: 'backgrounds', previewGradient: 'from-green-300 to-emerald-500', iconChar: '🌲' },
  { id: 'bg-space', name: 'الفضاء الخارجي', description: 'مجرات لا متناهية', cost: 80, currency: 'coins', category: 'backgrounds', previewGradient: 'from-slate-800 to-purple-900', iconChar: '🌌', isNew: true },
  { id: 'bg-rainbow', name: 'قوس قزح', description: 'ألوان مبهجة!', cost: 60, currency: 'coins', category: 'backgrounds', previewGradient: 'from-pink-300 via-yellow-300 to-cyan-300', iconChar: '🌈' },
  { id: 'bg-candy', name: 'عالم الحلوى', description: 'كل شيء حلو هنا!', cost: 100, currency: 'coins', category: 'backgrounds', previewGradient: 'from-pink-300 to-fuchsia-400', iconChar: '🍬' },
  { id: 'bg-desert', name: 'الصحراء الذهبية', description: 'كثبان رملية ذهبية', cost: 45, currency: 'coins', category: 'backgrounds', previewGradient: 'from-amber-300 to-yellow-500', iconChar: '🏜️', isNew: true },
  { id: 'bg-arctic', name: 'القطب الشمالي', description: 'جليد وثلج لامع', cost: 55, currency: 'coins', category: 'backgrounds', previewGradient: 'from-sky-200 to-blue-300', iconChar: '❄️' },
];

const POWERUP_ITEMS: ShopItem[] = [
  { id: 'powerup-double', name: 'نقاط مضاعفة', description: 'ضاعف نقاطك في اللعبة القادمة!', cost: 30, currency: 'coins', category: 'powerups', previewGradient: 'from-amber-400 to-yellow-500', iconChar: '×2', isPopular: true },
  { id: 'powerup-extra-time', name: 'وقت إضافي', description: '+30 ثانية إضافية!', cost: 25, currency: 'coins', category: 'powerups', previewGradient: 'from-teal-400 to-cyan-500', iconChar: '⏰' },
  { id: 'powerup-hint', name: 'كشف التلميح', description: 'يكشف إجابة سؤال واحد!', cost: 20, currency: 'coins', category: 'powerups', previewGradient: 'from-yellow-300 to-amber-400', iconChar: '💡', isNew: true },
  { id: 'powerup-shield', name: 'درع الحماية', description: 'يحميك من إجابة خاطئة!', cost: 35, currency: 'coins', category: 'powerups', previewGradient: 'from-emerald-400 to-green-500', iconChar: '🛡️' },
  { id: 'powerup-freeze', name: 'تجميد الوقت', description: 'أوقف الوقت لمدة 5 ثوان!', cost: 40, currency: 'coins', category: 'powerups', previewGradient: 'from-blue-400 to-indigo-500', iconChar: '🧊', isNew: true },
  { id: 'powerup-magnet', name: 'مغناطيس النقاط', description: 'نقاط إضافية لكل إجابة!', cost: 30, currency: 'coins', category: 'powerups', previewGradient: 'from-rose-400 to-pink-500', iconChar: '🧲' },
];

const THEME_ITEMS: ShopItem[] = [
  { id: 'theme-dark', name: 'الوضع الداكن', description: 'مظهر أنيق ومريح للعين', cost: 50, currency: 'gems', category: 'themes', previewGradient: 'from-slate-800 to-slate-900', iconChar: '🌙', isNew: true },
  { id: 'theme-rainbow', name: 'قوس قزح', description: 'ألوان متدرجة في كل مكان!', cost: 80, currency: 'gems', category: 'themes', previewGradient: 'from-red-400 via-yellow-400 to-green-400', iconChar: '🌈' },
  { id: 'theme-neon', name: 'نيون متوهج', description: 'ألوان نيون لامعة!', cost: 60, currency: 'gems', category: 'themes', previewGradient: 'from-cyan-400 via-purple-500 to-pink-500', iconChar: '💡', isPopular: true },
  { id: 'theme-golden', name: 'الذهبي الملكي', description: 'فخامة ذهبية في كل التفاصيل', cost: 100, currency: 'gems', category: 'themes', previewGradient: 'from-yellow-400 to-amber-600', iconChar: '👑' },
];

// Bundle deal
const BUNDLE_DEAL: ShopItem & { bundle: { items: string[]; originalCost: number } } = {
  id: 'bundle-starter', name: 'حزمة البداية', description: '3 قوى + خلفية مجانية!', cost: 80, currency: 'coins', category: 'powerups', previewGradient: 'from-amber-400 via-rose-400 to-purple-500', iconChar: '📦',
  isNew: true, isPopular: true,
  bundle: { items: ['powerup-double', 'powerup-hint', 'powerup-shield', 'bg-sunset'], originalCost: 115 },
};

const ALL_ITEMS = [...AVATAR_ITEMS, ...BACKGROUND_ITEMS, ...POWERUP_ITEMS, ...THEME_ITEMS];

// ─── Animated Counter ────────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    let startTime: number | null = null;
    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const p = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

// ─── Flying Coins ────────────────────────────────────────────────────────────

function FlyingCoins({ show, from }: { show: boolean; from: { x: number; y: number } }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 60) * (Math.PI / 180);
        return (
          <motion.div key={i}
            initial={{ x: from.x, y: from.y, scale: 1, opacity: 1 }}
            animate={{ x: from.x + Math.cos(angle) * 120, y: from.y + Math.sin(angle) * 120 - 80, scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
            className="absolute text-2xl">🪙</motion.div>
        );
      })}
    </div>
  );
}

// ─── Item Card ───────────────────────────────────────────────────────────────

function ItemCard({ item, owned, canAfford, onBuy, index, isWishlisted, onWishlist }: {
  item: ShopItem; owned: boolean; canAfford: boolean; onBuy: (e: React.MouseEvent) => void;
  index: number; isWishlisted: boolean; onWishlist: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.05 }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
    >
      <Card className={`border-0 shadow-lg overflow-hidden relative ${owned ? 'bg-gradient-to-l from-green-50 to-emerald-50' : !canAfford ? 'bg-white/60 opacity-80' : 'bg-white/90 hover:shadow-xl'}`}>
        {/* Preview */}
        <div className={`h-16 md:h-20 bg-gradient-to-l ${item.previewGradient} relative flex items-center justify-center`}
          style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1)' }}>
          <span className="text-3xl md:text-4xl drop-shadow-lg font-black">{item.iconChar}</span>
          {owned && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-2 left-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✓</motion.div>
          )}
          {item.isNew && !owned && (
            <Badge className="absolute top-2 right-2 bg-emerald-500 text-white border-0 text-[8px] px-1.5">جديد!</Badge>
          )}
          {item.isPopular && !owned && !item.isNew && (
            <Badge className="absolute top-2 right-2 bg-amber-500 text-white border-0 text-[8px] px-1.5">🔥 شائع</Badge>
          )}
        </div>

        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black text-slate-800 truncate">{item.name}</div>
            {!owned && (
              <motion.button onClick={onWishlist} whileTap={{ scale: 0.8 }} className="shrink-0">
                <Heart className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} />
              </motion.button>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 min-h-[2rem]">{item.description}</div>

          <div className="flex items-center justify-between mt-2">
            <div className={`flex items-center gap-1 text-sm font-black ${!canAfford && !owned ? 'text-red-400' : 'text-amber-600'}`}>
              {item.currency === 'coins' ? <Coins className="w-4 h-4" /> : <Gem className="w-4 h-4" />}
              {item.cost}
            </div>
            {owned ? (
              <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">مملوك ✅</Badge>
            ) : (
              <motion.button
                onClick={canAfford ? onBuy : undefined}
                whileHover={canAfford ? { scale: 1.05 } : {}}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  canAfford ? 'bg-gradient-to-l from-amber-400 to-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}>
                {canAfford ? 'اشترِ 🛒' : 'غير كافٍ'}
              </motion.button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Purchase Dialog ─────────────────────────────────────────────────────────

function PurchaseDialog({ item, onConfirm, onCancel }: { item: ShopItem; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCancel}>
      <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}
        className="w-full max-w-sm">
        <Card className="border-0 shadow-2xl bg-white overflow-hidden" dir="rtl">
          <div className={`h-24 bg-gradient-to-l ${item.previewGradient} flex items-center justify-center relative`}
            style={{ boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.15)' }}>
            <motion.span animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} className="text-5xl font-black">
              {item.iconChar}
            </motion.span>
          </div>
          <CardContent className="p-5">
            <h3 className="text-xl font-black text-slate-800">{item.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.description}</p>
            <div className="flex items-center justify-center gap-2 mt-4 py-3 bg-amber-50 rounded-xl">
              {item.currency === 'coins' ? <Coins className="w-5 h-5 text-amber-500" /> : <Gem className="w-5 h-5 text-purple-500" />}
              <span className="text-2xl font-black text-amber-600">{item.cost}</span>
            </div>
            {item.bundle && (
              <div className="mt-3 p-2 bg-emerald-50 rounded-lg text-center">
                <span className="text-xs font-bold text-emerald-700">وفر {item.bundle.originalCost - item.cost} عملة! بدلاً من {item.bundle.originalCost}</span>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <Button onClick={onCancel} variant="outline" className="flex-1 rounded-xl font-bold">إلغاء</Button>
              <Button onClick={onConfirm}
                className="flex-1 rounded-xl font-bold bg-gradient-to-l from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 shadow-md">
                تأكيد الشراء ✨
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ShopPage({ currentChild, onBack, onPurchase }: ShopPageProps) {
  const [activeTab, setActiveTab] = useState('avatars');
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [purchaseDialogItem, setPurchaseDialogItem] = useState<ShopItem | null>(null);
  const [showFlyingCoins, setShowFlyingCoins] = useState(false);
  const [justPurchased, setJustPurchased] = useState<string | null>(null);

  const animatedCoins = useAnimatedCounter(currentChild.coins);
  const animatedGems = useAnimatedCounter(currentChild.gems);

  // Daily deal countdown
  const [dealTime, setDealTime] = useState({ hours: 0, minutes: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      setDealTime({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentItems = useMemo(() => {
    switch (activeTab) {
      case 'avatars': return AVATAR_ITEMS;
      case 'backgrounds': return BACKGROUND_ITEMS;
      case 'powerups': return POWERUP_ITEMS;
      case 'themes': return THEME_ITEMS;
      default: return AVATAR_ITEMS;
    }
  }, [activeTab]);

  const canAfford = (item: ShopItem) => {
    return item.currency === 'coins' ? currentChild.coins >= item.cost : currentChild.gems >= item.cost;
  };

  const handleBuyClick = (item: ShopItem, _e: React.MouseEvent) => {
    if (!canAfford(item)) return;
    setPurchaseDialogItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!purchaseDialogItem) return;
    const item = purchaseDialogItem;
    setShowFlyingCoins(true);
    setTimeout(() => setShowFlyingCoins(false), 1000);
    setOwnedItems(prev => new Set([...prev, item.id]));
    setJustPurchased(item.id);
    setTimeout(() => setJustPurchased(null), 2000);
    onPurchase(item.category, item.id, item.cost, item.currency);
    setPurchaseDialogItem(null);
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const ownedList = useMemo(() => ALL_ITEMS.filter(i => ownedItems.has(i.id)), [ownedItems]);
  const wishlistItems = useMemo(() => ALL_ITEMS.filter(i => wishlist.has(i.id) && !ownedItems.has(i.id)), [wishlist, ownedItems]);

  return (
    <div dir="rtl" className="min-h-screen w-full pb-8" style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #e0f2fe 60%, #d1fae5 100%)',
    }}>
      <FlyingCoins show={showFlyingCoins} from={{ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 }} />

      <AnimatePresence>
        {purchaseDialogItem && (
          <PurchaseDialog item={purchaseDialogItem} onConfirm={handleConfirmPurchase} onCancel={() => setPurchaseDialogItem(null)} />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto px-3 md:px-6 flex flex-col gap-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <Card className="border-0 shadow-xl bg-gradient-to-l from-emerald-400 via-teal-400 to-cyan-400 overflow-hidden relative">
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-center gap-3">
                <motion.button onClick={onBack} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white text-lg backdrop-blur-sm" aria-label="رجوع">→</motion.button>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm flex items-center gap-2">
                    <ShoppingCart className="w-7 h-7" /> المتجر
                  </h1>
                  <p className="text-white/80 text-xs">اشترِ أشياء رائعة بمكافآتك!</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <motion.div animate={justPurchased ? { scale: [1, 0.9, 1] } : {}}
                    className="flex items-center gap-1.5 bg-white/25 backdrop-blur-sm rounded-full px-3 py-1">
                    <Coins className="w-4 h-4 text-yellow-200" />
                    <span className="text-base font-black text-white">{animatedCoins.toLocaleString('ar-EG')}</span>
                  </motion.div>
                  <motion.div animate={justPurchased ? { scale: [1, 0.9, 1] } : {}}
                    className="flex items-center gap-1.5 bg-white/25 backdrop-blur-sm rounded-full px-3 py-1">
                    <Gem className="w-4 h-4 text-purple-200" />
                    <span className="text-base font-black text-white">{animatedGems.toLocaleString('ar-EG')}</span>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Deal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-l from-amber-50 to-orange-50 border-2 border-amber-300 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-black text-amber-800">عرض اليوم!</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {dealTime.hours}س {dealTime.minutes}د
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-l ${BUNDLE_DEAL.previewGradient} flex items-center justify-center shadow-md shrink-0`}
                  style={{ boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.15)' }}>
                  <span className="text-2xl font-black text-white">{BUNDLE_DEAL.iconChar}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-800">{BUNDLE_DEAL.name}</div>
                  <div className="text-[10px] text-slate-500">{BUNDLE_DEAL.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs line-through text-slate-400">{BUNDLE_DEAL.bundle.originalCost} 🪙</span>
                    <span className="text-sm font-black text-amber-600">{BUNDLE_DEAL.cost} 🪙</span>
                    <Badge className="bg-red-100 text-red-700 border-0 text-[8px]">
                      وفر {BUNDLE_DEAL.bundle.originalCost - BUNDLE_DEAL.cost}!
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="w-full grid grid-cols-4 bg-white/70 backdrop-blur-sm shadow-md rounded-xl h-12">
              {[
                { value: 'avatars', label: 'الأفاتار', icon: <Crown className="w-4 h-4" /> },
                { value: 'backgrounds', label: 'الخلفيات', icon: <Palette className="w-4 h-4" /> },
                { value: 'powerups', label: 'القوى', icon: <Zap className="w-4 h-4" /> },
                { value: 'themes', label: 'المظاهر', icon: <Sparkles className="w-4 h-4" /> },
              ].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}
                  className="text-xs font-bold data-[state=active]:bg-gradient-to-l data-[state=active]:from-emerald-400 data-[state=active]:to-teal-400 data-[state=active]:text-white rounded-lg flex items-center gap-1">
                  {tab.icon} {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {currentItems.map((item, i) => (
                <ItemCard key={item.id} item={item} owned={ownedItems.has(item.id)} canAfford={canAfford(item)}
                  onBuy={(e) => handleBuyClick(item, e)} index={i}
                  isWishlisted={wishlist.has(item.id)} onWishlist={() => toggleWishlist(item.id)} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Wishlist */}
        {wishlistItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="text-sm font-bold text-slate-700">قائمة الأمنيات</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wishlistItems.map(item => (
                    <motion.div key={item.id} whileHover={{ scale: 1.05 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.previewGradient} flex items-center justify-center shadow-md cursor-pointer`}
                      title={item.name}>
                      <span className="text-xl font-black text-white">{item.iconChar}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Owned Items */}
        {ownedList.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-500" /> أشيائك ✨
                  </span>
                  <Badge variant="secondary" className="text-xs">{ownedList.length} عنصر</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ownedList.map((item, i) => (
                    <motion.div key={item.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: i * 0.05 }} whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${item.previewGradient} flex items-center justify-center shadow-md cursor-pointer`}
                      title={item.name}>
                      <span className="text-xl md:text-2xl font-black text-white">{item.iconChar}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tip */}
        <Card className="border-0 shadow-lg bg-gradient-to-l from-cyan-50 to-emerald-50 border-r-4 border-r-emerald-400">
          <CardContent className="p-4 flex items-center gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="text-3xl shrink-0">💡</motion.div>
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-600 mb-0.5">نصيحة</div>
              <p className="text-sm font-semibold text-slate-700">العب ألعاباً واكمل التحديات لكسب المزيد من العملات والأحجار! 🎮</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
