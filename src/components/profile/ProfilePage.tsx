'use client';
import { useRouter } from 'next/navigation';
import { useAuthGuard, useLogoutNavigation, useSmartBack } from '@/lib/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, LogOut, User, Shield, Settings, Gamepad2, Trophy, Star, Coins, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AVATARS } from '@/lib/game-engine/constants';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, selectedChild, logout } = useAuthGuard();
  const { navigateAfterLogout } = useLogoutNavigation();
  const { goBack } = useSmartBack('/dashboard');

  const handleLogout = async () => {
    await logout();
    navigateAfterLogout();
  };

  if (isLoading || !isAuthenticated || !user) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  const avatar = AVATARS.find(a => a.id === (selectedChild?.avatarId || 'lion'));

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={goBack} className="text-white/50 hover:text-white transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">الملف الشخصي</h1>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl">
              {avatar?.emoji || '🦁'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedChild?.displayName || user.displayName || user.username}</h2>
              <p className="text-white/50">@{user.username}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  user.role === 'admin' ? 'bg-red-500/30 text-red-300' :
                  user.role === 'parent' ? 'bg-purple-500/30 text-purple-300' :
                  'bg-emerald-500/30 text-emerald-300'
                }`}>
                  {user.role === 'admin' ? 'مدير' : user.role === 'parent' ? 'ولي أمر' : 'لاعب'}
                </span>
              </div>
            </div>
          </div>

          {selectedChild && (
            <div className="grid grid-cols-4 gap-3 mt-6">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-white font-bold">{selectedChild.points}</p>
                <p className="text-white/40 text-xs">نقطة</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-bold">{selectedChild.level}</p>
                <p className="text-white/40 text-xs">مستوى</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Coins className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-white font-bold">{selectedChild.coins}</p>
                <p className="text-white/40 text-xs">عملة</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Gem className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-bold">{selectedChild.gems}</p>
                <p className="text-white/40 text-xs">جوهرة</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <div className="space-y-3">
          {user.role === 'child' && (
            <>
              <Link href="/dashboard" className="block">
                <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4 flex items-center gap-3 hover:bg-white/15 transition-all">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-medium">لوحة التحكم</span>
                </div>
              </Link>
              <Link href="/settings" className="block">
                <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4 flex items-center gap-3 hover:bg-white/15 transition-all">
                  <Settings className="w-5 h-5 text-white/50" />
                  <span className="text-white font-medium">الإعدادات</span>
                </div>
              </Link>
            </>
          )}
          {user.role === 'admin' && (
            <Link href="/admin" className="block">
              <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4 flex items-center gap-3 hover:bg-white/15 transition-all">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="text-white font-medium">لوحة الإدارة</span>
              </div>
            </Link>
          )}
          {user.role === 'parent' && (
            <Link href="/parent" className="block">
              <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4 flex items-center gap-3 hover:bg-white/15 transition-all">
                <User className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">لوحة ولي الأمر</span>
              </div>
            </Link>
          )}
        </div>

        {/* Logout */}
        <div className="mt-8">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 rounded-xl border-red-400/30 text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}
