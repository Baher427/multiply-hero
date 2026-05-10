'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

// Confetti piece component
function ConfettiPiece({ delay, color, left, size }: { delay: number; color: string; left: string; size: number }) {
  return (
    <motion.div
      className="absolute top-0 pointer-events-none"
      style={{ left, width: size, height: size * 1.5, backgroundColor: color, borderRadius: '2px' }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: ['0vh', '100vh'],
        opacity: [1, 1, 0],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: 'easeIn',
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
}

export default function GameResults({ result, onPlayAgain, onDashboard }: GameResultsProps) {
  const { play: playSound } = useSound();
  const [showDetails, setShowDetails] = useState(false);

  // Confetti colors
  const confettiColors = ['#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#f87171', '#38bdf8', '#4ade80'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    color: confettiColors[i % confettiColors.length],
    left: `${Math.random() * 100}%`,
    size: 6 + Math.random() * 8,
  }));

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

  const getStarEmoji = (count: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <motion.span
        key={i}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: i < count ? 1 : 0.6, rotate: 0 }}
        transition={{ delay: 0.5 + i * 0.2, type: 'spring', stiffness: 300 }}
        className={`text-5xl ${i < count ? '' : 'opacity-20 grayscale'}`}
      >
        ⭐
      </motion.span>
    ));
  };

  return (
    <div dir="rtl" className="relative flex flex-col min-h-screen bg-gradient-to-b from-yellow-50 via-pink-50 to-emerald-50 p-4 max-w-lg mx-auto overflow-hidden">
      {/* Confetti */}
      {result.starsEarned > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {confettiPieces.map((piece) => (
            <ConfettiPiece key={piece.id} {...piece} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-4"
        >
          <span className="text-8xl">🏆</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-extrabold text-gray-800 mb-2"
        >
          أحسنت! 🎊
        </motion.h1>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 mb-6"
        >
          {getStarEmoji(result.starsEarned)}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 30 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-3 mb-6"
        >
          {/* Score */}
          <Card className="p-4 bg-gradient-to-l from-purple-50 to-white border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-bold text-gray-700">النتيجة</span>
              </div>
              <span className="text-2xl font-extrabold text-purple-600">{result.score}</span>
            </div>
          </Card>

          {/* Correct/Wrong */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-gradient-to-l from-emerald-50 to-white border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-gray-600">صحيح</span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{result.correctCount}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-l from-red-50 to-white border-red-200">
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
                <Zap className="w-5 h-5 text-orange-500" />
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

          {/* Accuracy */}
          <Card className="p-4 bg-gradient-to-l from-amber-50 to-white border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الدقة</span>
              <span className="text-xl font-extrabold text-amber-600">{accuracy}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-l from-amber-400 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ delay: 1, duration: 1 }}
              />
            </div>
          </Card>

          {/* Rewards */}
          <Card className="p-4 bg-gradient-to-l from-yellow-50 to-white border-yellow-300 shadow-md">
            <p className="font-bold text-gray-700 mb-3 text-center">🎁 المكافآت</p>
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: 'spring' }}
                className="text-center"
              >
                <div className="text-3xl mb-1">⭐</div>
                <p className="text-xs text-gray-500">نقاط</p>
                <p className="font-bold text-purple-600">+{result.pointsEarned}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: 'spring' }}
                className="text-center"
              >
                <div className="text-3xl mb-1">🪙</div>
                <p className="text-xs text-gray-500">عملات</p>
                <p className="font-bold text-amber-600">+{result.coinsEarned}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.6, type: 'spring' }}
                className="text-center"
              >
                <div className="text-3xl mb-1">💎</div>
                <p className="text-xs text-gray-500">جواهر</p>
                <p className="font-bold text-teal-600">+{result.gemsEarned}</p>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
          transition={{ delay: 1.5 }}
          className="w-full space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playSound('click'); onPlayAgain(); }}
            className="w-full rounded-2xl p-4 text-xl font-bold bg-gradient-to-l from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            العب مرة أخرى 🔄
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
    </div>
  );
}
