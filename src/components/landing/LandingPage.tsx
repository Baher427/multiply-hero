'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface LandingPageProps {
  onStart: () => void;
  onAdmin: () => void;
  onParent: () => void;
}

// Floating decoration element
interface FloatingElement {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const FLOATING_EMOJIS = [
  '⭐', '✨', '🌟', '💫', '2', '3', '7', '×', '÷', '=',
  '🏆', '🎯', '🔥', '💪', '🎉', '🌈', '9', '5', '+', '8',
];

const FEATURES = [
  {
    emoji: '🎮',
    title: '٤ أساليب لعب',
    description: 'تحدّيات سريعة، بطولات، تمرين حرّ، والعب مع الأصدقاء!',
    gradient: 'from-emerald-400 to-teal-500',
    bgGlow: 'bg-emerald-400/20',
  },
  {
    emoji: '🏅',
    title: 'شارات وجوائز',
    description: 'اجمع شارات رائعة وافتح إنجازات جديدة كل يوم!',
    gradient: 'from-amber-400 to-orange-500',
    bgGlow: 'bg-amber-400/20',
  },
  {
    emoji: '📅',
    title: 'تحدّيات يومية',
    description: 'تحدّيات جديدة كل يوم لتصبح بطل الضرب!',
    gradient: 'from-cyan-400 to-teal-500',
    bgGlow: 'bg-cyan-400/20',
  },
  {
    emoji: '📊',
    title: 'تتبّع التقدّم',
    description: 'شاهد تقدّمك وتعلّم من أخطائك مع تقارير مفصّلة!',
    gradient: 'from-rose-400 to-pink-500',
    bgGlow: 'bg-rose-400/20',
  },
];

export default function LandingPage({ onStart, onAdmin, onParent }: LandingPageProps) {
  const [mascotBounce, setMascotBounce] = useState(false);

  // Generate floating elements with stable random values
  const floatingElements: FloatingElement[] = (() => {
    // Use a seeded approach for consistent rendering
    const elements: FloatingElement[] = [];
    let seed = 42;
    const seededRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 24; i++) {
      elements.push({
        id: i,
        emoji: FLOATING_EMOJIS[i % FLOATING_EMOJIS.length],
        x: seededRandom() * 100,
        y: seededRandom() * 100,
        size: 16 + seededRandom() * 24,
        duration: 6 + seededRandom() * 8,
        delay: seededRandom() * 4,
      });
    }
    return elements;
  })();

