'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import PracticeMode from '@/components/practice/PracticeMode';
import { generateQuestions } from '@/lib/game-engine/question-generator';
import type { GameConfig } from '@/types';
import { useState, useEffect } from 'react';
import type { TableProgressData } from '@/types';

export default function PracticePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuthGuard();
  const { setSelectedTable, setSelectedGameType } = useAppStore();
  const { startGame } = useGameStore();
  const [tableProgress, setTableProgress] = useState<TableProgressData[]>([]);
  const { goBack } = useSmartBack('/dashboard');

  useEffect(() => {
    if (selectedChild) {
      fetch(`/api/progress?childId=${selectedChild.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setTableProgress(data.data); })
        .catch(() => {});
    }
  }, [selectedChild]);

  const handleStartGame = (gameType: string, tableNumber: number | 'mixed', difficulty: 'easy' | 'medium' | 'hard') => {
    const config: GameConfig = {
      gameType: gameType as any,
      tableNumber,
      questionCount: gameType === 'matching' ? 5 : difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12,
      difficulty,
    };
    const questions = generateQuestions(config);
    startGame(config, questions);
    setSelectedTable(tableNumber);
    setSelectedGameType(gameType as any);
    router.push('/games/play');
  };

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  if (!selectedChild) return null;

  return (
    <PracticeMode
      currentChild={{
        id: selectedChild.id,
        name: selectedChild.name,
        displayName: selectedChild.displayName,
        avatarId: selectedChild.avatarId,
        points: selectedChild.points,
        level: selectedChild.level,
      }}
      tableProgress={tableProgress}
      onBack={goBack}
      onStartGame={handleStartGame}
    />
  );
}
