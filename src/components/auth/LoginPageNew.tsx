'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function LoginPageNew() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        router.push(redirect);
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
      }
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 text-6xl opacity-10 animate-bounce">🧮</div>
        <div className="absolute bottom-32 left-16 text-5xl opacity-10 animate-pulse">✖️</div>
        <div className="absolute top-40 left-32 text-4xl opacity-10 animate-bounce delay-300">🔢</div>
        <div className="absolute bottom-20 right-40 text-5xl opacity-10 animate-pulse delay-500">⭐</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
              <span className="text-4xl">🦸</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">مرحباً بعودتك!</h1>
          <p className="text-white/50 mt-2">سجّل دخولك لمتابعة التعلم</p>
        </motion.div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-red-300 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="h-12 pr-10 pl-4 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/30"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="h-12 pr-10 pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/30"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full h-12 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">أو</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-white/50 text-sm">
              ليس لديك حساب؟{' '}
              <Link
                href="/register"
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                أنشئ حساب جديد
                <ArrowRight className="w-4 h-4 inline mr-1" />
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
