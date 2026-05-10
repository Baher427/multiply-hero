'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap, Star, Delete } from 'lucide-react';

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

export default function FillBlankGame({
  questions,
  onComplete,
  onBack,
}: FillBlankGameProps) {
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
    } else {
      setWrongCount((prev) => prev + 1);
      setCombo(0);
      setFeedbackType('wrong');
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
      handleSubmit();
    }
  }, [timeLeft]);

  const handleNumberPress = (num: number) => {
    if (showFeedback) return;
    if (input.length >= 3) return; // Max 3 digits
    setInput((prev) => prev + num.toString());
  };

  const handleDelete = () => {
    if (showFeedback) return;
    setInput((prev) => prev.slice(0, -1));
  };

  const getTimerColor = () => {
    if (timeLeft > 60) return 'bg-emerald-400';
    if (timeLeft > 30) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const randomEmoji = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)];
  const randomEncouraging =
    ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];

  // Build display with blank
  const renderDisplay = () => {
    const parts = currentQuestion.display.split('___');
    return (
      <span>
        {parts[0]}
        <motion.span
          className="inline-block min-w-[80px] border-b-4 border-dashed border-orange-400 mx-2 text-orange-500"
          animate={input ? { scale: [1, 1.05, 1] } : { opacity: [0.5, 1] }}
          transition={{ duration: 0.5, repeat: input ? 0 : Infinity }}
        >
          {input || '؟'}
        </motion.span>
        {parts[1]}
      </span>
    );
  };

  const numPadButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-gradient-to-b from-rose-50 to-emerald-50 p-4 max-w-lg mx-auto">
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

      {/* Timer bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getTimerColor()}`}
          animate={{ width: `${timeLeft}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <span>
          السؤال {currentIndex + 1} من {totalQuestions}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentIndex
                  ? 'bg-emerald-400'
                  : i === currentIndex
                  ? 'bg-rose-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card
            className={`p-8 mb-4 text-center transition-colors duration-300 ${
              feedbackType === 'correct'
                ? 'bg-emerald-50 border-emerald-300'
                : feedbackType === 'wrong'
                ? 'bg-red-50 border-red-300'
                : 'bg-white border-rose-200'
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
                  animate={{ opacity: 1, scale: 1 }}
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

      {/* Input Display */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-4 mb-4 text-center min-h-[56px] flex items-center justify-center">
        <span className={`text-3xl font-bold ${input ? 'text-gray-800' : 'text-gray-300'}`}>
          {input || 'ادخل الإجابة...'}
        </span>
        {input && (
          <motion.span
            className="inline-block w-0.5 h-8 bg-rose-500 mr-1"
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
        className={`w-full rounded-2xl p-4 text-xl font-bold mb-4 transition-all ${
          showFeedback || input === ''
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 cursor-pointer'
        }`}
      >
        تحقق ✅
      </motion.button>

      {/* Number Pad */}
      <div className="grid grid-cols-5 gap-2 flex-1 content-end pb-4">
        {numPadButtons.map((num) => (
          <motion.button
            key={num}
            whileHover={!showFeedback ? { scale: 1.1 } : {}}
            whileTap={!showFeedback ? { scale: 0.9 } : {}}
            onClick={() => handleNumberPress(num)}
            disabled={showFeedback}
            className={`rounded-xl p-4 text-2xl font-bold transition-all border-2 ${
              showFeedback
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-default'
                : 'bg-white border-gray-200 text-gray-700 shadow-sm hover:shadow-md hover:border-rose-300 cursor-pointer active:bg-rose-50'
            } ${num === 0 ? 'col-span-1' : ''}`}
          >
            {num}
          </motion.button>
        ))}
        {/* Delete button */}
        <motion.button
          whileHover={!showFeedback ? { scale: 1.1 } : {}}
          whileTap={!showFeedback ? { scale: 0.9 } : {}}
          onClick={handleDelete}
          disabled={showFeedback || input === ''}
          className={`rounded-xl p-4 text-xl font-bold transition-all border-2 ${
            showFeedback || input === ''
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-default'
              : 'bg-red-50 border-red-200 text-red-600 shadow-sm hover:shadow-md cursor-pointer'
          }`}
        >
          <Delete className="w-6 h-6 mx-auto" />
        </motion.button>
      </div>
    </div>
  );
}
