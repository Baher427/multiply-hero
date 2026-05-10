'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap, Star, Delete } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

interface FillBlankGameProps {
  questions: Array<{
    id: string;
    multiplicand: number;
    multiplier: number;
    correctAnswer: number;
    blankPosition: 'result' | 'multiplicand' | 'multiplier';
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

const CELEBRATION_EMOJIS = ['🎉', '🌟', '⭐', '🎊', '💪', '🔥', '👏', '✏️'];
const ENCOURAGING_MESSAGES = [
  'حاول مرة أخرى! 💪',
  'لا بأس، الخطوة التالية أفضل! 🌱',
  'استمر في المحاولة! 🌟',
  'أنت بطل! 🦸',
];

// Mini confetti burst for success
function SuccessConfetti() {
  const particles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (i * 22.5) * (Math.PI / 180),
      distance: 30 + (i % 3) * 15,
      color: ['#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c', '#38bdf8'][i % 6],
      size: 4 + (i % 3) * 2,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance * 3,
            y: Math.sin(p.angle) * p.distance * 3,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function FillBlankGame({
  questions,
  onComplete,
  onBack,
}: FillBlankGameProps) {
  const { play: playSound } = useSound();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [input, setInput] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [startTime] = useState(Date.now());
  const [pointsAnimation, setPointsAnimation] = useState<{ points: number; key: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [pressedKey, setPressedKey] = useState<number | null>(null);
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

  const handleSubmit = () => {
    if (showFeedback) return;
    if (input === '') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const userAnswer = parseInt(input, 10);
    setShowFeedback(true);

    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      const timeBonus = Math.floor(questionTimeRef.current);
      const comboBonus = combo * 3;
      const points = 15 + timeBonus + comboBonus;
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > bestCombo) setBestCombo(newCombo);
      setFeedbackType('correct');
      setPointsAnimation({ points, key: Date.now() });
      playSound('correct');
      if (newCombo >= 3) playSound('combo');
      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    } else {
      setWrongCount((prev) => prev + 1);
      setCombo(0);
      setFeedbackType('wrong');
      playSound('wrong');
      // Shake effect
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        setInput('');
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
      if (timerRef.current) clearInterval(timerRef.current);
      if (input === '') {
        // Time ran out with no answer - count as wrong
        setWrongCount((prev) => prev + 1);
        setCombo(0);
        setFeedbackType('wrong');
        setShowFeedback(true);
        playSound('wrong');
        setShakeWrong(true);
        setTimeout(() => setShakeWrong(false), 500);

        setTimeout(() => {
          if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((prev) => prev + 1);
            setInput('');
            setFeedbackType(null);
            setShowFeedback(false);
            setPointsAnimation(null);
          } else {
            handleComplete();
          }
        }, 1800);
      } else {
        handleSubmit();
      }
    }
  }, [timeLeft, showFeedback, input, currentIndex, totalQuestions, handleComplete]);

  const handleNumberPress = (num: number) => {
    if (showFeedback) return;
    if (input.length >= 3) return; // Max 3 digits
    playSound('click');
    setInput((prev) => prev + num.toString());
    setPressedKey(num);
    setTimeout(() => setPressedKey(null), 150);
  };

  const handleDelete = () => {
    if (showFeedback) return;
    playSound('click');
    setInput((prev) => prev.slice(0, -1));
  };

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

  // Build display with blank
  const renderDisplay = () => {
    const parts = currentQuestion.display.split('___');
    return (
      <span>
        {parts[0]}
        <motion.span
          className={`inline-block min-w-[80px] border-b-4 mx-2 text-center px-2 ${
            feedbackType === 'correct'
              ? 'border-emerald-400 text-emerald-500'
              : feedbackType === 'wrong'
              ? 'border-red-400 text-red-500'
              : input
              ? 'border-orange-400 text-orange-500'
              : 'border-dashed border-rose-400 text-rose-400'
          }`}
          animate={
            feedbackType === 'correct'
              ? { scale: [1, 1.1, 1] }
              : feedbackType === 'wrong'
              ? { x: [0, -5, 5, -5, 0] }
              : input
              ? { scale: [1, 1.05, 1] }
              : { opacity: [0.5, 1] }
          }
          transition={{ duration: 0.5, repeat: feedbackType === null && !input ? Infinity : 0 }}
        >
          {input || '؟'}
        </motion.span>
        {parts[1]}
      </span>
    );
  };

