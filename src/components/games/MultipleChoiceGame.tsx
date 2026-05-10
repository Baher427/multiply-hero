'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap, Star } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

interface MultipleChoiceGameProps {
  questions: Array<{
    id: string;
    multiplicand: number;
    multiplier: number;
    correctAnswer: number;
    options: number[];
    display: string;
  }>;
  onComplete: (result: {
    score: number;
    correctCount: number;
    wrongCount: number;
    combo: number;
    bestCombo: number;
    duration: number;
  }) => void;
  onBack: () => void;
}

const CELEBRATION_EMOJIS = ['🎉', '🌟', '⭐', '🎊', '💪', '🔥', '👏', '🏆'];
const ENCOURAGING_MESSAGES = [
  'حاول مرة أخرى! 💪',
  'لا بأس، تعلمت شيئاً جديداً! 🌱',
  'استمر في المحاولة! 🌟',
  'أنت قريب جداً! 🎯',
];

// Particle burst component for correct answers
function ParticleBurst({ x, y }: { x: number; y: number }) {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i * 30) * (Math.PI / 180),
      distance: 40 + (i % 3) * 20,
      size: 4 + (i % 3) * 3,
      color: ['#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c', '#38bdf8'][i % 6],
    })), []
  );

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: -p.size / 2,
            top: -p.size / 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// Progress Ring component
function ProgressRing({ current, total }: { current: number; total: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = ((current) / total) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-purple-200" />
        <motion.circle
          cx="24" cy="24" r={radius} fill="none" stroke="#a855f7" strokeWidth="3"
          strokeLinecap="round" strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-purple-700">{current}/{total}</span>
    </div>
  );
}

