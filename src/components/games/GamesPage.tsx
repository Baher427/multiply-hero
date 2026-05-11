'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import GameSelector from '@/components/games/GameSelector';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { generateQuestions } from '@/lib/game-engine/question-generator';
import { getRecommendedTable } from '@/lib/game-engine/adaptive-engine';
import type { GameConfig } from '@/types';

export default function GamesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuth();
  const { setSelectedTable, setSelectedGameType } = useAppStore();
  const { startGame } = useGameStore();
  const [tableProgress, setTableProgress] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (selectedChild) {
      fetch(`/api/progress?childId=${selectedChild.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setTableProgress(data.data); })
        .catch(() => {});
    }
  }, [selectedChild]);

  const recommendedTable = tableProgress.length > 0 ? getRecommendedTable(tableProgress) : 1;

  const handleStartGame = (gameType: string, tableNum: number | 'mixed', difficulty: 'easy' | 'medium' | 'hard') => {
    const config: GameConfig = {
      gameType: gameType as any,
      tableNumber: tableNum,
      questionCount: gameType === 'matching' ? 5 : difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12,
      difficulty,
    };

    const questions = generateQuestions(config);
    startGame(config, questions);
    setSelectedTable(tableNum);
    setSelectedGameType(gameType as any);

    router.push('/games/play');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <GameSelector
      onSelectGame={handleStartGame}
      onBack={() => router.push('/dashboard')}
      recommendedTable={recommendedTable}
    />
  );
}
