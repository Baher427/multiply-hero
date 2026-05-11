'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/auth-store';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import ProgressMap from '@/components/world/ProgressMap';
import { useState, useEffect } from 'react';
import type { TableProgressData } from '@/types';

export default function WorldMapPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuthGuard();
  const { setSelectedTable } = useAppStore();
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

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return (
    <ProgressMap
      tableProgress={tableProgress}
      onSelectTable={(tableNumber) => {
        setSelectedTable(tableNumber);
        router.push('/games');
      }}
      onBack={goBack}
    />
  );
}
