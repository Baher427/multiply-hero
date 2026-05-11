'use client';

import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/game-store';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import GameResults from '@/components/games/GameResults';
import { useState } from 'react';
import { generateQuestions } from '@/lib/game-engine/question-generator';
import type { GameResult } from '@/types';

export default function GameResultsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const { gameConfig, resetGame, startGame } = useGameStore();
  const { goBack } = useSmartBack('/dashboard');

  // Load game result from session storage - use lazy initialization
  const [gameResult, setGameResult] = useState<GameResult | null>(() => {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('lastGameResult');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch { /* ignore */ }
      }
    }
    return null;
  });

  const handlePlayAgain = () => {
    if (gameConfig) {
      const questions = generateQuestions(gameConfig);
      startGame(gameConfig, questions);
      router.push('/games/play');
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <div className="text-white/50">جاري التحميل...</div>
      </div>
    );
  }

  if (!gameResult) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <div className="text-center">
          <p className="text-white/50 mb-4">لا توجد نتائج</p>
          <button onClick={() => router.replace('/games')} className="text-emerald-400 hover:text-emerald-300">
            العب لعبة جديدة
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameResults
      result={gameResult}
      onPlayAgain={handlePlayAgain}
      onDashboard={goBack}
    />
  );
}
