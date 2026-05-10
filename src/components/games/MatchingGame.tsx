'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Star, Link as LinkIcon } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

interface MatchingGameProps {
  questions: Array<{
    id: string;
    multiplicand: number;
    multiplier: number;
    correctAnswer: number;
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

interface MatchLine {
  fromIndex: number;
  toIndex: number;
}

// Sparkle effect component for matched pairs
function SparkleEffect({ x, y }: { x: number; y: number }) {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    angle: i * 60 * (Math.PI / 180),
    distance: 15 + i * 5,
  }));

  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          className="absolute"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(s.angle) * s.distance,
            y: Math.sin(s.angle) * s.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="#fbbf24">
            <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Celebration animation for completing all matches
function CelebrationOverlay() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 1] }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
        className="text-8xl"
      >
        🎉
      </motion.div>
      {/* Flying particles */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: ['#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#38bdf8'][i % 6],
            left: '50%',
            top: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: (Math.cos(i * 36 * Math.PI / 180) * (80 + (i % 3) * 40)),
            y: (Math.sin(i * 36 * Math.PI / 180) * (80 + (i % 3) * 40)),
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 1, delay: i * 0.03, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  );
}

export default function MatchingGame({
  questions,
  onComplete,
  onBack,
}: MatchingGameProps) {
  const { play: playSound } = useSound();
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [matchLines, setMatchLines] = useState<MatchLine[]>([]);
  const [shuffledRight, setShuffledRight] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [startTime] = useState(Date.now());
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);
  const [lastMatched, setLastMatched] = useState<number | null>(null);
  const [sparklePos, setSparklePos] = useState<{ x: number; y: number } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // Shuffle right column on mount
  useEffect(() => {
    const indices = questions.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledRight(indices);
  }, [questions]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Check completion
  useEffect(() => {
    if (matchedPairs.size === questions.length * 2 && questions.length > 0 && !completedRef.current) {
      completedRef.current = true;
      setShowCelebration(true);
      playSound('gameOver');
      const duration = Math.round((Date.now() - startTime) / 1000);
      setTimeout(() => {
        onComplete({
          score,
          correctCount,
          wrongCount,
          combo,
          bestCombo,
          duration,
        });
      }, 1200);
    }
  }, [matchedPairs.size, questions.length, score, correctCount, wrongCount, combo, bestCombo, startTime, onComplete, playSound]);

  // Time up
  useEffect(() => {
    if (timeLeft === 0 && !completedRef.current) {
      completedRef.current = true;
      const duration = Math.round((Date.now() - startTime) / 1000);
      onComplete({
        score,
        correctCount,
        wrongCount,
        combo,
        bestCombo,
        duration,
      });
    }
  }, [timeLeft, score, correctCount, wrongCount, combo, bestCombo, startTime, onComplete]);

  const handleLeftClick = (index: number) => {
    if (matchedPairs.has(index)) return;
    setSelectedLeft(index);
    setWrongPair(null);
  };

  const handleRightClick = (shuffledIndex: number) => {
    if (selectedLeft === null) return;
    if (matchedPairs.has(shuffledIndex)) return;

    const actualQuestionIndex = shuffledRight[shuffledIndex];
    const isCorrect = selectedLeft === actualQuestionIndex;

    if (isCorrect) {
      const newMatched = new Set(matchedPairs);
      newMatched.add(selectedLeft);
      newMatched.add(shuffledIndex);
      setMatchedPairs(newMatched);
      setMatchLines((prev) => [...prev, { fromIndex: selectedLeft, toIndex: shuffledIndex }]);
      const comboBonus = combo * 3;
      const points = 15 + comboBonus;
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > bestCombo) setBestCombo(newCombo);
      setLastMatched(selectedLeft);

      // Sparkle effect at right card position
      const rightEl = rightRefs.current[shuffledIndex];
      if (rightEl && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        setSparklePos({
          x: rightRect.left - containerRect.left + rightRect.width / 2,
          y: rightRect.top - containerRect.top + rightRect.height / 2,
        });
        setTimeout(() => setSparklePos(null), 700);
      }

      setTimeout(() => setLastMatched(null), 600);
      playSound('match');
    } else {
      setWrongCount((prev) => prev + 1);
      setCombo(0);
      setWrongPair({ left: selectedLeft, right: shuffledIndex });
      setTimeout(() => setWrongPair(null), 800);
      playSound('wrong');
    }

    setSelectedLeft(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 80) return 'text-emerald-500';
    if (timeLeft > 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getTimerGradient = () => {
    if (timeLeft > 80) return 'from-emerald-400 to-green-500';
    if (timeLeft > 40) return 'from-amber-400 to-yellow-500';
    return 'from-red-400 to-rose-500';
  };

  // Calculate SVG lines between matched pairs with glow
  const renderLines = () => {
    if (!containerRef.current) return null;

    return matchLines.map((line, idx) => {
      const leftEl = leftRefs.current[line.fromIndex];
      const rightEl = rightRefs.current[line.toIndex];
      const container = containerRef.current;

      if (!leftEl || !rightEl || !container) return null;

      const containerRect = container.getBoundingClientRect();
      const leftRect = leftEl.getBoundingClientRect();
      const rightRect = rightEl.getBoundingClientRect();

      const x1 = leftRect.left - containerRect.left + leftRect.width;
      const y1 = leftRect.top - containerRect.top + leftRect.height / 2;
      const x2 = rightRect.left - containerRect.left;
      const y2 = rightRect.top - containerRect.top + rightRect.height / 2;

      return (
        <g key={`line-${idx}`}>
          {/* Glow effect */}
          <motion.line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#34d399" strokeWidth={8} strokeLinecap="round"
            strokeDasharray="8 4"
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
            transition={{ duration: 0.5 }}
            filter="url(#glow)"
          />
          {/* Main line */}
          <motion.line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#10b981" strokeWidth={3} strokeLinecap="round"
            strokeDasharray="8 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </g>
      );
    });
  };

  const expressionColors = [
    'from-pink-400 to-rose-500',
    'from-teal-400 to-cyan-500',
    'from-amber-400 to-orange-500',
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-green-500',
    'from-rose-400 to-pink-500',
  ];

  const expressionBorderColors = [
    'border-pink-300',
    'border-teal-300',
    'border-amber-300',
    'border-violet-300',
    'border-emerald-300',
    'border-rose-300',
  ];

  const matchedPairsCount = Math.floor(matchedPairs.size / 2);

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 p-4 max-w-2xl mx-auto relative">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && <CelebrationOverlay />}
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
          {/* Timer with animated gradient */}
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-gray-100 ${getTimerColor()}`}>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getTimerGradient()}`}
              style={{ animation: timeLeft <= 30 ? 'pulse 1s infinite' : 'none' }}
            />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <LinkIcon className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-gray-500">
          صِل العبارة بالإجابة الصحيحة ({matchedPairsCount} / {questions.length})
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-500"
          animate={{ width: `${(matchedPairsCount / questions.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Instruction */}
      <AnimatePresence>
        {selectedLeft !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-amber-600 font-bold mb-3"
          >
            👆 الآن اختر الإجابة الصحيحة من العمود الأيسر
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Board */}
      <div className="relative flex-1" ref={containerRef}>
        {/* SVG for connection lines with glow filter */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {renderLines()}
        </svg>

        {/* Sparkle effect */}
        <AnimatePresence>
          {sparklePos && <SparkleEffect x={sparklePos.x} y={sparklePos.y} />}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Right column - Expressions (RTL: right side) */}
          <div className="flex flex-col gap-3">
            {questions.map((q, index) => {
              const isMatched = matchedPairs.has(index);
              const isSelected = selectedLeft === index;
              const isLastMatched = lastMatched === index;
              const isWrong = wrongPair?.left === index;

              return (
                <motion.div
                  key={`left-${q.id}`}
                  ref={(el) => { leftRefs.current[index] = el; }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{
                    opacity: isMatched ? 0.35 : 1,
                    x: 0,
                    scale: isLastMatched ? [1, 1.12, 1] : isSelected ? 1.06 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => !isMatched && handleLeftClick(index)}
                  className={`rounded-2xl p-4 text-center text-xl font-bold border-2 transition-all cursor-pointer relative overflow-hidden ${
                    isMatched
                      ? 'bg-gray-100 border-gray-300 text-gray-400 line-through'
                      : isWrong
                      ? 'bg-red-50 border-red-400 text-red-600'
                      : isSelected
                      ? `bg-gradient-to-br ${expressionColors[index % expressionColors.length]} text-white border-white/50 shadow-lg shadow-amber-200/50`
                      : `bg-gradient-to-br ${expressionColors[index % expressionColors.length]} text-white ${expressionBorderColors[index % expressionBorderColors.length]} shadow-md hover:shadow-lg`
                  }`}
                >
                  {/* Pulse animation when selected */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-white/50"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  {/* Shine overlay */}
                  {!isMatched && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none" />
                  )}
                  <span className="relative z-10">{q.display}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Left column - Answers (RTL: left side) - Shuffled */}
          <div className="flex flex-col gap-3">
            {shuffledRight.map((questionIndex, shuffledIndex) => {
              const q = questions[questionIndex];
              const isMatched = matchedPairs.has(shuffledIndex);
              const isWrong = wrongPair?.right === shuffledIndex;

              return (
                <motion.div
                  key={`right-${q.id}-${shuffledIndex}`}
                  ref={(el) => { rightRefs.current[shuffledIndex] = el; }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{
                    opacity: isMatched ? 0.35 : 1,
                    x: 0,
                    scale: isMatched ? 0.95 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => !isMatched && handleRightClick(shuffledIndex)}
                  className={`rounded-2xl p-4 text-center text-2xl font-extrabold border-2 transition-all cursor-pointer relative overflow-hidden ${
                    isMatched
                      ? 'bg-gray-100 border-gray-300 text-gray-400'
                      : isWrong
                      ? 'bg-red-50 border-red-400 text-red-600'
                      : 'bg-white border-gray-200 text-gray-700 shadow-md hover:shadow-lg hover:border-emerald-300'
                  }`}
                >
                  {/* Shine overlay for unmatched */}
                  {!isMatched && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent rounded-2xl pointer-events-none"
                      whileHover={{ opacity: 1 }}
                    />
                  )}
                  <span className="relative z-10">{q.correctAnswer}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
