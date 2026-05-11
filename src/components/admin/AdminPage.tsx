'use client';
import { useRouter } from 'next/navigation';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthGuard({ requiredRole: 'admin' });
  const { goBack } = useSmartBack('/');

  if (isLoading || !isAuthenticated) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return <AdminDashboard onBack={goBack} />;
}