export default function MultipleChoiceGame({
  questions,
  onComplete,
  onBack,
}: MultipleChoiceGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [startTime] = useState(Date.now());
  const [pointsAnimation, setPointsAnimation] = useState<{ points: number; key: number } | null>(null);
  const [particlePos, setParticlePos] = useState<{ x: number; y: number } | null>(null);
  const [shakeScreen, setShakeScreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionTimeRef = useRef(100);
  const { play: playSound } = useSound();

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleComplete = useCallback(() => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    onComplete({
      score,
      correctCount,
      wrongCount,
      combo,
      bestCombo,
      duration,
    });
  }, [score, correctCount, wrongCount, combo, bestCombo, startTime, onComplete]);

  // Timer
  useEffect(() => {
    questionTimeRef.current = 100;
    setTimeLeft(100);

    timerRef.current = setInterval(() => {
      questionTimeRef.current -= 0.5;
      setTimeLeft((prev) => {
        const next = prev - 0.5;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return next;
      });
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex]);

  const handleAnswer = (answer: number, event?: React.MouseEvent) => {
    if (showFeedback) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      const timeBonus = Math.floor(questionTimeRef.current);
      const comboBonus = combo * 2;
      const points = 10 + timeBonus + comboBonus;
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > bestCombo) setBestCombo(newCombo);
      setFeedbackType('correct');
      setPointsAnimation({ points, key: Date.now() });

      // Particle burst from click position
      if (event) {
        setParticlePos({ x: event.clientX, y: event.clientY });
        setTimeout(() => setParticlePos(null), 700);
      }

      if (newCombo >= 3) { playSound('combo'); } else { playSound('correct'); }
    } else {
      setWrongCount((prev) => prev + 1);
      setCombo(0);
      setFeedbackType('wrong');
      // Screen shake
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 400);
      playSound('wrong');
    }

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setFeedbackType(null);
        setShowFeedback(false);
        setPointsAnimation(null);
      } else {
        handleComplete();
      }
    }, 1800);
  };

  // Auto-advance when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && !showFeedback) {
      handleAnswer(-1);
    }
  }, [timeLeft, showFeedback, handleAnswer]);

  const getTimerColor = () => {
    if (timeLeft > 60) return 'from-emerald-400 to-green-500';
    if (timeLeft > 30) return 'from-amber-400 to-yellow-500';
    return 'from-red-400 to-rose-500';
  };

  const getTimerBg = () => {
    if (timeLeft > 60) return 'bg-emerald-200';
    if (timeLeft > 30) return 'bg-amber-200';
    return 'bg-red-200';
  };

  const randomEmoji = useMemo(() => CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)], [currentIndex]);
  const randomEncouraging = useMemo(() => ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)], [currentIndex]);

  const optionGradients = [
    'from-pink-400 to-rose-500',
    'from-teal-400 to-cyan-500',
    'from-amber-400 to-orange-500',
    'from-violet-400 to-purple-500',
  ];

  return (
    <motion.div
      dir="rtl"
      animate={shakeScreen ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-screen p-4 max-w-lg mx-auto relative overflow-hidden"
      style={{
        background: feedbackType === 'correct'
          ? 'linear-gradient(to bottom, #ecfdf5, #d1fae5, #a7f3d0)'
          : feedbackType === 'wrong'
          ? 'linear-gradient(to bottom, #fef2f2, #fecaca, #fca5a5)'
          : 'linear-gradient(to bottom, #faf5ff, #fff7ed)',
      }}
    >
      {/* Particle burst */}
      <AnimatePresence>
        {particlePos && <ParticleBurst x={particlePos.x} y={particlePos.y} />}
      </AnimatePresence>

      {/* Green glow overlay for correct */}
      <AnimatePresence>
        {feedbackType === 'correct' && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(circle at center, rgba(52, 211, 153, 0.3) 0%, transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* Red pulse overlay for wrong */}
      <AnimatePresence>
        {feedbackType === 'wrong' && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
        >
          رجوع
          <ArrowRight className="w-4 h-4 mr-1" />
        </Button>
        <div className="flex items-center gap-3">
          <ProgressRing current={currentIndex} total={totalQuestions} />
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold"
            >
              <Zap className="w-4 h-4" />
              {combo}x
            </motion.div>
          )}
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
            <Star className="w-4 h-4" />
            {score}
          </div>
        </div>
      </div>

      {/* Timer bar with gradient */}
      <div className={`w-full h-3 rounded-full mb-4 overflow-hidden ${getTimerBg()}`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-l ${getTimerColor()} relative`}
          animate={{ width: `${timeLeft}%` }}
          transition={{ duration: 0.3 }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <motion.div
            key={i}
            className={`rounded-full ${
              i < currentIndex
                ? 'bg-emerald-400 w-3 h-3'
                : i === currentIndex
                ? 'bg-purple-500 w-4 h-4'
                : 'bg-gray-200 w-2.5 h-2.5'
            }`}
            animate={i === currentIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: i === currentIndex ? Infinity : 0, repeatDelay: 1 }}
          />
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: -100, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card
            className={`p-8 mb-6 text-center transition-all duration-300 relative overflow-hidden ${
              feedbackType === 'correct'
                ? 'bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-200/50'
                : feedbackType === 'wrong'
                ? 'bg-red-50 border-red-300 shadow-lg shadow-red-200/50'
                : 'bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <motion.div
              className="text-5xl md:text-6xl font-extrabold text-purple-700"
              animate={
                feedbackType === 'correct'
                  ? { scale: [1, 1.2, 1] }
                  : feedbackType === 'wrong'
                  ? { x: [0, -10, 10, -10, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
            >
              {currentQuestion.display}
            </motion.div>

            {/* Points animation */}
            <AnimatePresence>
              {pointsAnimation && (
                <motion.div
                  key={pointsAnimation.key}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -40 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="text-emerald-500 font-bold text-xl mt-2"
                >
                  +{pointsAnimation.points} ⭐
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated emoji reaction */}
            <AnimatePresence>
              {feedbackType === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: [0, 1.5, 1], y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mt-3"
                >
                  <span className="text-4xl">{randomEmoji}</span>
                  <p className="text-emerald-600 font-bold text-lg mt-1">أحسنت! 🎉</p>
                </motion.div>
              )}
              {feedbackType === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3"
                >
                  <p className="text-red-500 font-bold">{randomEncouraging}</p>
                  <p className="text-gray-600 mt-1">
                    الإجابة الصحيحة: <span className="font-bold text-emerald-600">{currentQuestion.correctAnswer}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Answer Options with gradients */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === currentQuestion.correctAnswer;
          let cardStyle = '';

          if (showFeedback) {
            if (isCorrectOption) {
              cardStyle = 'bg-gradient-to-br from-emerald-100 to-green-200 border-2 border-emerald-400 text-emerald-700 shadow-lg shadow-emerald-200/50';
            } else if (isSelected && !isCorrectOption) {
              cardStyle = 'bg-gradient-to-br from-red-100 to-rose-200 border-2 border-red-400 text-red-700 shadow-lg shadow-red-200/50';
            } else {
              cardStyle = 'bg-gray-50 border-2 border-gray-200 text-gray-400';
            }
          } else {
            cardStyle = `bg-gradient-to-br ${optionGradients[index]} text-white border-2 border-transparent shadow-lg hover:shadow-xl`;
          }

          return (
            <motion.button
              key={`${currentQuestion.id}-${option}`}
              whileHover={!showFeedback ? { scale: 1.06, y: -2 } : {}}
              whileTap={!showFeedback ? { scale: 0.94 } : {}}
              onClick={(e) => handleAnswer(option, e)}
              disabled={showFeedback}
              className={`rounded-2xl p-6 text-3xl font-bold transition-all duration-200 ${cardStyle} ${
                !showFeedback ? 'cursor-pointer' : 'cursor-default'
              } relative overflow-hidden`}
            >
              {/* Hover shine effect */}
              {!showFeedback && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              {/* Correct answer checkmark */}
              {showFeedback && isCorrectOption && (
                <motion.div
                  className="absolute top-2 left-2"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  ✅
                </motion.div>
              )}
              <span className="relative z-10">{option}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
