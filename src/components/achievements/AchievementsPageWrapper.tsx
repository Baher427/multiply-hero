'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import AchievementsPage from '@/components/achievements/AchievementsPage';
import { useEffect, useState } from 'react';

export default function AchievementsPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<Array<{ badgeType: string; earnedAt: string }>>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (selectedChild) {
      fetch(`/api/badges?childId=${selectedChild.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setEarnedBadges(data.data); })
        .catch(() => {});
    }
  }, [selectedChild]);

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return <AchievementsPage earnedBadges={earnedBadges} onBack={() => router.push('/dashboard')} />;
}
