'use client';
import { useRouter } from 'next/navigation';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import LeaderboardPage from '@/components/leaderboard/LeaderboardPage';

export default function LeaderboardPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuthGuard();
  const { goBack } = useSmartBack('/dashboard');

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
      onBack={goBack}
    />
  );
}