  const numPadButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <motion.div
      dir="rtl"
      animate={shakeWrong ? { x: [-6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen p-4 max-w-lg mx-auto relative overflow-hidden"
      style={{
        background: feedbackType === 'correct'
          ? 'linear-gradient(to bottom, #ecfdf5, #d1fae5, #f0fdf4)'
          : feedbackType === 'wrong'
          ? 'linear-gradient(to bottom, #fef2f2, #fecaca, #fff1f2)'
          : 'linear-gradient(to bottom, #fff1f2, #ecfdf5, #fefce8)',
      }}
    >
      {/* Success confetti */}
      <AnimatePresence>
        {showConfetti && <SuccessConfetti />}
      </AnimatePresence>

      {/* Red glow overlay for wrong */}
      <AnimatePresence>
        {feedbackType === 'wrong' && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, transparent 70%)' }}
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
              {combo}x
            </motion.div>
          )}
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
            <Star className="w-4 h-4" />
            {score}
          </div>
        </div>
      </div>

      {/* Timer with animated gradient */}
      <div className={`w-full h-3 rounded-full mb-4 overflow-hidden ${getTimerBg()} relative`}>
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
                ? 'bg-rose-500 w-4 h-4'
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
            className={`p-8 mb-4 text-center transition-all duration-300 relative overflow-hidden ${
              feedbackType === 'correct'
                ? 'bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-200/50'
                : feedbackType === 'wrong'
                ? 'bg-red-50 border-red-300 shadow-lg shadow-red-200/50'
                : 'bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg'
            }`}
          >
            <p className="text-gray-400 text-sm mb-3">أكمل الفراغ ✏️</p>
            <motion.div
              className="text-4xl md:text-5xl font-extrabold text-rose-700"
              animate={
                feedbackType === 'correct'
                  ? { scale: [1, 1.2, 1] }
                  : feedbackType === 'wrong'
                  ? { x: [0, -10, 10, -10, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
            >
              {renderDisplay()}
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

            {/* Feedback message */}
            <AnimatePresence>
              {feedbackType === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [0.5, 1.3, 1] }}
                  exit={{ opacity: 0 }}
                  className="mt-3"
                >
                  <span className="text-4xl">{randomEmoji}</span>
                  <p className="text-emerald-600 font-bold text-lg mt-1">رائع! 🎉</p>
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

      {/* Input Display with glow effect */}
      <div className={`rounded-2xl border-2 p-4 mb-4 text-center min-h-[56px] flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
        feedbackType === 'correct'
          ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-200/50'
          : feedbackType === 'wrong'
          ? 'border-red-400 bg-red-50 shadow-lg shadow-red-200/50'
          : input
          ? 'border-rose-300 bg-white shadow-md'
          : 'border-dashed border-gray-300 bg-white'
      }`}>
        {/* Glow effect when typing */}
        {input && !showFeedback && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ boxShadow: '0 0 20px rgba(244, 63, 94, 0.15)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <span className={`text-3xl font-bold relative z-10 ${input ? 'text-gray-800' : 'text-gray-300'}`}>
          {input || 'ادخل الإجابة...'}
        </span>
        {input && !showFeedback && (
          <motion.span
            className="inline-block w-0.5 h-8 bg-rose-500 mr-1 relative z-10"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={!showFeedback && input ? { scale: 1.02 } : {}}
        whileTap={!showFeedback && input ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={showFeedback || input === ''}
        className={`w-full rounded-2xl p-4 text-xl font-bold mb-4 transition-all relative overflow-hidden ${
          showFeedback || input === ''
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-l from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl cursor-pointer'
        }`}
      >
        {/* Glow effect on submit button */}
        {input && !showFeedback && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />
        )}
        <span className="relative z-10">تحقق ✅</span>
      </motion.button>

      {/* Number Pad with press effects */}
      <div className="grid grid-cols-5 gap-2 flex-1 content-end pb-4">
        {numPadButtons.map((num) => (
          <motion.button
            key={num}
            whileHover={!showFeedback ? { scale: 1.1, y: -2 } : {}}
            whileTap={!showFeedback ? { scale: 0.85 } : {}}
            onClick={() => handleNumberPress(num)}
            disabled={showFeedback}
            className={`rounded-xl p-4 text-2xl font-bold transition-all border-2 relative overflow-hidden ${
              showFeedback
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-default'
                : pressedKey === num
                ? 'bg-rose-100 border-rose-400 text-rose-700 shadow-inner cursor-pointer'
                : 'bg-white border-gray-200 text-gray-700 shadow-sm hover:shadow-md hover:border-rose-300 cursor-pointer active:bg-rose-50'
            }`}
          >
            {/* Press ripple effect */}
            {pressedKey === num && (
              <motion.div
                className="absolute inset-0 bg-rose-200 rounded-xl"
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <span className="relative z-10">{num}</span>
          </motion.button>
        ))}
        {/* Delete button */}
        <motion.button
          whileHover={!showFeedback ? { scale: 1.1, y: -2 } : {}}
          whileTap={!showFeedback ? { scale: 0.85 } : {}}
          onClick={handleDelete}
          disabled={showFeedback || input === ''}
          className={`rounded-xl p-4 text-xl font-bold transition-all border-2 relative overflow-hidden ${
            showFeedback || input === ''
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-default'
              : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200 text-red-600 shadow-sm hover:shadow-md cursor-pointer'
          }`}
        >
          <Delete className="w-6 h-6 mx-auto" />
        </motion.button>
      </div>
    </motion.div>
  );
}
