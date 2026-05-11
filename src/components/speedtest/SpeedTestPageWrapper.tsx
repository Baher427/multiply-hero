'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useGameStore } from '@/stores/game-store';
import SpeedTestPage from '@/components/speedtest/SpeedTestPage';
import { useEffect } from 'react';

export default function SpeedTestPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuth();
  const { startGame } = useGameStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const handleComplete = (result: any) => {
    const enrichedResult = {
      ...result,
      pointsEarned: result.score,
      starsEarned: 0,
      coinsEarned: Math.round(result.correctCount * 3),
      gemsEarned: 0,
    };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('lastGameResult', JSON.stringify(enrichedResult));
    }
    if (selectedChild) {
      fetch('/api/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChild.id,
          gameType: 'multiple-choice',
          tableNumber: 0,
          score: result.score,
          correctCount: result.correctCount,
          wrongCount: result.wrongCount,
          duration: result.duration,
          totalPoints: result.score,
          coinsEarned: Math.round(result.correctCount * 3),
        }),
      }).catch(() => {});
    }
    router.push('/games/results');
  };

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return <SpeedTestPage onBack={() => router.push('/dashboard')} onComplete={handleComplete} />;
}
