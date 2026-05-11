import { Suspense } from 'react';
import LoginPage from '@/components/auth/LoginPageNew';

export default function LoginRoute() {
  return (
    <Suspense fallback={
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">جاري التحميل...</p>
        </div>
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
