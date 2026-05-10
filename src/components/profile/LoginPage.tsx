'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import AvatarImage from '@/components/shared/AvatarImage';
import { useSound } from '@/hooks/use-sound';

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

export default function LoginPage({ childList, onSelectChild, onNewChild, onBack }: LoginPageProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [isEntering, setIsEntering] = useState(false);
  const [showPinError, setShowPinError] = useState(false);
  const { play } = useSound();

  const selectedChild = childList.find(c => c.id === selectedChildId);

  const handleChildClick = (childId: string) => {
    play('click');
    setSelectedChildId(childId);
    setPinValue('');
    setShowPinError(false);
    setIsEntering(true);
  };

  const handlePinComplete = (value: string) => {
    setPinValue(value);
    if (value.length === 4) {
      // For now, PIN is optional — just proceed
      onSelectChild(selectedChildId!);
    }
  };

  const handleSkipPin = () => {
    if (selectedChildId) {
      play('star');
      onSelectChild(selectedChildId);
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

      {/* Subtle background pattern - geometric shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
        <div className="absolute top-[10%] right-[5%] w-32 h-32 rounded-full border-4 border-white" />
        <div className="absolute top-[40%] left-[8%] w-24 h-24 rotate-45 border-4 border-white" />
        <div className="absolute bottom-[20%] right-[15%] w-20 h-20 rounded-full border-4 border-white" />
        <div className="absolute top-[60%] right-[30%] w-16 h-16 rotate-12 border-4 border-white" />
        <div className="absolute bottom-[40%] left-[25%] w-28 h-28 rounded-full border-4 border-white" />
        <div className="absolute top-[25%] left-[40%] w-12 h-12 rotate-45 border-4 border-white" />
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
                        className="w-full group relative overflow-hidden rounded-2xl p-[2px]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(20,184,166,0.3) 50%, rgba(251,191,36,0.5) 100%)',
                        }}
                      >
                        {/* Inner card */}
                        <div
                          className="rounded-[14px] p-5 transition-all group-hover:bg-white/15"
                          style={{
                            background: 'rgba(6,78,59,0.6)',
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          {/* Card glow */}
                          <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl transition-all group-hover:scale-150" />

                          <div className="relative flex items-center gap-4">
                            {/* 3D Avatar with glow */}
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
                  /* Empty state - warm and inviting */
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
                className="text-emerald-100/70 mb-8"
              >
                أدخل رمزك السرّي للمتابعة
              </motion.p>

              {/* PIN Input */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="flex justify-center mb-6"
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
                    className="text-rose-300 text-sm mb-4"
                  >
                    الرمز غير صحيح، حاول مرة أخرى 🔐
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Skip PIN / Enter without PIN */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleSkipPin}
                  className="w-full h-12 rounded-2xl bg-gradient-to-l from-amber-400 via-yellow-400 to-amber-500 text-emerald-900 text-base font-bold shadow-lg border-2 border-amber-300/50"
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
          🔒 حسابك آمن معنا
        </motion.p>
      </motion.div>
    </div>
  );
}
