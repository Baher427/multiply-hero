'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import StoryMode from '@/components/story/StoryMode';
import { generateQuestions } from '@/lib/game-engine/question-generator';
import type { GameConfig } from '@/types';
import { useEffect, useState } from 'react';
import type { TableProgressData } from '@/types';

export default function StoryModePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuth();
  const { setSelectedTable, setSelectedGameType } = useAppStore();
  const { startGame } = useGameStore();
  const [tableProgress, setTableProgress] = useState<TableProgressData[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (selectedChild) {
      fetch(`/api/progress?childId=${selectedChild.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setTableProgress(data.data); })
        .catch(() => {});
    }
  }, [selectedChild]);

  const handleSelectChapter = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    const config: GameConfig = {
      gameType: 'multiple-choice',
      tableNumber,
      questionCount: 8,
      difficulty: 'easy',
    };
    const questions = generateQuestions(config);
    startGame(config, questions);
    setSelectedGameType('multiple-choice');
    router.push('/games/play');
  };

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return <StoryMode tableProgress={tableProgress} onSelectChapter={handleSelectChapter} onBack={() => router.push('/dashboard')} />;
}
