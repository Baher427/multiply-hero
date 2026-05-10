'use client';

import { motion } from 'framer-motion';

interface ChildSelectorProps {
  childProfiles: Array<{
    id: string;
    name: string;
    displayName: string;
    avatarId: string;
    level: number;
    points: number;
  }>;
  onSelect: (childId: string) => void;
  onNewChild: () => void;
  onBack: () => void;
}

const AVATAR_MAP: Record<string, string> = {
  lion: '🦁', cat: '🐱', bear: '🐻', rabbit: '🐰', elephant: '🐘',
  tiger: '🐯', dog: '🐶', owl: '🦉', monkey: '🐵', panda: '🐼',
  frog: '🐸', penguin: '🐧', fox: '🦊', unicorn: '🦄', dragon: '🐉',
  'star-face': '🤩', 'cool-face': '😎', 'heart-face': '😍', 'party-face': '🥳', 'nerd-face': '🤓',
  apple: '🍎', strawberry: '🍓', watermelon: '🍉', banana: '🍌',
  rocket: '🚀', crown: '👑', gem: '💎', trophy: '🏆', rainbow: '🌈', balloon: '🎈',
};

export default function ChildSelector({ childProfiles, onSelect, onNewChild, onBack }: ChildSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-8" dir="rtl">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
            من أنت؟ 🤔
          </h1>
          <p className="text-gray-600 text-lg">اختار اسمك أو أنشئ ملف جديد</p>
        </motion.div>

        {childProfiles.length > 0 && (
          <div className="space-y-3 mb-6">
            {childProfiles.map((child, i) => (
              <motion.button
                key={child.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(child.id)}
                className="w-full bg-white rounded-2xl p-4 shadow-md border-2 border-emerald-100 hover:border-emerald-300 flex items-center gap-4 transition-colors"
              >
                <span className="text-4xl">{AVATAR_MAP[child.avatarId] || '🦁'}</span>
                <div className="flex-1 text-right">
                  <p className="text-lg font-bold text-gray-800">{child.displayName}</p>
                  <p className="text-sm text-gray-500">المستوى {child.level} • {child.points} نقطة</p>
                </div>
                <span className="text-2xl">←</span>
              </motion.button>
            ))}
          </div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChild}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-4 shadow-lg text-lg font-bold flex items-center justify-center gap-3 mb-4"
        >
          <span className="text-2xl">➕</span>
          ملف جديد
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onBack}
          className="w-full text-gray-500 py-3 text-base hover:text-gray-700 transition-colors"
        >
          → العودة
        </motion.button>
      </div>
    </div>
  );
}
