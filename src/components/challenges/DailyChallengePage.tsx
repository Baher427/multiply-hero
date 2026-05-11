'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import DailyChallenge from '@/components/challenges/DailyChallenge';
import { generateQuestions } from '@/lib/game-engine/question-generator';
import type { GameConfig } from '@/types';
import { useEffect } from 'react';

export default function DailyChallengePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuth();
  const { setSelectedTable, setSelectedGameType } = useAppStore();
  const { startGame } = useGameStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const handleStartChallenge = (tables: number[], difficulty: 'easy' | 'medium' | 'hard') => {
    const config: GameConfig = {
      gameType: 'multiple-choice',
      tableNumber: 'mixed',
      questionCount: difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12,
      difficulty,
    };
    const questions = generateQuestions(config);
    startGame(config, questions);
    setSelectedTable('mixed');
    setSelectedGameType('multiple-choice');
    router.push('/games/play');
  };

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return (
    <DailyChallenge
      streak={selectedChild?.streak || 0}
      lastActiveDate={selectedChild?.lastActiveDate || null}
      onStartChallenge={handleStartChallenge}
      onBack={() => router.push('/dashboard')}
    />
  );
}
