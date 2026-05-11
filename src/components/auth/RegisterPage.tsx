'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, User, Lock, Eye, EyeOff, Mail, ArrowRight, Loader2, Shield, Users, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthProvider';
import { AVATARS, COLORS } from '@/lib/game-engine/constants';
import Link from 'next/link';

type RegisterStep = 'account' | 'profile' | 'avatar';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState<RegisterStep>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Account info
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'child' | 'parent'>('child');

  // Profile info
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(7);

  // Avatar selection
  const [selectedAvatar, setSelectedAvatar] = useState('lion');
  const [selectedColor, setSelectedColor] = useState('emerald');

  const validateAccount = () => {
    if (!username || username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return false;
    }
    if (!password || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 'account') {
      if (validateAccount()) {
        setStep('profile');
      }
    } else if (step === 'profile') {
      if (!displayName) {
        setError('يرجى إدخال اسم العرض');
        return;
      }
      setError('');
      setStep('avatar');
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await register({
        username,
        password,
        role,
        displayName,
        email: email || undefined,
        age: role === 'child' ? age : undefined,
        avatarId: selectedAvatar,
        favoriteColor: selectedColor,
      });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'فشل إنشاء الحساب');
      }
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles: Record<RegisterStep, string> = {
    account: 'إنشاء الحساب',
    profile: 'معلومات شخصية',
    avatar: 'اختر شخصيتك',
  };

  const steps: RegisterStep[] = ['account', 'profile', 'avatar'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 text-6xl opacity-10 animate-bounce">🌟</div>
        <div className="absolute bottom-32 left-16 text-5xl opacity-10 animate-pulse">🎮</div>
        <div className="absolute top-40 left-32 text-4xl opacity-10 animate-bounce delay-300">🎯</div>
        <div className="absolute bottom-20 right-40 text-5xl opacity-10 animate-pulse delay-500">🏆</div>
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
          className="text-center mb-6"
        >
          <Link href="/" className="inline-block">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
              <span className="text-4xl">🦸</span>
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white">حساب جديد</h1>
          <p className="text-white/50 mt-1">انضم إلى عالم الأبطال!</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i <= currentStepIndex
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/10 text-white/30'
              }`}>
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 transition-all ${
                  i < currentStepIndex ? 'bg-emerald-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-5">{stepTitles[step]}</h2>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-red-300 text-sm text-center mb-4"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Account */}
          {step === 'account' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('child')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      role === 'child'
                        ? 'border-emerald-400 bg-emerald-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-white/50 hover:border-white/30'
                    }`}
                  >
                    <Baby className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-bold">طفل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      role === 'parent'
                        ? 'border-emerald-400 bg-emerald-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-white/50 hover:border-white/30'
                    }`}
                  >
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-bold">ولي أمر</span>
                  </button>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="اختر اسم مستخدم فريد"
                    className="h-12 pr-10 pl-4 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/30"
                    required
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
                    placeholder="6 أحرف على الأقل"
                    className="h-12 pr-10 pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/30"
                    required
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="h-12 pr-10 pl-4 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/30"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Profile */}
          {step === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">
                  {role === 'child' ? 'اسمك' : 'اسم ولي الأمر'}
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={role === 'child' ? 'ما اسمك؟' : 'الاسم الكامل'}
                  className="h-12 px-4 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/30"
                  required
                />
              </div>

              {/* Email (optional for child, required for parent) */}
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">
                  البريد الإلكتروني {role === 'parent' ? '(مطلوب)' : '(اختياري)'}
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="h-12 pr-10 pl-4 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/30"
                    required={role === 'parent'}
                  />
                </div>
              </div>

              {/* Age (for children) */}
              {role === 'child' && (
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">عمرك</label>
                  <div className="flex gap-2 flex-wrap">
                    {[5, 6, 7, 8, 9, 10, 11, 12].map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAge(a)}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                          age === a
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-white/10 text-white/50 hover:bg-white/20'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Avatar */}
          {step === 'avatar' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              {/* Avatar Selection */}
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">اختر شخصيتك</label>
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                  {AVATARS.filter(a => a.unlockLevel <= 1).map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                        selectedAvatar === avatar.id
                          ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-110 shadow-lg'
                          : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                      }`}
                      title={avatar.name}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">لونك المفضل</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(color => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        selectedColor === color.id
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
                  {AVATARS.find(a => a.id === selectedAvatar)?.emoji || '🦁'}
                </div>
                <div>
                  <p className="text-white font-bold">{displayName || username}</p>
                  <p className="text-white/50 text-sm">@{username}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {step !== 'account' && (
              <Button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(step === 'avatar' ? 'profile' : 'account');
                }}
                variant="outline"
                className="h-12 px-6 rounded-xl border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
              >
                رجوع
              </Button>
            )}

            {step !== 'avatar' ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full h-12 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                  التالي
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  type="button"
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 ml-2" />
                      إنشاء الحساب
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-sm">
            لديك حساب بالفعل؟{' '}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
            >
              سجّل دخولك
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
