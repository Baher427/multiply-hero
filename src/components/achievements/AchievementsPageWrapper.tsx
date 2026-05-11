'use client';
import { useRouter } from 'next/navigation';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import AchievementsPage from '@/components/achievements/AchievementsPage';
import { useState, useEffect } from 'react';

export default function AchievementsPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuthGuard();
  const [earnedBadges, setEarnedBadges] = useState<Array<{ badgeType: string; earnedAt: string }>>([]);
  const { goBack } = useSmartBack('/dashboard');

  useEffect(() => {
    if (selectedChild) {
      fetch(`/api/badges?childId=${selectedChild.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setEarnedBadges(data.data); })
        .catch(() => {});
    }
  }, [selectedChild]);

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return <AchievementsPage earnedBadges={earnedBadges} onBack={goBack} />;
}
