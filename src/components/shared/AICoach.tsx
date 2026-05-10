'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { COACH_MESSAGES } from '@/lib/game-engine/constants';

interface AICoachProps {
  type?: 'encouragement' | 'hint' | 'celebration' | 'comfort' | 'guidance';
  message?: string;
  show: boolean;
  onHide?: () => void;
}

export default function AICoach({ type = 'encouragement', message, show, onHide }: AICoachProps) {
  const [isVisible, setIsVisible] = useState(false);

  const currentMessage = useMemo(() => {
    return message || COACH_MESSAGES[type][Math.floor(Math.random() * COACH_MESSAGES[type].length)];
  }, [message, type]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onHide?.();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onHide]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3 max-w-sm">
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              🤖
            </motion.span>
            <p className="text-base font-medium">{currentMessage}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
