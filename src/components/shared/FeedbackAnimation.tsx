'use client';

import { motion } from 'framer-motion';
import { useMemo, useEffect } from 'react';

interface FeedbackAnimationProps {
  type: 'correct' | 'wrong' | 'combo' | 'levelup';
  combo?: number;
  onComplete?: () => void;
}

export default function FeedbackAnimation({ type, combo = 0, onComplete }: FeedbackAnimationProps) {
  const particles = useMemo(() => {
    const emojis = type === 'correct' 
      ? ['⭐', '✨', '🌟', '💫'] 
      : type === 'combo'
      ? ['🔥', '💥', '⚡', '🌟']
      : type === 'levelup'
      ? ['🎉', '🎊', '🏆', '👑', '💎']
      : ['💪', '💚'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200,
      y: -Math.random() * 150 - 50,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: i * 0.05,
    }));
  }, [type]);

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const mainText = type === 'correct' 
    ? 'أحسنت! ✅' 
    : type === 'wrong'
    ? 'لا بأس! 💚'
    : type === 'combo'
    ? `كومبو ${combo}! 🔥`
    : 'مستوى جديد! 🎉';

  const mainColor = type === 'correct'
    ? 'from-emerald-400 to-teal-400'
    : type === 'wrong'
    ? 'from-amber-400 to-orange-400'
    : type === 'combo'
    ? 'from-rose-400 to-orange-400'
    : 'from-yellow-400 to-amber-400';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.4 }}
        className={`bg-gradient-to-r ${mainColor} text-white text-3xl font-bold rounded-2xl px-8 py-4 shadow-2xl`}
      >
        {mainText}
      </motion.div>
      
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.5 }}
          transition={{ duration: 1, delay: p.delay }}
          className="absolute text-2xl"
        >
          {p.emoji}
        </motion.span>
      ))}
    </motion.div>
  );
}
