'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Clock, Zap, CheckCircle, XCircle, Gem, Coins } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

interface GameResultsProps {
  result: {
    score: number;
    correctCount: number;
    wrongCount: number;
    combo: number;
    bestCombo: number;
    duration: number;
    pointsEarned: number;
    starsEarned: number;
    coinsEarned: number;
    gemsEarned: number;
  };
  onPlayAgain: () => void;
  onDashboard: () => void;
}

// Confetti piece component - receives all random values as props (no Math.random in render)
function ConfettiPiece({ delay, color, left, size, rotationDir, xDrift, duration, repeatDelay }: {
  delay: number; color: string; left: string; size: number;
  rotationDir: number; xDrift: number; duration: number; repeatDelay: number;
}) {
  return (
    <motion.div
      className="absolute top-0 pointer-events-none"
      style={{ left, width: size, height: size * 1.5, backgroundColor: color, borderRadius: '2px' }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: ['0vh', '100vh'],
        opacity: [1, 1, 0],
        rotate: [0, 360 * rotationDir],
        x: [0, xDrift],
      }}
      transition={{
        duration,
        delay,
        ease: 'easeIn',
        repeat: Infinity,
        repeatDelay,
      }}
    />
  );
}

// Animated score counter
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    let startTime: number | null = null;
    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span>{count}</span>;
}

// Star rating with dramatic animation
function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-3 mb-6">
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={i}
          className="relative"
        >
          {/* Glow behind star */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={i < count ? {
              boxShadow: [
                '0 0 0px rgba(251, 191, 36, 0)',
                '0 0 30px rgba(251, 191, 36, 0.6)',
                '0 0 15px rgba(251, 191, 36, 0.3)',
              ],
            } : {}}
            transition={{ delay: 0.8 + i * 0.3, duration: 0.8 }}
          />
          <motion.span
            initial={{ scale: 0, rotate: -180, y: -30 }}
            animate={{
              scale: i < count ? [0, 1.4, 1] : [0, 0.6],
              rotate: i < count ? [-180, 10, 0] : [-180, 0],
              y: i < count ? [-30, 5, 0] : [-30, 0],
            }}
            transition={{
              delay: 0.6 + i * 0.3,
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
            className={`text-5xl block ${i < count ? '' : 'opacity-20 grayscale'}`}
          >
            ⭐
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}

// Achievement unlock animation
function AchievementUnlock({ icon, label, delay }: { icon: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
      className="flex flex-col items-center gap-1"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ delay: delay + 0.3, duration: 0.6 }}
        className="text-3xl"
      >
        {icon}
      </motion.div>
      <span className="text-[10px] font-bold text-amber-700">{label}</span>
    </motion.div>
  );
}

