'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvatarImage from '@/components/shared/AvatarImage';

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

// ─── Shop Item Definitions ───────────────────────────────────────────────────

interface ShopItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  currency: 'coins' | 'gems';
  category: 'avatars' | 'backgrounds' | 'powerups';
  previewColor?: string;
}

const AVATAR_ITEMS: ShopItem[] = [
  { id: 'avatar-phoenix', name: 'العنقاء', description: 'طائر ناري أسطوري!', emoji: '🔥', cost: 200, currency: 'coins', category: 'avatars', previewColor: 'from-red-400 to-orange-500' },
  { id: 'avatar-wizard', name: 'الساحر', description: 'ساحر حكيم وقوي!', emoji: '🧙', cost: 150, currency: 'coins', category: 'avatars', previewColor: 'from-purple-400 to-fuchsia-500' },
  { id: 'avatar-astronaut', name: 'رائد فضاء', description: 'استكشف الكون!', emoji: '🧑‍🚀', cost: 180, currency: 'coins', category: 'avatars', previewColor: 'from-sky-400 to-cyan-500' },
  { id: 'avatar-ninja', name: 'النينجا', description: 'سريع كالريح!', emoji: '🥷', cost: 160, currency: 'coins', category: 'avatars', previewColor: 'from-slate-600 to-slate-800' },
  { id: 'avatar-princess', name: 'الأميرة', description: 'ملكة المملكة!', emoji: '👸', cost: 120, currency: 'coins', category: 'avatars', previewColor: 'from-pink-400 to-rose-500' },
  { id: 'avatar-pirate', name: 'القرصان', description: 'مغامر شجاع!', emoji: '🏴‍☠️', cost: 50, currency: 'gems', category: 'avatars', previewColor: 'from-amber-600 to-yellow-700' },
];

const BACKGROUND_ITEMS: ShopItem[] = [
  { id: 'bg-sunset', name: 'غروب الشمس', description: 'ألوان دافئة ساحرة', emoji: '🌅', cost: 30, currency: 'coins', category: 'backgrounds', previewColor: 'from-orange-300 to-rose-400' },
  { id: 'bg-ocean', name: 'اعماق المحيط', description: 'رحلة تحت الماء', emoji: '🌊', cost: 50, currency: 'coins', category: 'backgrounds', previewColor: 'from-cyan-300 to-blue-500' },
  { id: 'bg-forest', name: 'الغابة السحرية', description: 'أشجار مضيئة بالنجوم', emoji: '🌲', cost: 40, currency: 'coins', category: 'backgrounds', previewColor: 'from-green-300 to-emerald-500' },
  { id: 'bg-space', name: 'الفضاء الخارجي', description: 'مجرات لا متناهية', emoji: '🌌', cost: 80, currency: 'coins', category: 'backgrounds', previewColor: 'from-slate-800 to-purple-900' },
  { id: 'bg-rainbow', name: 'قوس قزح', description: 'ألوان مبهجة!', emoji: '🌈', cost: 60, currency: 'coins', category: 'backgrounds', previewColor: 'from-pink-300 via-yellow-300 to-cyan-300' },
  { id: 'bg-candy', name: 'عالم الحلوى', description: 'كل شيء حلو هنا!', emoji: '🍬', cost: 100, currency: 'coins', category: 'backgrounds', previewColor: 'from-pink-300 to-fuchsia-400' },
];

const POWERUP_ITEMS: ShopItem[] = [
  { id: 'powerup-double', name: 'نقاط مضاعفة', description: 'ضاعف نقاطك في اللعبة القادمة!', emoji: '✖️2', cost: 30, currency: 'coins', category: 'powerups', previewColor: 'from-amber-400 to-yellow-500' },
  { id: 'powerup-extra-time', name: 'وقت إضافي', description: '+30 ثانية إضافية في اللعبة!', emoji: '⏰', cost: 25, currency: 'coins', category: 'powerups', previewColor: 'from-teal-400 to-cyan-500' },
  { id: 'powerup-hint', name: 'كشف التلميح', description: 'يكشف إجابة سؤال واحد!', emoji: '💡', cost: 20, currency: 'coins', category: 'powerups', previewColor: 'from-yellow-300 to-amber-400' },
  { id: 'powerup-shield', name: 'درع الحماية', description: 'يحميك من إجابة خاطئة واحدة!', emoji: '🛡️', cost: 35, currency: 'coins', category: 'powerups', previewColor: 'from-emerald-400 to-green-500' },
];

const ALL_ITEMS = [...AVATAR_ITEMS, ...BACKGROUND_ITEMS, ...POWERUP_ITEMS];

