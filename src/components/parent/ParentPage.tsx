'use client';
import { useRouter } from 'next/navigation';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import ParentDashboard from '@/components/parent/ParentDashboard';

export default function ParentPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuthGuard({ requiredRole: 'parent' });
  const { goBack } = useSmartBack('/dashboard');

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return <ParentDashboard childId={selectedChild?.id || ''} onBack={goBack} />;
}
