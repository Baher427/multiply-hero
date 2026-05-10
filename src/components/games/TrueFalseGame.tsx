'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap, Star } from 'lucide-react';
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

  const handleAnswer = (answer: boolean | null) => {
    if (showFeedback) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(answer);
    setShowFeedback(true);

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
      } else {
        handleComplete();
      }
    }, 1800);
  };

  // Auto-advance when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && !showFeedback) {
      handleAnswer(null);
    }
  }, [timeLeft]);

  const getTimerColor = () => {
    if (timeLeft > 60) return 'bg-emerald-400';
    if (timeLeft > 30) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const randomEmoji = useMemo(() => CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)], [currentIndex]);
  const randomEncouraging = useMemo(() => ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)], [currentIndex]);

  const correctAnswerDisplay = `${currentQuestion.multiplicand} × ${currentQuestion.multiplier} = ${currentQuestion.correctAnswer}`;

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-yellow-50 p-4 max-w-lg mx-auto">
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
                  ? 'bg-teal-400'
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
            className={`p-8 mb-6 text-center transition-colors duration-300 ${
              feedbackType === 'correct'
                ? 'bg-emerald-50 border-emerald-300'
                : feedbackType === 'wrong'
                ? 'bg-red-50 border-red-300'
                : 'bg-white border-teal-200'
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

      {/* True/False Buttons */}
      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* True button */}
        <motion.button
          whileHover={!showFeedback ? { scale: 1.05 } : {}}
          whileTap={!showFeedback ? { scale: 0.95 } : {}}
          onClick={() => handleAnswer(true)}
          disabled={showFeedback}
          className={`rounded-3xl p-8 text-2xl font-bold transition-all duration-200 shadow-lg border-2 ${
            showFeedback && currentQuestion.isTrue
              ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
              : showFeedback && selectedAnswer === true && !currentQuestion.isTrue
              ? 'bg-red-100 border-red-400 text-red-700'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400'
          } ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <span className="text-5xl block mb-2">✅</span>
          صح
        </motion.button>

        {/* False button */}
        <motion.button
          whileHover={!showFeedback ? { scale: 1.05 } : {}}
          whileTap={!showFeedback ? { scale: 0.95 } : {}}
          onClick={() => handleAnswer(false)}
          disabled={showFeedback}
          className={`rounded-3xl p-8 text-2xl font-bold transition-all duration-200 shadow-lg border-2 ${
            showFeedback && !currentQuestion.isTrue
              ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
              : showFeedback && selectedAnswer === false && currentQuestion.isTrue
              ? 'bg-red-100 border-red-400 text-red-700'
              : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400'
          } ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <span className="text-5xl block mb-2">❌</span>
          غلط
        </motion.button>
      </div>
    </div>
  );
}