// ─── Animated Counter Hook ───────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    const startValue = 0;

    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const currentValue = Math.round(startValue + (target - startValue) * eased);
      setCount(currentValue);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// ─── Flying Coins Animation ──────────────────────────────────────────────────

function FlyingCoins({ show, fromPosition }: { show: boolean; fromPosition: { x: number; y: number } }) {
  if (!show) return null;

  const coins = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    angle: (i * 60) * (Math.PI / 180),
    delay: i * 0.05,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {coins.map(coin => (
        <motion.div
          key={coin.id}
          initial={{
            x: fromPosition.x,
            y: fromPosition.y,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: fromPosition.x + Math.cos(coin.angle) * 120,
            y: fromPosition.y + Math.sin(coin.angle) * 120 - 80,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            delay: coin.delay,
            ease: 'easeOut',
          }}
          className="absolute text-2xl"
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}

// ─── Item Card Component ─────────────────────────────────────────────────────

function ItemCard({
  item,
  owned,
  canAfford,
  onBuy,
  index,
}: {
  item: ShopItem;
  owned: boolean;
  canAfford: boolean;
  onBuy: (e: React.MouseEvent) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.06,
      }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <Card className={`border-0 shadow-lg overflow-hidden relative ${
        owned
          ? 'bg-gradient-to-l from-green-50 to-emerald-50'
          : !canAfford
          ? 'bg-white/60 opacity-80'
          : 'bg-white/90 hover:shadow-xl'
      }`}>
        {/* Preview Color Banner */}
        <div className={`h-16 md:h-20 bg-gradient-to-l ${item.previewColor || 'from-slate-200 to-slate-300'} relative flex items-center justify-center`}>
          <motion.span
            animate={owned ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-3xl md:text-4xl drop-shadow-lg"
          >
            {item.emoji}
          </motion.span>
          {owned && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
            >
              ✓
            </motion.div>
          )}
        </div>

        <CardContent className="p-3">
          <div className="text-sm font-black text-slate-800 truncate">{item.name}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 line-clamp-2 min-h-[2rem]">{item.description}</div>

          {/* Price */}
          <div className="flex items-center justify-between mt-2">
            <div className={`flex items-center gap-1 text-sm font-black ${
              !canAfford && !owned ? 'text-red-400' : 'text-amber-600'
            }`}>
              {item.currency === 'coins' ? '🪙' : '💎'}
              {item.cost}
            </div>

            {owned ? (
              <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                مملوك ✅
              </Badge>
            ) : (
              <motion.button
                onClick={canAfford ? onBuy : undefined}
                whileHover={canAfford ? { scale: 1.05 } : {}}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  canAfford
                    ? 'bg-gradient-to-l from-amber-400 to-orange-500 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'اشترِ 🛒' : 'غير كافٍ'}
              </motion.button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Power-up Preview Card ───────────────────────────────────────────────────

function PowerUpCard({
  item,
  owned,
  canAfford,
  onBuy,
  index,
}: {
  item: ShopItem;
  owned: boolean;
  canAfford: boolean;
  onBuy: (e: React.MouseEvent) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.08,
      }}
      whileHover={{ scale: 1.02, x: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`border-0 shadow-lg overflow-hidden ${
        owned
          ? 'bg-gradient-to-l from-green-50 to-emerald-50'
          : !canAfford
          ? 'bg-white/60 opacity-80'
          : 'bg-white/90 hover:shadow-xl'
      }`}>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${item.previewColor || 'from-slate-200 to-slate-300'} flex items-center justify-center shrink-0 shadow-md`}>
              <span className="text-2xl md:text-3xl">{item.emoji}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-black text-slate-800 truncate">{item.name}</span>
                {owned && (
                  <Badge className="bg-green-100 text-green-700 border-0 text-[10px] shrink-0">
                    مملوك ✅
                  </Badge>
                )}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">{item.description}</div>

              {/* Price + Buy */}
              <div className="flex items-center justify-between mt-2">
                <div className={`flex items-center gap-1 text-sm font-black ${
                  !canAfford && !owned ? 'text-red-400' : 'text-amber-600'
                }`}>
                  {item.currency === 'coins' ? '🪙' : '💎'}
                  {item.cost}
                </div>

                {!owned && (
                  <motion.button
                    onClick={canAfford ? onBuy : undefined}
                    whileHover={canAfford ? { scale: 1.05 } : {}}
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      canAfford
                        ? 'bg-gradient-to-l from-amber-400 to-orange-500 text-white shadow-md hover:shadow-lg'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'اشترِ 🛒' : 'غير كافٍ'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Purchase Confirmation Dialog ────────────────────────────────────────────

function PurchaseDialog({
  item,
  open,
  onConfirm,
  onCancel,
}: {
  item: ShopItem | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!item || !open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        <Card className="border-0 shadow-2xl bg-white overflow-hidden" dir="rtl">
          {/* Item preview */}
          <div className={`h-24 bg-gradient-to-l ${item.previewColor || 'from-slate-200 to-slate-300'} flex items-center justify-center relative`}>
            <motion.span
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-5xl"
            >
              {item.emoji}
            </motion.span>
          </div>

          <CardContent className="p-5">
            <h3 className="text-xl font-black text-slate-800">{item.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.description}</p>

            <div className="flex items-center justify-center gap-2 mt-4 py-3 bg-amber-50 rounded-xl">
              <span className="text-lg">{item.currency === 'coins' ? '🪙' : '💎'}</span>
              <span className="text-2xl font-black text-amber-600">{item.cost}</span>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 rounded-xl font-bold"
              >
                إلغاء
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 rounded-xl font-bold bg-gradient-to-l from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 shadow-md"
              >
                تأكيد الشراء ✨
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Insufficient Funds Animation ────────────────────────────────────────────

function InsufficientFundsMessage({ show, currency }: { show: boolean; currency: 'coins' | 'gems' }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <Card className="border-2 border-red-300 shadow-2xl bg-white" dir="rtl">
        <CardContent className="p-4 flex items-center gap-3">
          <motion.span
            animate={{ rotate: [0, -15, 15, -15, 0] }}
            transition={{ duration: 0.5 }}
            className="text-3xl"
          >
            😟
          </motion.span>
          <div>
            <div className="text-sm font-black text-red-600">لا تملك ما يكفي!</div>
            <div className="text-xs text-slate-500">
              تحتاج المزيد من {currency === 'coins' ? 'العملات 🪙' : 'الأحجار 💎'} — العب ألعاباً لكسب المزيد!
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ShopPage({ currentChild, onBack, onPurchase }: ShopPageProps) {
  const [activeTab, setActiveTab] = useState('avatars');
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());
  const [purchaseDialogItem, setPurchaseDialogItem] = useState<ShopItem | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showFlyingCoins, setShowFlyingCoins] = useState(false);
  const [flyingFrom, setFlyingFrom] = useState({ x: 0, y: 0 });
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [insufficientCurrency, setInsufficientCurrency] = useState<'coins' | 'gems'>('coins');
  const [justPurchased, setJustPurchased] = useState<string | null>(null);

  const animatedCoins = useAnimatedCounter(currentChild.coins);
  const animatedGems = useAnimatedCounter(currentChild.gems);

  const currentItems = useMemo(() => {
    switch (activeTab) {
      case 'avatars': return AVATAR_ITEMS;
      case 'backgrounds': return BACKGROUND_ITEMS;
      case 'powerups': return POWERUP_ITEMS;
      default: return AVATAR_ITEMS;
    }
  }, [activeTab]);

  const ownedItemsList = useMemo(() => {
    return ALL_ITEMS.filter(item => ownedItems.has(item.id));
  }, [ownedItems]);

  const canAfford = (item: ShopItem) => {
    if (item.currency === 'coins') return currentChild.coins >= item.cost;
    return currentChild.gems >= item.cost;
  };

  const handleBuyClick = (item: ShopItem, e: React.MouseEvent) => {
    if (!canAfford(item)) {
      setInsufficientCurrency(item.currency);
      setShowInsufficient(true);
      setTimeout(() => setShowInsufficient(false), 2500);
      return;
    }

    setPurchaseDialogItem(item);
    setShowPurchaseDialog(true);
  };

  const handleConfirmPurchase = () => {
    if (!purchaseDialogItem) return;

    const item = purchaseDialogItem;

    // Show flying coins animation
    setShowFlyingCoins(true);
    setFlyingFrom({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setTimeout(() => setShowFlyingCoins(false), 1000);

    // Mark as owned
    setOwnedItems(prev => new Set([...prev, item.id]));
    setJustPurchased(item.id);
    setTimeout(() => setJustPurchased(null), 2000);

    // Call parent handler
    onPurchase(item.category, item.id, item.cost, item.currency);

    // Close dialog
    setShowPurchaseDialog(false);
    setPurchaseDialogItem(null);
  };

  const handleCancelPurchase = () => {
    setShowPurchaseDialog(false);
    setPurchaseDialogItem(null);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full pb-8"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #e0f2fe 60%, #d1fae5 100%)',
      }}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute top-20 right-10 text-5xl opacity-15"
        >
          🛍️
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-40 left-16 text-4xl opacity-15"
        >
          💎
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute bottom-32 right-24 text-4xl opacity-15"
        >
          🪙
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute bottom-48 left-10 text-4xl opacity-15"
        >
          ✨
        </motion.div>
      </div>

      {/* Flying Coins Animation */}
      <FlyingCoins show={showFlyingCoins} fromPosition={flyingFrom} />

      {/* Purchase Confirmation Dialog */}
      <AnimatePresence>
        {showPurchaseDialog && (
          <PurchaseDialog
            item={purchaseDialogItem}
            open={showPurchaseDialog}
            onConfirm={handleConfirmPurchase}
            onCancel={handleCancelPurchase}
          />
        )}
      </AnimatePresence>

      {/* Insufficient Funds Message */}
      <AnimatePresence>
        <InsufficientFundsMessage show={showInsufficient} currency={insufficientCurrency} />
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto px-3 md:px-6 flex flex-col gap-4">
        {/* ─── Header with Currency ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-l from-emerald-400 via-teal-400 to-cyan-400 overflow-hidden relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-3 left-8 w-3 h-3 rounded-full bg-white" />
              <div className="absolute top-6 right-20 w-2 h-2 rounded-full bg-yellow-200" />
              <div className="absolute bottom-4 left-24 w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white text-lg backdrop-blur-sm"
                  aria-label="رجوع"
                >
                  →
                </motion.button>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm">
                    المتجر 🛍️
                  </h1>
                  <p className="text-white/80 text-xs md:text-sm mt-0.5">
                    اشترِ أشياء رائعة بمكافآتك!
                  </p>
                </div>

                {/* Currency Display */}
                <div className="flex flex-col gap-1.5">
                  <motion.div
                    animate={justPurchased ? { scale: [1, 0.9, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-1.5 bg-white/25 backdrop-blur-sm rounded-full px-3 py-1"
                  >
                    <span className="text-lg">🪙</span>
                    <span className="text-base md:text-lg font-black text-white">
                      {animatedCoins.toLocaleString('ar-EG')}
                    </span>
                  </motion.div>
                  <motion.div
                    animate={justPurchased ? { scale: [1, 0.9, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-1.5 bg-white/25 backdrop-blur-sm rounded-full px-3 py-1"
                  >
                    <span className="text-lg">💎</span>
                    <span className="text-base md:text-lg font-black text-white">
                      {animatedGems.toLocaleString('ar-EG')}
                    </span>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Tabs ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="w-full grid grid-cols-3 bg-white/70 backdrop-blur-sm shadow-md rounded-xl h-12">
              <TabsTrigger
                value="avatars"
                className="rounded-r-lg text-sm font-bold data-[state=active]:bg-gradient-to-l data-[state=active]:from-emerald-400 data-[state=active]:to-teal-400 data-[state=active]:text-white"
              >
                الأفاتار 🎭
              </TabsTrigger>
              <TabsTrigger
                value="backgrounds"
                className="text-sm font-bold data-[state=active]:bg-gradient-to-l data-[state=active]:from-emerald-400 data-[state=active]:to-teal-400 data-[state=active]:text-white"
              >
                الخلفيات 🖼️
              </TabsTrigger>
              <TabsTrigger
                value="powerups"
                className="rounded-l-lg text-sm font-bold data-[state=active]:bg-gradient-to-l data-[state=active]:from-emerald-400 data-[state=active]:to-teal-400 data-[state=active]:text-white"
              >
                القوى ⚡
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* ─── Items Grid ─── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'powerups' ? (
              // Power-ups as list cards
              <div className="flex flex-col gap-3">
                {currentItems.map((item, i) => (
                  <PowerUpCard
                    key={item.id}
                    item={item}
                    owned={ownedItems.has(item.id)}
                    canAfford={canAfford(item)}
                    onBuy={(e) => handleBuyClick(item, e)}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              // Avatars & Backgrounds as grid
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentItems.map((item, i) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    owned={ownedItems.has(item.id)}
                    canAfford={canAfford(item)}
                    onBuy={(e) => handleBuyClick(item, e)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Owned Items Section ─── */}
        {ownedItemsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">أشيائك ✨</span>
                  <Badge variant="secondary" className="text-xs">
                    {ownedItemsList.length} عنصر
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ownedItemsList.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        delay: i * 0.05,
                      }}
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${item.previewColor} flex items-center justify-center shadow-md cursor-pointer`}
                      title={item.name}
                    >
                      <span className="text-xl md:text-2xl">{item.emoji}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Tip Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-l from-cyan-50 to-emerald-50 border-r-4 border-r-emerald-400">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-3xl shrink-0"
              >
                💡
              </motion.div>
              <div className="flex-1">
                <div className="text-xs font-bold text-emerald-600 mb-0.5">نصيحة</div>
                <p className="text-sm font-semibold text-slate-700">
                  العب ألعاباً واكمل التحديات اليومية لكسب المزيد من العملات والأحجار! 🎮
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Footer spacer ─── */}
        <div className="h-4" />
      </div>
    </div>
  );
}
