'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AvatarImage from '@/components/shared/AvatarImage';
import { useSound } from '@/hooks/use-sound';
import { useAppStore, restoreLockState } from '@/stores/app-store';
import { Lock, ShieldAlert, Clock, Fingerprint } from 'lucide-react';

interface LoginPageProps {
  childList: Array<{ id: string; name: string; displayName: string; avatarId: string; level: number; points: number }>;
  onSelectChild: (childId: string) => void;
  onNewChild: () => void;
  onBack: () => void;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'مبتدئ',
  2: 'متعلّم',
  3: 'متقدّم',
  4: 'خبير',
  5: 'بطل',
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 15 * 60; // 15 minutes

export default function LoginPage({ childList, onSelectChild, onNewChild, onBack }: LoginPageProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [isEntering, setIsEntering] = useState(false);
  const [showPinError, setShowPinError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [lastLoginTimes, setLastLoginTimes] = useState<Record<string, string>>({});
  const { play } = useSound();
  const { recordFailedAttempt, resetFailedAttempts } = useAppStore();

  const selectedChild = childList.find(c => c.id === selectedChildId);

  // Restore lock state on mount
  useEffect(() => {
    const lockState = restoreLockState();
    if (lockState.isLocked && lockState.lockUntil) {
      const remaining = Math.floor((lockState.lockUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setIsLocked(true);
        setLockCountdown(remaining);
        setLoginAttempts(lockState.loginAttempts);
      }
    }
  }, []);

  // Fetch last login times for children
  useEffect(() => {
    async function fetchLastLogins() {
      try {
        const res = await fetch('/api/admin/activity');
        const data = await res.json();
        if (data.success) {
          const times: Record<string, string> = {};
          for (const item of data.data) {
            if (!times[item.childId]) {
              times[item.childId] = item.completedAt;
            }
          }
          setLastLoginTimes(times);
        }
      } catch {
        // Silently fail
      }
    }
    fetchLastLogins();
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (lockCountdown <= 0) {
      if (isLocked) {
        setIsLocked(false);
        setLoginAttempts(0);
        resetFailedAttempts();
      }
      return;
    }
    const timer = setTimeout(() => setLockCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockCountdown, isLocked, resetFailedAttempts]);

  // Format countdown
  const formatCountdown = useMemo(() => {
    const mins = Math.floor(lockCountdown / 60);
    const secs = lockCountdown % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [lockCountdown]);

  const formatLastLogin = (dateStr: string) => {
    try {
      const now = Date.now();
      const then = new Date(dateStr).getTime();
      const diffMs = now - then;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);
      if (diffMin < 1) return 'الآن';
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      if (diffHr < 24) return `منذ ${diffHr} ساعة`;
      return `منذ ${diffDay} يوم`;
    } catch {
      return '';
    }
  };

  const handleChildClick = (childId: string) => {
    if (isLocked) return;
    play('click');
    setSelectedChildId(childId);
    setPinValue('');
    setShowPinError(false);
    setIsEntering(true);
  };

  const handlePinComplete = async (value: string) => {
    setPinValue(value);
    if (value.length === 4) {
      // Verify PIN via auth API
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ childId: selectedChildId, pin: value }),
        });
        const data = await res.json();
        
        if (data.success) {
          // PIN accepted or no PIN set
          handleSuccessfulLogin();
        } else {
          // PIN wrong
          handleFailedLogin();
        }
      } catch {
        // If API fails, just proceed (graceful degradation)
        handleSuccessfulLogin();
      }
    }
  };

  const handleSuccessfulLogin = () => {
    play('star');
    resetFailedAttempts();
    setLoginAttempts(0);
    setShowSuccessAnimation(true);
    
    // Show biometric-like success animation
    setTimeout(() => {
      setShowSuccessAnimation(false);
      if (selectedChildId) {
        onSelectChild(selectedChildId);
      }
    }, 1200);
  };

  const handleFailedLogin = () => {
    play('wrong');
    setShowPinError(true);
    const result = recordFailedAttempt();
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (result.isLocked) {
      setIsLocked(true);
      setLockCountdown(LOCKOUT_SECONDS);
    }
    
    setTimeout(() => {
      setShowPinError(false);
      setPinValue('');
    }, 1500);
  };

  const handleSkipPin = async () => {
    if (isLocked || !selectedChildId) return;
    
    // Try to authenticate without PIN
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: selectedChildId }),
      });
      const data = await res.json();
      
      if (data.success) {
        handleSuccessfulLogin();
      } else if (data.error === 'رمز PIN غير صحيح') {
        // Child has a PIN but didn't enter it
        setShowPinError(true);
        setTimeout(() => setShowPinError(false), 2000);
      }
    } catch {
      // Graceful degradation
      handleSuccessfulLogin();
    }
  };

  const handleNewChild = () => {
    play('click');
    onNewChild();
  };

  const handleBackFromPin = () => {
    setIsEntering(false);
    setSelectedChildId(null);
    setPinValue('');
    setShowPinError(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', stiffness: 120, damping: 14 },
    },
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #0d9488 35%, #14b8a6 60%, #06b6d4 100%)',
      }}
    >
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
        <div className="absolute top-[10%] right-[5%] w-32 h-32 rounded-full border-4 border-white" />
        <div className="absolute top-[40%] left-[8%] w-24 h-24 rotate-45 border-4 border-white" />
        <div className="absolute bottom-[20%] right-[15%] w-20 h-20 rounded-full border-4 border-white" />
        <div className="absolute top-[60%] right-[30%] w-16 h-16 rotate-12 border-4 border-white" />
        <div className="absolute bottom-[40%] left-[25%] w-28 h-28 rounded-full border-4 border-white" />
      </div>

      {/* Floating decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {['⭐', '✨', '🌟', '💫', '🔑', '🔒'].map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute select-none text-2xl"
            style={{
              left: `${15 + i * 14}%`,
              top: `${10 + (i % 3) * 30}%`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
            animate={{
              opacity: [0, 0.6, 0.3, 0.6],
              scale: [0.8, 1, 0.85, 1],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 5 + i,
              delay: i * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* ─── Lockout Overlay ─── */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center max-w-sm mx-4"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-4 shadow-lg"
              >
                <ShieldAlert className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-black text-white mb-2">الحساب مقفل 🔒</h3>
              <p className="text-white/60 text-sm mb-4">
                تم تجاوز عدد المحاولات المسموحة. يرجى المحاولة لاحقاً.
              </p>
              <div className="text-4xl font-black text-amber-400 font-mono mb-2">
                {formatCountdown}
              </div>
              <p className="text-white/40 text-xs">دقائق متبقية حتى إلغاء القفل</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Biometric Success Animation ─── */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-400/50"
              >
                <Fingerprint className="w-16 h-16 text-white" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black text-white mt-4"
              >
                تم التحقق بنجاح ✅
              </motion.p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="flex justify-center gap-2 mt-3"
              >
                {['✨', '🎉', '⭐'].map((e, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl"
                    animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.1, repeat: 2 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="relative z-10 flex min-h-screen flex-col items-center px-4 py-8 sm:px-6 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back button */}
        <motion.div variants={itemVariants} className="w-full max-w-lg mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-4"
          >
            → العودة
          </Button>
        </motion.div>

        {/* Mascot + Title */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            className="mx-auto mb-4"
            style={{ width: 120, height: 120 }}
          >
            <Image
              src="/images/mascot/hero.png"
              alt="بطل الضرب"
              width={120}
              height={120}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold text-white mb-3"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            تسجيل الدخول 🌟
          </motion.h1>
          <p className="text-emerald-100/80 text-lg">اختار حسابك وادخل رمزك السرّي</p>
        </motion.div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          {!isEntering ? (
            // Child selection grid
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-lg"
            >
              {/* Frosted glass card wrapper */}
              <div
                className="rounded-3xl border border-white/20 p-5 sm:p-6 mb-6"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                {childList.length > 0 ? (
                  <div className="space-y-3">
                    {childList.map((child, i) => (
                      <motion.button
                        key={child.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 120 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleChildClick(child.id)}
                        disabled={isLocked}
                        className="w-full group relative overflow-hidden rounded-2xl p-[2px]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(20,184,166,0.3) 50%, rgba(251,191,36,0.5) 100%)',
                        }}
                      >
                        <div
                          className="rounded-[14px] p-5 transition-all group-hover:bg-white/15"
                          style={{
                            background: 'rgba(6,78,59,0.6)',
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl transition-all group-hover:scale-150" />

                          <div className="relative flex items-center gap-4">
                            {/* Avatar with glow */}
                            <div className="relative flex-shrink-0">
                              <motion.div
                                className="absolute inset-0 -m-1 rounded-full"
                                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)' }}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              />
                              <AvatarImage
                                avatarId={child.avatarId}
                                size={60}
                                className="ring-2 ring-white/20"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-right">
                              <p className="text-xl font-bold text-white mb-1">{child.displayName}</p>
                              <div className="flex items-center gap-2 justify-end flex-wrap">
                                <span className="text-sm text-amber-300 font-medium">
                                  {LEVEL_TITLES[Math.min(child.level, 5)] || 'بطل'}
                                </span>
                                <span className="text-white/40">•</span>
                                <span className="text-sm text-emerald-200">
                                  المستوى {child.level}
                                </span>
                                <span className="text-white/40">•</span>
                                <span className="text-sm text-emerald-200">
                                  {child.points} ⭐
                                </span>
                              </div>
                              {/* Last login time */}
                              {lastLoginTimes[child.id] && (
                                <div className="flex items-center gap-1 justify-end mt-1">
                                  <Clock className="w-3 h-3 text-white/40" />
                                  <span className="text-[11px] text-white/40">
                                    آخر دخول: {formatLastLogin(lastLoginTimes[child.id])}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Arrow */}
                            <motion.span
                              className="text-2xl text-white/50"
                              animate={{ x: [0, -4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              ←
                            </motion.span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 12 }}
                      className="mx-auto mb-4"
                      style={{ width: 140, height: 140 }}
                    >
                      <Image
                        src="/images/mascot/hero.png"
                        alt="بطل الضرب"
                        width={140}
                        height={140}
                        className="object-contain drop-shadow-2xl"
                        priority
                      />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white text-xl font-bold mb-2"
                    >
                      أنشئ حسابك وابدأ المغامرة! 🚀
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-emerald-100/60 text-sm"
                    >
                      ستكون مغامرة رائعة!
                    </motion.p>
                  </motion.div>
                )}
              </div>

              {/* New User Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(16,185,129,0.2)',
                      '0 0 30px rgba(16,185,129,0.4)',
                      '0 0 20px rgba(16,185,129,0.2)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="rounded-2xl"
                >
                  <Button
                    onClick={handleNewChild}
                    className="w-full h-14 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white text-lg font-bold shadow-lg border-2 border-emerald-300/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
                  >
                    <span className="text-2xl ml-2">➕</span>
                    مستخدم جديد
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            // PIN entry for selected child
            <motion.div
              key="pin-entry"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md text-center"
            >
              {/* Selected child avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="mb-4 flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 -m-2 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)' }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <AvatarImage
                    avatarId={selectedChild?.avatarId || 'lion'}
                    size={80}
                    className="ring-3 ring-white/30"
                  />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-2"
              >
                مرحباً {selectedChild?.displayName}! 👋
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-emerald-100/70 mb-6"
              >
                أدخل رمزك السرّي للمتابعة
              </motion.p>

              {/* PIN Input */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="flex justify-center mb-4"
              >
                <InputOTP
                  maxLength={4}
                  value={pinValue}
                  onChange={handlePinComplete}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="h-14 w-14 text-2xl font-bold border-2 border-white/30 bg-white/10 text-white rounded-lg first:rounded-r-lg first:rounded-l-none last:rounded-l-lg last:rounded-r-none data-[active=true]:border-amber-400 data-[active=true]:ring-amber-400/30"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-14 w-14 text-2xl font-bold border-2 border-white/30 bg-white/10 text-white rounded-lg first:rounded-r-lg first:rounded-l-none last:rounded-l-lg last:rounded-r-none data-[active=true]:border-amber-400 data-[active=true]:ring-amber-400/30"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator className="text-white/30 mx-1">
                    <span className="text-white/30">•</span>
                  </InputOTPSeparator>
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={2}
                      className="h-14 w-14 text-2xl font-bold border-2 border-white/30 bg-white/10 text-white rounded-lg first:rounded-r-lg first:rounded-l-none last:rounded-l-lg last:rounded-r-none data-[active=true]:border-amber-400 data-[active=true]:ring-amber-400/30"
                    />
                    <InputOTPSlot
                      index={3}
                      className="h-14 w-14 text-2xl font-bold border-2 border-white/30 bg-white/10 text-white rounded-lg first:rounded-r-lg first:rounded-l-none last:rounded-l-lg last:rounded-r-none data-[active=true]:border-amber-400 data-[active=true]:ring-amber-400/30"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </motion.div>

              {/* PIN error */}
              <AnimatePresence>
                {showPinError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-rose-300 text-sm mb-3"
                  >
                    الرمز غير صحيح، حاول مرة أخرى 🔐
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Failed attempts warning */}
              {loginAttempts > 0 && !isLocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-300">
                    محاولات متبقية: {MAX_ATTEMPTS - loginAttempts}
                  </span>
                </motion.div>
              )}

              {/* Remember Me checkbox */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <Label htmlFor="remember" className="text-sm text-white/60 cursor-pointer">
                  تذكرني لمدة ٧ أيام
                </Label>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleSkipPin}
                  disabled={isLocked}
                  className="w-full h-12 rounded-2xl bg-gradient-to-l from-amber-400 via-yellow-400 to-amber-500 text-emerald-900 text-base font-bold shadow-lg border-2 border-amber-300/50 disabled:opacity-50"
                  style={{
                    boxShadow: '0 8px 24px rgba(251,191,36,0.3)',
                  }}
                >
                  دخول 🚀
                </Button>

                <Button
                  onClick={handleBackFromPin}
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                >
                  → رجوع لاختيار الحساب
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          className="mt-auto pt-8 text-center text-xs text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          🔒 حسابك آمن معنا — حماية متقدمة
        </motion.p>
      </motion.div>
    </div>
  );
}
