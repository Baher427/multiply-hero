'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock, LogIn, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isSessionValid, checkSession, logout, navigate } = useAppStore();
  const [showExpired, setShowExpired] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Periodically check session validity
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !isSessionValid()) {
        setShowExpired(true);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, isSessionValid]);

  // Countdown for lockout
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleReLogin = () => {
    setShowExpired(false);
    logout();
  };

  // If not authenticated and session expired overlay is showing
  if (showExpired) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-md w-full mx-4"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center shadow-2xl">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30"
            >
              <ShieldAlert className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-2xl font-black text-white mb-3">
              انتهت الجلسة 🔒
            </h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              انتهت صلاحية جلستك لأسباب أمنية. يرجى تسجيل الدخول مرة أخرى للمتابعة.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleReLogin}
                className="w-full h-14 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white text-lg font-bold shadow-lg border-2 border-emerald-300/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                <LogIn className="w-5 h-5 ml-2" />
                تسجيل الدخول مجدداً
              </Button>
            </motion.div>

            <p className="text-white/30 text-xs mt-4">
              لحماية حسابك، يتم تسجيل الخروج تلقائياً بعد ٣٠ دقيقة من عدم النشاط
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
