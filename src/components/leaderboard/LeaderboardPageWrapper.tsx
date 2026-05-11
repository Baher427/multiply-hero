'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import LeaderboardPage from '@/components/leaderboard/LeaderboardPage';
import { useEffect } from 'react';

export default function LeaderboardPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || !selectedChild) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return (
    <LeaderboardPage
      currentChild={{
        id: selectedChild.id,
        name: selectedChild.name,
        displayName: selectedChild.displayName,
        avatarId: selectedChild.avatarId,
        points: selectedChild.points,
        level: selectedChild.level,
      }}
      onBack={() => router.push('/dashboard')}
    />
  );
}
