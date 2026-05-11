'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Zap,
  Trophy,
  Target,
  Brain,
  Star,
  Sparkles,
  Gamepad2,
  BarChart3,
  ArrowDown,
  Heart,
  BookOpen,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Floating math facts ────────────────────────────────────────────
const MATH_FACTS = [
  '3×7=21', '8×4=32', '6×9=54', '5×5=25', '2×8=16',
  '7×6=42', '9×3=27', '4×5=20', '1×9=9', '6×7=42',
  '8×8=64', '3×4=12', '9×2=18', '5×8=40', '7×7=49',
  '4×6=24', '2×7=14', '6×3=18', '8×5=40', '9×9=81',
];

// ─── Game mode features ─────────────────────────────────────────────
const GAME_MODES = [
  {
    icon: Zap,
    title: 'تحدّي سريع',
    description: 'أجب على الأسئلة بأسرع وقت ممكن! اختبر سرعتك ودقّتك في جدول الضرب.',
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-400/30',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-500/20',
  },
  {
    icon: Trophy,
    title: 'البطولة',
    description: 'تنافس مع نفسك وحقّق أعلى النقاط! كلّما تقدّمت، زادت الصعوبة.',
    gradient: 'from-emerald-400 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-400/30',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/20',
  },
  {
    icon: BookOpen,
    title: 'تمرين حرّ',
    description: 'تدرّب على جدول معيّن بدون ضغط وقت. تعلّم على راحتك!',
    gradient: 'from-cyan-400 to-sky-500',
    bgGradient: 'from-cyan-500/20 to-sky-500/20',
    borderColor: 'border-cyan-400/30',
    iconColor: 'text-cyan-400',
    glowColor: 'shadow-cyan-500/20',
  },
  {
    icon: Brain,
    title: 'التوصيل',
    description: 'صِل الأسئلة بالإجابات الصحيحة! لعبة ذكاء وسرعة معاً.',
    gradient: 'from-rose-400 to-pink-500',
    bgGradient: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-400/30',
    iconColor: 'text-rose-400',
    glowColor: 'shadow-rose-500/20',
  },
];

// ─── How it works steps ─────────────────────────────────────────────
const STEPS = [
  {
    number: '١',
    icon: Gamepad2,
    title: 'اختر اللعبة',
    description: 'اختر من بين ٤ أساليب لعب مختلفة تناسب مستواك',
  },
  {
    number: '٢',
    icon: Target,
    title: 'تدرّب وتعلّم',
    description: 'أجب على الأسئلة واحصل على تغذية راجعة فورية',
  },
  {
    number: '٣',
    icon: BarChart3,
    title: 'تقدّم وتحسّن',
    description: 'تتبّع تقدّمك واجمع الشارات والإنجازات',
  },
];

// ─── Character testimonials ─────────────────────────────────────────
const TESTIMONIALS = [
  {
    emoji: '🦊',
    name: 'ثعلوب',
    quote: 'الضرب صار سهل! كنت أكرهه، الحين أحبّه! 🧡',
    color: 'from-orange-400/20 to-red-400/20',
    borderColor: 'border-orange-400/30',
    accentColor: 'text-orange-300',
  },
  {
    emoji: '🐰',
    name: 'أرنوبة',
    quote: 'كل يوم ألعب وأتعلّم شي جديد! البطولة أحلى لعبة! 💜',
    color: 'from-purple-400/20 to-pink-400/20',
    borderColor: 'border-purple-400/30',
    accentColor: 'text-purple-300',
  },
  {
    emoji: '🦁',
    name: 'أسد الصغير',
    quote: 'صرت أجاوب أسرع من كل أصدقائي! شكراً بطل الضرب! 💛',
    color: 'from-yellow-400/20 to-amber-400/20',
    borderColor: 'border-yellow-400/30',
    accentColor: 'text-yellow-300',
  },
];

// ─── Stats data ─────────────────────────────────────────────────────
const STATS = [
  { value: 1000, suffix: '+', label: 'سؤال', icon: Sparkles },
  { value: 4, suffix: '', label: 'ألعاب', icon: Gamepad2 },
  { value: 9, suffix: '', label: 'جداول', icon: BookOpen },
  { value: 100, suffix: '+', label: 'شارة', icon: Star },
];

