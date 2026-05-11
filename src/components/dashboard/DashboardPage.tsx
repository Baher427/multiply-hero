'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import ChildDashboard from '@/components/dashboard/ChildDashboard';
import type { ChildProfile, TableProgressData } from '@/types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, selectedChild, setSelectedChild, logout } = useAuth();
  const { setSelectedTable, setSelectedGameType } = useAppStore();

  const [tableProgress, setTableProgress] = useState<TableProgressData[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Array<{ badgeType: string; earnedAt: string }>>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchChildData = useCallback(async (childId: string) => {
    setIsLoadingData(true);
    try {
      const [progressRes, badgesRes] = await Promise.all([
        fetch(`/api/progress?childId=${childId}`),
        fetch(`/api/badges?childId=${childId}`),
      ]);
      const progressData = await progressRes.json();
      const badgesData = await badgesRes.json();
      if (progressData.success) setTableProgress(progressData.data);
      if (badgesData.success) setEarnedBadges(badgesData.data);
    } catch (error) {
      console.error('Failed to fetch child data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Load child data
  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild.id);
    } else if (user?.childId) {
      fetch(`/api/children/${user.childId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const child = data.data.child || data.data;
            setSelectedChild(child);
            fetchChildData(child.id);
          }
        })
        .catch(() => setIsLoadingData(false));
    } else {
      setIsLoadingData(false);
    }
  }, [selectedChild, user?.childId, fetchChildData, setSelectedChild]);

  // Refresh on focus
  useEffect(() => {
    const handleFocus = () => {
      if (selectedChild) fetchChildData(selectedChild.id);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedChild, fetchChildData]);

  if (isLoading || !isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-emerald-400" />
        </motion.div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <p className="text-white/50">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <ChildDashboard
      child={selectedChild}
      tableProgress={tableProgress}
      earnedBadges={earnedBadges}
      onStartGame={() => router.push('/games')}
      onDailyChallenge={() => router.push('/daily-challenge')}
      onAchievements={() => router.push('/achievements')}
      onWorldMap={() => router.push('/world-map')}
      onStoryMode={() => router.push('/story-mode')}
      onProfile={() => router.push('/profile')}
      onSettings={() => router.push('/settings')}
      onLeaderboard={() => router.push('/leaderboard')}
      onShop={() => router.push('/shop')}
      onPractice={() => router.push('/practice')}
      onSpeedTest={() => router.push('/speed-test')}
      onBack={async () => {
        await logout();
        router.push('/');
      }}
    />
  );
}
