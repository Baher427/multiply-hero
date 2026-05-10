'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap, Star, Check, X } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

interface TrueFalseGameProps {
  questions: Array<{
    id: string;
    multiplicand: number;
    multiplier: number;
    correctAnswer: number;
    isTrue: boolean;
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

const CELEBRATION_EMOJIS = ['🎉', '🌟', '⭐', '🎊', '💪', '🔥', '👏', '✨'];
const ENCOURAGING_MESSAGES = [
  'حاول مرة أخرى! 💪',
  'لا بأس، تعلمت شيئاً جديداً! 🌱',
  'استمر في المحاولة! 🌟',
  'أنت بطل! 🦸',
];

// Flip counter component
function FlipCounter({ value }: { value: number }) {
  return (
    <div className="relative overflow-hidden">
      <motion.span
        key={value}
        initial={{ y: -30, opacity: 0, rotateX: -90 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        exit={{ y: 30, opacity: 0, rotateX: 90 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="inline-block"
      >
        {value}
      </motion.span>
    </div>
  );
}

export default function TrueFalseGame({
  questions,
  onComplete,
  onBack,
}: TrueFalseGameProps) {
  const { play: playSound } = useSound();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [startTime] = useState(Date.now());
  const [pointsAnimation, setPointsAnimation] = useState<{ points: number; key: number } | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionTimeRef = useRef(100);

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

  // Timer with color transitions
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

  const handleAnswer = (answer: boolean | null) => {
    if (showFeedback) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(answer);
    setShowFeedback(true);
    setShowReveal(true);

    const isCorrect = answer === currentQuestion.isTrue;

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
      playSound('correct');
      if (newCombo >= 3) playSound('combo');
    } else {
      setWrongCount((prev) => prev + 1);
      setCombo(0);
      setFeedbackType('wrong');
      playSound('wrong');
    }

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setFeedbackType(null);
        setShowFeedback(false);
        setPointsAnimation(null);
        setShowReveal(false);
      } else {
        handleComplete();
      }
    }, 2200);
  };

  // Auto-advance when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && !showFeedback) {
      handleAnswer(null);
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

  const correctAnswerDisplay = `${currentQuestion.multiplicand} × ${currentQuestion.multiplier} = ${currentQuestion.correctAnswer}`;

  return (
    <div dir="rtl" className="flex flex-col min-h-screen p-4 max-w-lg mx-auto relative overflow-hidden"
      style={{
        background: feedbackType === 'correct'
          ? 'linear-gradient(to bottom, #ecfdf5, #d1fae5, #f0fdfa)'
          : feedbackType === 'wrong'
          ? 'linear-gradient(to bottom, #fef2f2, #fecaca, #fff1f2)'
          : 'linear-gradient(to bottom, #f0fdfa, #fff7ed, #fefce8)',
      }}
    >
      {/* Green/Red flash overlay */}
      <AnimatePresence>
        {feedbackType === 'correct' && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(circle at center, rgba(52, 211, 153, 0.35) 0%, transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 0] }}
            transition={{ duration: 1 }}
          />
        )}
        {feedbackType === 'wrong' && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.3) 0%, transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { playSound('click'); onBack(); }}
          className="text-gray-500 hover:text-gray-700"
        >
          رجوع
          <ArrowRight className="w-4 h-4 mr-1" />
        </Button>
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold"
            >
              <Zap className="w-4 h-4" />
              <FlipCounter value={combo} />x
            </motion.div>
          )}
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
            <Star className="w-4 h-4" />
            <FlipCounter value={score} />
          </div>
        </div>
      </div>

      {/* Animated timer with gradient */}
      <div className={`w-full h-4 rounded-full mb-4 overflow-hidden ${getTimerBg()} relative`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-l ${getTimerColor()} relative`}
          animate={{ width: `${timeLeft}%` }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
        {/* Time text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white drop-shadow-sm">
            {Math.ceil(timeLeft)}%
          </span>
        </div>
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
                ? 'bg-teal-500 w-4 h-4'
                : 'bg-gray-200 w-2.5 h-2.5'
            }`}
            animate={i === currentIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: i === currentIndex ? Infinity : 0, repeatDelay: 1 }}
          />
        ))}
      </div>

      {/* Question Card with dramatic reveal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: -100, opacity: 0, scale: 0.85 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card
            className={`p-8 mb-6 text-center transition-all duration-500 relative overflow-hidden ${
              feedbackType === 'correct'
                ? 'bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-200/50'
                : feedbackType === 'wrong'
                ? 'bg-red-50 border-red-300 shadow-lg shadow-red-200/50'
                : 'bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg'
            }`}
          >
            <p className="text-gray-400 text-sm mb-3">هل هذه العبارة صحيحة؟ 🤔</p>
            <motion.div
              className="text-5xl md:text-6xl font-extrabold text-teal-700"
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

            {/* Dramatic reveal animation */}
            <AnimatePresence>
              {showReveal && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className={`mt-4 p-3 rounded-xl inline-block ${
                      currentQuestion.isTrue
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <span className="text-lg font-bold">
                      {currentQuestion.isTrue ? '✅ العبارة صحيحة!' : '❌ العبارة خاطئة!'}
                    </span>
                    <p className="text-sm mt-1 opacity-80">الإجابة الصحيحة: {correctAnswerDisplay}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Feedback message */}
            <AnimatePresence>
              {feedbackType === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [0.5, 1.3, 1] }}
                  exit={{ opacity: 0 }}
                  className="mt-4"
                >
                  <span className="text-4xl">{randomEmoji}</span>
                  <p className="text-emerald-600 font-bold text-lg mt-1">ممتاز! 🎉</p>
                </motion.div>
              )}
              {feedbackType === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4"
                >
                  <p className="text-red-500 font-bold">{randomEncouraging}</p>
                  <p className="text-gray-600 mt-1">
                    الإجابة الصحيحة: <span className="font-bold text-emerald-600">{correctAnswerDisplay}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* True/False Buttons with icons and larger styling */}
      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* True button */}
        <motion.button
          whileHover={!showFeedback ? { scale: 1.05, y: -2 } : {}}
          whileTap={!showFeedback ? { scale: 0.95 } : {}}
          onClick={() => handleAnswer(true)}
          disabled={showFeedback}
          className={`rounded-3xl p-6 md:p-8 text-xl font-bold transition-all duration-300 shadow-lg border-2 relative overflow-hidden ${
            showFeedback && currentQuestion.isTrue
              ? 'bg-gradient-to-br from-emerald-200 to-green-300 border-emerald-400 text-emerald-800 shadow-emerald-300/50'
              : showFeedback && selectedAnswer === true && !currentQuestion.isTrue
              ? 'bg-gradient-to-br from-red-200 to-rose-300 border-red-400 text-red-800 shadow-red-300/50'
              : 'bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-500 text-white hover:shadow-emerald-300/50 hover:shadow-xl'
          } ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {/* Icon */}
          <motion.div
            animate={!showFeedback ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="mb-2"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
              <Check className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          </motion.div>
          <span className="text-2xl md:text-3xl font-extrabold block">صح</span>
          <span className="text-sm opacity-75">True</span>
          {/* Hover shine */}
          {!showFeedback && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
              whileHover={{ opacity: 1 }}
            />
          )}
        </motion.button>

        {/* False button */}
        <motion.button
          whileHover={!showFeedback ? { scale: 1.05, y: -2 } : {}}
          whileTap={!showFeedback ? { scale: 0.95 } : {}}
          onClick={() => handleAnswer(false)}
          disabled={showFeedback}
          className={`rounded-3xl p-6 md:p-8 text-xl font-bold transition-all duration-300 shadow-lg border-2 relative overflow-hidden ${
            showFeedback && !currentQuestion.isTrue
              ? 'bg-gradient-to-br from-emerald-200 to-green-300 border-emerald-400 text-emerald-800 shadow-emerald-300/50'
              : showFeedback && selectedAnswer === false && currentQuestion.isTrue
              ? 'bg-gradient-to-br from-red-200 to-rose-300 border-red-400 text-red-800 shadow-red-300/50'
              : 'bg-gradient-to-br from-red-400 to-rose-500 border-red-500 text-white hover:shadow-red-300/50 hover:shadow-xl'
          } ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {/* Icon */}
          <motion.div
            animate={!showFeedback ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="mb-2"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
              <X className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          </motion.div>
          <span className="text-2xl md:text-3xl font-extrabold block">غلط</span>
          <span className="text-sm opacity-75">False</span>
          {/* Hover shine */}
          {!showFeedback && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
              whileHover={{ opacity: 1 }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}