// ─── Confetti Particle Component ────────────────────────────────────
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const angle = useMemo(() => Math.random() * 360, []);
  const distance = useMemo(() => 40 + Math.random() * 80, []);
  const size = useMemo(() => 4 + Math.random() * 6, []);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        opacity: 0,
        scale: [0, 1.5, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

// ─── Animated Counter Component ─────────────────────────────────────
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

// ─── Main Landing Page ──────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [mascotBounce, setMascotBounce] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Secret admin access state
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [showLockIcon, setShowLockIcon] = useState(false);
  const titleClickTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTitleClickTime = useRef<number>(0);

  // Long press on mascot for admin
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Secret: Click title 5 times within 3 seconds
  const handleTitleClick = useCallback(() => {
    const now = Date.now();
    const timeSinceLastClick = now - lastTitleClickTime.current;
    lastTitleClickTime.current = now;

    if (timeSinceLastClick > 3000) {
      setTitleClickCount(1);
    } else {
      setTitleClickCount(prev => prev + 1);
    }

    if (titleClickCount >= 2) {
      setShowLockIcon(true);
      setTimeout(() => setShowLockIcon(false), 1500);
    }

    if (titleClickCount >= 4) {
      setTitleClickCount(0);
      setShowLockIcon(false);
      router.push('/admin');
    }

    if (titleClickTimer.current) clearTimeout(titleClickTimer.current);
    titleClickTimer.current = setTimeout(() => {
      setTitleClickCount(0);
    }, 3000);
  }, [titleClickCount, router]);

  // Secret: Long press mascot for 3 seconds = admin access
  const handleMascotPressStart = useCallback(() => {
    setLongPressActive(true);
    longPressTimer.current = setTimeout(() => {
      router.push('/admin');
      setLongPressActive(false);
    }, 3000);
  }, [router]);

  const handleMascotPressEnd = useCallback(() => {
    setLongPressActive(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Generate floating math facts with stable random values
  const floatingFacts = useMemo(() => {
    const facts: {
      id: number; text: string; x: number; y: number;
      size: number; duration: number; delay: number; rotation: number;
    }[] = [];
    let seed = 42;
    const seededRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 16; i++) {
      facts.push({
        id: i,
        text: MATH_FACTS[i % MATH_FACTS.length],
        x: seededRandom() * 90 + 5,
        y: seededRandom() * 90 + 5,
        size: 12 + seededRandom() * 8,
        duration: 10 + seededRandom() * 12,
        delay: seededRandom() * 5,
        rotation: -15 + seededRandom() * 30,
      });
    }
    return facts;
  }, []);

  // Generate floating emoji decorations
  const floatingEmojis = useMemo(() => {
    const emojis = ['⭐', '✨', '🌟', '💫', '🏆', '🎯', '🔥', '💪', '🎉', '🌈'];
    const elements: {
      id: number; emoji: string; x: number; y: number;
      size: number; duration: number; delay: number;
    }[] = [];
    let seed = 99;
    const seededRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 12; i++) {
      elements.push({
        id: i,
        emoji: emojis[i % emojis.length],
        x: seededRandom() * 95,
        y: seededRandom() * 95,
        size: 18 + seededRandom() * 22,
        duration: 6 + seededRandom() * 8,
        delay: seededRandom() * 4,
      });
    }
    return elements;
  }, []);

  // Confetti colors
  const confettiColors = useMemo(
    () => ['#fbbf24', '#f59e0b', '#34d399', '#2dd4bf', '#fb7185', '#a78bfa', '#38bdf8'],
    []
  );

  // Periodic mascot bounce
  useEffect(() => {
    const interval = setInterval(() => {
      setMascotBounce(true);
      setTimeout(() => setMascotBounce(false), 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (titleClickTimer.current) clearTimeout(titleClickTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // Section visibility observer
  useEffect(() => {
    const sections = [
      { ref: heroRef, name: 'hero' },
      { ref: featuresRef, name: 'features' },
      { ref: howItWorksRef, name: 'howItWorks' },
      { ref: testimonialsRef, name: 'testimonials' },
      { ref: ctaRef, name: 'cta' },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = sections.find(s => s.ref.current === entry.target);
            if (section) setActiveSection(section.name);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', stiffness: 120, damping: 14 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -15 },
    visible: (i: number) => ({
      opacity: 1, y: 0, rotateX: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12, delay: 0.3 + i * 0.1 },
    }),
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-[#041f1a]">
      {/* ═══ Animated Gradient Background ═══ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Slowly shifting gradient */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #041f1a 0%, #064e3b 25%, #0d5f4a 50%, #0a3d3a 75%, #041f1a 100%)',
            backgroundSize: '400% 400%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '100% 0%', '0% 0%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Large animated orbs */}
        <motion.div
          className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.25, 1], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a7f3d0 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Subtle mesh pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ═══ Floating Math Facts ═══ */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {floatingFacts.map((fact) => (
          <motion.span
            key={`fact-${fact.id}`}
            className="absolute select-none font-mono font-bold"
            style={{
              left: `${fact.x}%`,
              top: `${fact.y}%`,
              fontSize: `${fact.size}px`,
              rotate: `${fact.rotation}deg`,
              color: 'rgba(255,255,255,0.08)',
            }}
            animate={{
              opacity: [0, 0.08, 0.04, 0.08, 0],
              y: [0, -30, 0],
              rotate: [fact.rotation, fact.rotation + 5, fact.rotation],
            }}
            transition={{
              duration: fact.duration,
              delay: fact.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {fact.text}
          </motion.span>
        ))}
      </div>

      {/* ═══ Floating Emoji Decorations ═══ */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map((el) => (
            <motion.span
              key={`emoji-${el.id}`}
              className="absolute select-none"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                fontSize: `${el.size}px`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.5, 0.3, 0.5],
                scale: [0, 1, 0.85, 1],
                y: [0, -15, 0],
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

      {/* ═══ Scroll Navigation Dots ═══ */}
      <div className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        {[
          { name: 'hero', ref: heroRef, icon: Sparkles },
          { name: 'features', ref: featuresRef, icon: Gamepad2 },
          { name: 'howItWorks', ref: howItWorksRef, icon: Target },
          { name: 'testimonials', ref: testimonialsRef, icon: Users },
          { name: 'cta', ref: ctaRef, icon: Heart },
        ].map((section) => (
          <motion.button
            key={section.name}
            onClick={() => scrollToSection(section.ref)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
              activeSection === section.name
                ? 'border-emerald-400/50 bg-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'border-white/10 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <section.icon className="h-4 w-4" />
          </motion.button>
        ))}
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="relative z-10">
        {/* ─── HERO SECTION ─── */}
        <section
          ref={heroRef}
          className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 md:py-16"
        >
          <motion.div
            className="flex flex-col items-center text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Pulsing glow behind title */}
            <motion.div
              className="absolute top-[15%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full md:h-96 md:w-96"
              style={{
                background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="relative mb-2 cursor-default select-none"
            >
              <motion.span
                className="inline-block text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #d1fae5 40%, #6ee7b7 70%, #34d399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 4px 20px rgba(52,211,153,0.4))',
                }}
                animate={{
                  filter: [
                    'drop-shadow(0 4px 20px rgba(52,211,153,0.4))',
                    'drop-shadow(0 4px 30px rgba(52,211,153,0.7))',
                    'drop-shadow(0 4px 20px rgba(52,211,153,0.4))',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                onClick={handleTitleClick}
              >
                MultiplyHero
              </motion.span>
              <AnimatePresence>
                {showLockIcon && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.4, scale: 0.8 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="mr-2 inline-block text-lg align-top"
                  >
                    🔐
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.h1>

            {/* Arabic subtitle with gradient */}
            <motion.div variants={itemVariants} className="mb-6 md:mb-8">
              <motion.span
                className="inline-block text-4xl font-extrabold sm:text-5xl md:text-6xl lg:text-7xl"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #fde68a 30%, #fbbf24 60%, #f59e0b 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                بطل الضرب
              </motion.span>
            </motion.div>

            {/* Subtitle with sparkle */}
            <motion.div
              variants={itemVariants}
              className="mb-6 flex items-center justify-center gap-2 text-base text-emerald-200/80 sm:text-lg md:mb-8 md:text-xl"
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="inline-block text-xl sm:text-2xl"
              >
                ✨
              </motion.span>
              <span>تعلّم جدول الضرب بطريقة مرحة ومشوّقة!</span>
              <motion.span
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="inline-block text-xl sm:text-2xl"
              >
                ✨
              </motion.span>
            </motion.div>

            {/* Mascot Area */}
            <motion.div variants={itemVariants} className="relative mb-6 md:mb-8">
              {/* Multi-ring glow behind mascot */}
              <motion.div
                className="absolute inset-0 -m-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)',
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0 -m-14 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Mascot */}
              <motion.div
                className="relative cursor-default select-none"
                animate={
                  mascotBounce
                    ? { y: [0, -25, 0], rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] }
                    : longPressActive
                      ? { scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }
                      : { y: [0, -10, 0] }
                }
                transition={
                  mascotBounce
                    ? { duration: 0.6, ease: 'easeOut' }
                    : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                }
                style={{
                  filter: longPressActive
                    ? 'drop-shadow(0 8px 24px rgba(251,191,36,0.6))'
                    : 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
                }}
                onMouseDown={handleMascotPressStart}
                onMouseUp={handleMascotPressEnd}
                onMouseLeave={handleMascotPressEnd}
                onTouchStart={handleMascotPressStart}
                onTouchEnd={handleMascotPressEnd}
              >
                <Image
                  src="/images/mascot/hero.png"
                  alt="بطل الضرب"
                  width={200}
                  height={200}
                  className="h-36 w-36 object-contain sm:h-44 sm:w-44 md:h-56 md:w-56"
                  priority
                />
              </motion.div>

              {/* Long press indicator */}
              <AnimatePresence>
                {longPressActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-amber-300"
                  >
                    استمر بالضغط... ✨
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Speech bubble */}
              <motion.div
                className="absolute -top-2 -left-4 rounded-2xl border border-white/20 bg-white/90 px-3 py-1.5 text-sm font-bold text-emerald-700 shadow-lg backdrop-blur-sm sm:-top-4 sm:-left-8 sm:px-4 sm:py-2 sm:text-base"
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
                <div className="absolute -bottom-2 right-6 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/90" />
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-emerald-100/80 sm:text-lg md:mb-10 md:max-w-xl md:text-xl"
            >
              منصّة تعليمية تفاعلية لتعلّم جدول الضرب من خلال ألعاب ممتعة وتحدّيات
              مثيرة! 🚀 طفلك سيتعلّم ويستمتع في آن واحد.
            </motion.p>

            {/* CTA Button with Confetti */}
            <motion.div variants={itemVariants} className="mb-8 md:mb-12">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setShowConfetti(true)}
                onHoverEnd={() => setShowConfetti(false)}
              >
                {/* Pulsing glow behind button */}
                <motion.div
                  className="pointer-events-none absolute inset-0 -m-3 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(245,158,11,0.4))',
                    filter: 'blur(16px)',
                  }}
                  animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Confetti particles on hover */}
                <div className="pointer-events-none absolute inset-0">
                  <AnimatePresence>
                    {showConfetti && (
                      <>
                        {confettiColors.map((color, i) => (
                          <ConfettiParticle key={i} delay={i * 0.03} color={color} />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  onClick={() => router.push('/login')}
                  className="relative z-10 h-16 rounded-3xl border-2 border-amber-300/50 bg-gradient-to-l from-amber-400 via-yellow-400 to-amber-500 px-10 text-xl font-extrabold text-emerald-900 shadow-2xl transition-all sm:h-18 sm:text-2xl md:h-20 md:px-14 md:text-3xl"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    boxShadow:
                      '0 8px 32px rgba(251,191,36,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🎮
                  </motion.span>
                  ابدأ اللعب!
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  >
                    🎮
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="flex flex-col items-center gap-1"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-xs text-white/40">اكتشف المزيد</span>
              <ArrowDown className="h-4 w-4 text-white/40" />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── STATS COUNTER SECTION ─── */}
        <section className="relative px-4 py-12 sm:px-6 md:py-16">
          <div className="mx-auto max-w-4xl">
            <motion.div
              className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  custom={i}
                  variants={cardVariants}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md sm:p-6"
                  whileHover={{
                    scale: 1.05,
                    borderColor: 'rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <stat.icon className="mx-auto mb-2 h-6 w-6 text-emerald-400/60 sm:h-8 sm:w-8" />
                    <div className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="mt-1 text-sm font-medium text-emerald-300/70 sm:text-base">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES SECTION ─── */}
        <section
          ref={featuresRef}
          className="relative px-4 py-12 sm:px-6 md:py-20"
        >
          {/* Section header */}
          <motion.div
            className="mx-auto mb-10 max-w-2xl text-center md:mb-14"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Gamepad2 className="h-4 w-4" />
              أساليب اللعب
            </motion.div>
            <h2 className="mb-3 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-l from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                ٤ طرق ممتعة
              </span>{' '}
              للتعلّم
            </h2>
            <p className="text-base text-white/60 sm:text-lg">
              اختر أسلوب اللعب الذي يناسبك! كل لعبة مصمّمة لتجعل تعلّم الضرب متعة حقيقية.
            </p>
          </motion.div>

          {/* Game mode cards */}
          <motion.div
            className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {GAME_MODES.map((mode, i) => (
              <motion.div
                key={mode.title}
                custom={i}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300, damping: 15 },
                }}
                className={`group relative cursor-default overflow-hidden rounded-3xl border ${mode.borderColor} bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 sm:p-8`}
              >
                {/* Gradient glow */}
                <div
                  className={`absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-b ${mode.bgGradient} blur-3xl transition-all group-hover:scale-150`}
                />
                {/* Bottom glow */}
                <div
                  className={`absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-t ${mode.bgGradient} blur-2xl opacity-0 transition-all group-hover:opacity-100`}
                />

                <div className="relative">
                  {/* Icon */}
                  <motion.div
                    className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${mode.gradient} shadow-lg ${mode.glowColor} sm:h-16 sm:w-16`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <mode.icon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                  </motion.div>

                  {/* Title */}
                  <h3
                    className={`mb-2 text-xl font-bold bg-gradient-to-l ${mode.gradient} bg-clip-text text-transparent sm:text-2xl`}
                  >
                    {mode.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                    {mode.description}
                  </p>

                  {/* Bottom accent line */}
                  <div
                    className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-l ${mode.gradient} transition-all group-hover:w-24`}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── HOW IT WORKS SECTION ─── */}
        <section
          ref={howItWorksRef}
          className="relative px-4 py-12 sm:px-6 md:py-20"
        >
          {/* Section header */}
          <motion.div
            className="mx-auto mb-10 max-w-2xl text-center md:mb-14"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Target className="h-4 w-4" />
              كيف تعمل؟
            </motion.div>
            <h2 className="mb-3 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-l from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                ٣ خطوات
              </span>{' '}
              فقط!
            </h2>
            <p className="text-base text-white/60 sm:text-lg">
              من السهل البدء! اتبع هذه الخطوات الثلاث وابدأ رحلتك في تعلّم الضرب.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div
            className="mx-auto max-w-4xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="relative flex flex-col gap-6 md:flex-row md:gap-8">
              {/* Connecting line */}
              <div className="absolute top-0 bottom-0 right-1/2 hidden h-full w-px bg-gradient-to-b from-amber-400/30 via-emerald-400/30 to-teal-400/30 md:right-1/2 md:block" />

              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  custom={i}
                  variants={cardVariants}
                  className="group relative flex-1 text-center"
                >
                  <div className="relative mx-auto mb-4">
                    {/* Step number circle */}
                    <motion.div
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-md sm:h-24 sm:w-24"
                      whileHover={{
                        scale: 1.1,
                        borderColor: 'rgba(255,255,255,0.3)',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <span className="text-3xl font-black text-white/20 sm:text-4xl">
                        {step.number}
                      </span>
                    </motion.div>
                    {/* Floating icon */}
                    <motion.div
                      className="absolute -top-1 -right-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 sm:h-12 sm:w-12"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    >
                      <step.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </motion.div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white sm:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60 sm:text-base">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── SOCIAL PROOF / CHARACTER TESTIMONIALS ─── */}
        <section
          ref={testimonialsRef}
          className="relative px-4 py-12 sm:px-6 md:py-20"
        >
          {/* Section header */}
          <motion.div
            className="mx-auto mb-10 max-w-2xl text-center md:mb-14"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-1.5 text-sm font-medium text-rose-300"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Users className="h-4 w-4" />
              يقولون عنّا
            </motion.div>
            <h2 className="mb-3 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-l from-rose-300 to-pink-200 bg-clip-text text-transparent">
                أصدقاؤنا
              </span>{' '}
              يحبّون الضرب!
            </h2>
            <p className="text-base text-white/60 sm:text-lg">
              اسمع ماذا يقول أصدقاؤنا الأبطال عن تجربتهم مع بطل الضرب!
            </p>
          </motion.div>

          {/* Testimonial cards */}
          <motion.div
            className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                custom={i}
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  transition: { type: 'spring', stiffness: 300, damping: 15 },
                }}
                className={`group relative overflow-hidden rounded-3xl border ${testimonial.borderColor} bg-gradient-to-b ${testimonial.color} p-6 backdrop-blur-md transition-all sm:p-8`}
              >
                {/* Quote mark */}
                <div className="absolute top-3 left-3 text-5xl font-black text-white/5 sm:text-6xl">
                  &ldquo;
                </div>

                {/* Character emoji */}
                <motion.div
                  className="mb-3 text-5xl sm:text-6xl"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                >
                  {testimonial.emoji}
                </motion.div>

                {/* Character name */}
                <h3 className={`mb-2 text-lg font-bold ${testimonial.accentColor}`}>
                  {testimonial.name}
                </h3>

                {/* Quote */}
                <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                  {testimonial.quote}
                </p>

                {/* Star rating */}
                <div className="mt-3 flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── FINAL CTA SECTION ─── */}
        <section
          ref={ctaRef}
          className="relative px-4 py-16 sm:px-6 md:py-24"
        >
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {/* Decorative stars */}
            <motion.div
              className="mb-6 flex items-center justify-center gap-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Star className="h-5 w-5 fill-amber-400 text-amber-400 sm:h-6 sm:w-6" />
              <Star className="h-7 w-7 fill-amber-400 text-amber-400 sm:h-8 sm:w-8" />
              <Star className="h-5 w-5 fill-amber-400 text-amber-400 sm:h-6 sm:w-6" />
            </motion.div>

            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              هل أنت مستعد لتصبح{' '}
              <span className="bg-gradient-to-l from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                بطل الضرب
              </span>
              ؟
            </h2>

            <p className="mb-8 text-base text-white/60 sm:text-lg md:mb-10">
              انضم إلى آلاف الأطفال الذين يتعلّمون جدول الضرب بطريقة ممتعة! 🎉
            </p>

            {/* Big CTA Button */}
            <motion.div
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setShowConfetti(true)}
              onHoverEnd={() => setShowConfetti(false)}
            >
              {/* Glow */}
              <motion.div
                className="absolute inset-0 -m-4 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(251,191,36,0.3))',
                  filter: 'blur(20px)',
                }}
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Confetti */}
              <AnimatePresence>
                {showConfetti && (
                  <>
                    {confettiColors.map((color, i) => (
                      <ConfettiParticle key={`cta-c-${i}`} delay={i * 0.03} color={color} />
                    ))}
                  </>
                )}
              </AnimatePresence>

              <Button
                onClick={() => router.push('/login')}
                className="relative h-18 rounded-3xl border-2 border-emerald-400/30 bg-gradient-to-l from-emerald-500 via-teal-500 to-emerald-600 px-12 text-xl font-extrabold text-white shadow-2xl transition-all sm:h-20 sm:px-16 sm:text-2xl md:text-3xl"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  boxShadow:
                    '0 12px 40px rgba(52,211,153,0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
                }}
              >
                <motion.span
                  className="inline-block"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🚀
                </motion.span>
                ابدأ مجاناً الآن!
                <motion.span
                  className="inline-block"
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                >
                  ⚡
                </motion.span>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-rose-400/60" />
                مجاني تماماً
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-amber-400/60" />
                بدون إعلانات
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-emerald-400/60" />
                آمن للأطفال
              </span>
            </div>
          </motion.div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="relative border-t border-white/5 bg-black/20 px-4 py-8 sm:px-6 md:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              {/* Brand */}
              <div className="text-center md:text-right">
                <h3 className="mb-1 text-lg font-bold text-white/80">
                  <span className="text-emerald-400">Multiply</span>Hero
                </h3>
                <p className="text-sm text-white/40">بطل الضرب — تعلّم جدول الضرب بطريقة مرحة</p>
              </div>

              {/* Quick links */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/parent')}
                  variant="ghost"
                  className="h-9 rounded-full border border-white/10 bg-white/5 px-5 text-xs font-medium text-white/50 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white/70 sm:text-sm"
                >
                  <Users className="ml-1.5 h-3.5 w-3.5" />
                  أولياء الأمور
                </Button>
              </div>

              {/* Social links (decorative) */}
              <div className="flex items-center gap-3">
                {[
                  { icon: '𝕏', label: 'Twitter' },
                  { icon: '📷', label: 'Instagram' },
                  { icon: '📧', label: 'Email' },
                ].map((social) => (
                  <motion.button
                    key={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/40 transition-all hover:bg-white/10 hover:text-white/60"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-6 flex flex-col items-center gap-2 border-t border-white/5 pt-6 md:flex-row md:justify-between">
              <p className="text-xs text-white/30">
                © ٢٠٢٦ MultiplyHero — بطل الضرب 💚
              </p>
              <p className="flex items-center gap-1 text-xs text-white/30">
                صنع بـ <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> للأبطال الصغار
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
