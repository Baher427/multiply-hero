'use client';

import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

export default function SoundToggle() {
  const { soundEnabled, toggleSound } = useAppStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleSound}
      className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-emerald-100 hover:border-emerald-300 transition-colors"
      aria-label={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5 text-emerald-600" />
      ) : (
        <VolumeX className="w-5 h-5 text-gray-400" />
      )}
    </motion.button>
  );
}