  // Periodic mascot bounce
  useEffect(() => {
    const interval = setInterval(() => {
      setMascotBounce(true);
      setTimeout(() => setMascotBounce(false), 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 120, damping: 14 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
        delay: 0.6 + i * 0.12,
      },
    }),
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #064e3b 0%, #0d9488 35%, #14b8a6 60%, #06b6d4 100%)',
      }}
    >
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #34d399 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #a7f3d0 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.4, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating decoration elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {floatingElements.map((el) => (
            <motion.span
              key={el.id}
              className="absolute select-none"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                fontSize: `${el.size}px`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.7, 0.4, 0.7],
                scale: [0, 1, 0.85, 1],
                y: [0, -20, 0],
              }}
              transition={{
                duration: el.duration,
                delay: el.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {el.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 flex min-h-screen flex-col items-center px-4 py-8 sm:px-6 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="mb-6 text-center md:mb-10">
          {/* Title */}
          <motion.h1
            className="mb-3 text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl"
            style={{
              textShadow:
                '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(52,211,153,0.3)',
            }}
          >
            <motion.span
              className="inline-block"
              animate={{ rotate: [0, -2, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              MultiplyHero
            </motion.span>
            <br />
            <motion.span
              className="inline-block bg-gradient-to-l from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent"
              style={{
                textShadow: 'none',
                filter: 'drop-shadow(0 2px 8px rgba(251,191,36,0.4))',
              }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              بطل الضرب
            </motion.span>
          </motion.h1>

          {/* Subtitle sparkle */}
          <motion.div
            className="mb-4 flex items-center justify-center gap-2 text-lg text-emerald-100 sm:text-xl"
            variants={itemVariants}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="inline-block text-2xl"
            >
              ✨
            </motion.span>
            <span>تعلّم جدول الضرب بطريقة مرحة ومشوّقة!</span>
            <motion.span
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="inline-block text-2xl"
            >
              ✨
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Mascot Area */}
        <motion.div
          variants={itemVariants}
          className="relative mb-8 md:mb-12"
        >
          {/* Glow ring behind mascot */}
          <motion.div
            className="absolute inset-0 -m-4 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Mascot emoji */}
          <motion.div
            className="relative text-8xl sm:text-9xl md:text-[10rem]"
            animate={
              mascotBounce
                ? {
                    y: [0, -25, 0],
                    rotate: [0, -8, 8, 0],
                    scale: [1, 1.15, 1],
                  }
                : { y: [0, -8, 0] }
            }
            transition={
              mascotBounce
                ? { duration: 0.6, ease: 'easeOut' }
                : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
          >
            🦁
          </motion.div>
          {/* Mascot speech bubble */}
          <motion.div
            className="absolute -top-2 -left-4 rounded-2xl bg-white/95 px-3 py-1.5 text-sm font-bold text-emerald-700 shadow-lg sm:-top-4 sm:-left-8 sm:px-4 sm:py-2 sm:text-base"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              أنا أسامي، هيا نلعب! 🎉
            </motion.span>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 right-6 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95" />
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mb-8 max-w-lg text-center text-base leading-relaxed text-emerald-100/90 sm:text-lg md:mb-12 md:max-w-xl md:text-xl"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
          منصّة تعليمية تفاعلية لتعلّم جدول الضرب من خلال ألعاب ممتعة وتحدّيات
          مثيرة! 🚀 طفلك سيتعلّم ويستمتع في آن واحد مع بطل الضرب.
        </motion.p>

        {/* Start Playing Button */}
        <motion.div variants={itemVariants} className="mb-12 md:mb-16">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Button glow */}
            <motion.div
              className="absolute inset-0 -m-2 rounded-3xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(251,191,36,0.5), rgba(245,158,11,0.5))',
                filter: 'blur(12px)',
              }}
              animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Button
              onClick={onStart}
              className="relative h-16 rounded-3xl border-2 border-amber-300/50 bg-gradient-to-l from-amber-400 via-yellow-400 to-amber-500 px-10 text-xl font-extrabold text-emerald-900 shadow-2xl transition-all sm:h-18 sm:text-2xl md:h-20 md:px-14 md:text-3xl"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                boxShadow:
                  '0 8px 32px rgba(251,191,36,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
              }}
            >
              <motion.span
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                🎮
              </motion.span>
              ابدأ اللعب!
              <motion.span
                className="inline-block"
                animate={{ x: [0, -4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3,
                }}
              >
                🎮
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="mb-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:mb-16 md:gap-6"
          variants={containerVariants}
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={cardVariants}
              whileHover={{
                y: -6,
                scale: 1.03,
                transition: { type: 'spring', stiffness: 300, damping: 15 },
              }}
              className="group relative cursor-default overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition-colors hover:bg-white/20 sm:p-6"
              style={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              {/* Card glow effect */}
              <div
                className={`absolute -top-12 -right-12 h-24 w-24 rounded-full ${feature.bgGlow} blur-2xl transition-all group-hover:scale-150`}
              />

              {/* Emoji icon */}
              <motion.div
                className="mb-3 text-4xl sm:text-5xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.5,
                }}
              >
                {feature.emoji}
              </motion.div>

              {/* Card title */}
              <h3
                className={`mb-1.5 text-lg font-bold bg-gradient-to-l ${feature.gradient} bg-clip-text text-transparent sm:text-xl`}
              >
                {feature.title}
              </h3>

              {/* Card description */}
              <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                {feature.description}
              </p>

              {/* Bottom gradient line */}
              <div
                className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-l ${feature.gradient} transition-all group-hover:w-20`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats / Fun fact strip */}
        <motion.div
          variants={itemVariants}
          className="mb-12 flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:mb-16"
        >
          {[
            { emoji: '📚', text: '+١٠٠٠ سؤال' },
            { emoji: '🌍', text: 'للأعمار ٥-١٢' },
            { emoji: '⏱️', text: 'تحدّيات سريعة' },
            { emoji: '📈', text: 'تعلّم ذكي' },
          ].map((stat, i) => (
            <motion.div
              key={stat.text}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-base"
              whileHover={{
                scale: 1.08,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.1, type: 'spring' }}
            >
              <span className="text-lg">{stat.emoji}</span>
              {stat.text}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom buttons: Admin & Parent */}
        <motion.div
          variants={itemVariants}
          className="mt-auto flex flex-col items-center gap-3 pt-8 sm:flex-row sm:gap-4"
        >
          <Button
            onClick={onParent}
            variant="ghost"
            className="h-9 rounded-full border border-white/15 bg-white/5 px-5 text-xs font-medium text-white/60 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white/80 sm:text-sm"
          >
            👨‍👩‍👧 أولياء الأمور
          </Button>
          <Button
            onClick={onAdmin}
            variant="ghost"
            className="h-9 rounded-full border border-white/10 bg-white/5 px-5 text-xs font-medium text-white/40 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white/60 sm:text-sm"
          >
            ⚙️ المشرف
          </Button>
        </motion.div>

        {/* Footer text */}
        <motion.p
          className="mt-4 mb-2 text-center text-xs text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          © ٢٠٢٦ MultiplyHero — بطل الضرب 💚
        </motion.p>
      </motion.div>
    </div>
  );
}