export default function GameResults({ result, onPlayAgain, onDashboard }: GameResultsProps) {
  const { play: playSound } = useSound();
  const [showDetails, setShowDetails] = useState(false);

  // Generate confetti pieces with useMemo to avoid Math.random() during render
  const confettiColors = ['#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#f87171', '#38bdf8', '#4ade80'];
  const confettiPieces = useMemo(() => {
    // Use a seeded approach based on index to avoid random in render
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: (i * 0.06) % 3,
      color: confettiColors[i % confettiColors.length],
      left: `${((i * 2.04) % 100)}%`,
      size: 6 + (i % 8),
      rotationDir: i % 2 === 0 ? 1 : -1,
      xDrift: ((i * 7.13) % 200) - 100,
      duration: 3 + (i % 5) * 0.4,
      repeatDelay: (i * 0.4) % 3,
    }));
  }, []);

  useEffect(() => {
    playSound('gameOver');
    const starTimer = setTimeout(() => playSound('star'), 500);
    const coinsTimer = setTimeout(() => playSound('coins'), 1200);
    const badgeTimer = setTimeout(() => playSound('badge'), 1600);
    return () => {
      clearTimeout(starTimer);
      clearTimeout(coinsTimer);
      clearTimeout(badgeTimer);
    };
  }, [playSound]);

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const accuracy = result.correctCount + result.wrongCount > 0
    ? Math.round((result.correctCount / (result.correctCount + result.wrongCount)) * 100)
    : 0;

  const isPerfectScore = accuracy === 100 && result.correctCount > 0;
  const isHighScore = accuracy >= 80;

  // Determine achievements
  const achievements: Array<{ icon: string; label: string }> = [];
  if (isPerfectScore) achievements.push({ icon: '💎', label: 'لعبة مثالية!' });
  if (result.bestCombo >= 5) achievements.push({ icon: '⚡', label: `كومبو ${result.bestCombo}x!` });
  if (result.starsEarned === 3) achievements.push({ icon: '🌟', label: 'ثلاث نجوم!' });
  if (result.gemsEarned > 0) achievements.push({ icon: '💎', label: `+${result.gemsEarned} جواهر` });

  return (
    <div dir="rtl" className="relative flex flex-col min-h-screen bg-gradient-to-b from-yellow-50 via-pink-50 to-emerald-50 p-4 max-w-lg mx-auto overflow-hidden">
      {/* Confetti rain for perfect scores */}
      {isPerfectScore && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {confettiPieces.map((piece) => (
            <ConfettiPiece key={piece.id} {...piece} />
          ))}
        </div>
      )}

      {/* Sparkle overlay for high scores */}
      {isHighScore && !isPerfectScore && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg"
              style={{
                left: `${(i * 8.3) % 100}%`,
                top: `${(i * 11.7) % 100}%`,
              }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        {/* Trophy with animation */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-4 relative"
        >
          {/* Glow ring behind trophy */}
          <motion.div
            className="absolute inset-0 -m-6 rounded-full"
            animate={{
              boxShadow: [
                '0 0 0px rgba(251, 191, 36, 0)',
                '0 0 40px rgba(251, 191, 36, 0.5)',
                '0 0 20px rgba(251, 191, 36, 0.3)',
              ],
              scale: [1, 1.1, 1],
            }}
            transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
          />
          {/* Trophy bounce */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              delay: 1,
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-8xl block">🏆</span>
          </motion.div>
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-extrabold mb-2"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 3s ease infinite',
          }}
        >
          {isPerfectScore ? 'مثالي! 🎊' : 'أحسنت! 🎊'}
        </motion.h1>

        {/* Star Rating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <StarRating count={result.starsEarned} />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 30 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-3 mb-6"
        >
          {/* Score with animated counter */}
          <Card className="p-4 bg-gradient-to-l from-purple-50 to-white border-purple-200 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-l from-purple-100/50 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Trophy className="w-5 h-5 text-purple-600" />
                </motion.div>
                <span className="font-bold text-gray-700">النتيجة</span>
              </div>
              <span className="text-2xl font-extrabold text-purple-600">
                <AnimatedCounter target={result.score} />
              </span>
            </div>
          </Card>

          {/* Correct/Wrong */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-gradient-to-l from-emerald-50 to-white border-emerald-200 relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-emerald-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              />
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: 1, duration: 0.3 }}
                >
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </motion.div>
                <span className="text-sm text-gray-600">صحيح</span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                <AnimatedCounter target={result.correctCount} />
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-l from-red-50 to-white border-red-200 relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-red-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              />
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-gray-600">خطأ</span>
              </div>
              <p className="text-2xl font-extrabold text-red-500 mt-1">{result.wrongCount}</p>
            </Card>
          </div>

          {/* Combo & Time */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-gradient-to-l from-orange-50 to-white border-orange-200">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={result.bestCombo >= 5 ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Zap className="w-5 h-5 text-orange-500" />
                </motion.div>
                <span className="text-sm text-gray-600">أفضل كومبو</span>
              </div>
              <p className="text-2xl font-extrabold text-orange-600 mt-1">{result.bestCombo}x</p>
            </Card>
            <Card className="p-4 bg-gradient-to-l from-teal-50 to-white border-teal-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                <span className="text-sm text-gray-600">الوقت</span>
              </div>
              <p className="text-2xl font-extrabold text-teal-600 mt-1">{formatDuration(result.duration)}</p>
            </Card>
          </div>

          {/* Accuracy with animated bar */}
          <Card className="p-4 bg-gradient-to-l from-amber-50 to-white border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الدقة</span>
              <motion.span
                className="text-xl font-extrabold text-amber-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {accuracy}%
              </motion.span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full mt-2 overflow-hidden relative">
              <motion.div
                className={`h-full rounded-full relative ${
                  accuracy >= 80
                    ? 'bg-gradient-to-l from-emerald-400 to-green-500'
                    : accuracy >= 50
                    ? 'bg-gradient-to-l from-amber-400 to-yellow-500'
                    : 'bg-gradient-to-l from-red-400 to-orange-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                />
              </motion.div>
            </div>
          </Card>

          {/* Rewards */}
          <Card className="p-4 bg-gradient-to-l from-yellow-50 to-white border-yellow-300 shadow-md relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-yellow-100/30 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <p className="font-bold text-gray-700 mb-3 text-center relative z-10">🎁 المكافآت</p>
            <div className="grid grid-cols-3 gap-3 relative z-10">
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="text-3xl mb-1"
                >
                  ⭐
                </motion.div>
                <p className="text-xs text-gray-500">نقاط</p>
                <p className="font-bold text-purple-600">+{result.pointsEarned}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
                className="text-center"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="text-3xl mb-1"
                >
                  🪙
                </motion.div>
                <p className="text-xs text-gray-500">عملات</p>
                <p className="font-bold text-amber-600">+{result.coinsEarned}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1.6, type: 'spring', stiffness: 200 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ delay: 1.7, duration: 0.5 }}
                  className="text-3xl mb-1"
                >
                  💎
                </motion.div>
                <p className="text-xs text-gray-500">جواهر</p>
                <p className="font-bold text-teal-600">+{result.gemsEarned}</p>
              </motion.div>
            </div>
          </Card>

          {/* Achievement Unlocks */}
          {achievements.length > 0 && (
            <Card className="p-4 bg-gradient-to-l from-indigo-50 to-purple-50 border-indigo-200">
              <p className="text-sm font-bold text-indigo-700 mb-3 text-center">🏅 إنجازات جديدة</p>
              <div className="flex justify-center gap-4">
                {achievements.map((ach, i) => (
                  <AchievementUnlock key={ach.label} icon={ach.icon} label={ach.label} delay={2 + i * 0.3} />
                ))}
              </div>
            </Card>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
          transition={{ delay: 1.5 }}
          className="w-full space-y-3"
        >
          {/* Play Again with glow effect */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playSound('click'); onPlayAgain(); }}
            className="w-full rounded-2xl p-4 text-xl font-bold bg-gradient-to-l from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative overflow-hidden"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            />
            <span className="relative z-10">العب مرة أخرى 🔄</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playSound('click'); onDashboard(); }}
            className="w-full rounded-2xl p-4 text-xl font-bold bg-gradient-to-l from-gray-100 to-gray-200 text-gray-700 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            العودة للوحة 🏠
          </motion.button>
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
