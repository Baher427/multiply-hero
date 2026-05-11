'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ParentDashboard from '@/components/parent/ParentDashboard';
import { useEffect } from 'react';

export default function ParentPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, selectedChild } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
    if (!isLoading && isAuthenticated && user?.role !== 'parent' && user?.role !== 'admin') router.push('/dashboard');
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return <ParentDashboard childId={selectedChild?.id || ''} onBack={() => router.push('/dashboard')} />;
}
