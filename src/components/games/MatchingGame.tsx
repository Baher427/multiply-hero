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
      }, 800);
    }
  }, [matchedPairs.size, questions.length, score, correctCount, wrongCount, combo, bestCombo, startTime, onComplete]);

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

  // Calculate SVG lines between matched pairs
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
        <motion.line
          key={`line-${idx}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#10b981"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      );
    });
  };

  const expressionColors = [
    'bg-pink-50 border-pink-300 text-pink-700',
    'bg-teal-50 border-teal-300 text-teal-700',
    'bg-amber-50 border-amber-300 text-amber-700',
    'bg-violet-50 border-violet-300 text-violet-700',
    'bg-emerald-50 border-emerald-300 text-emerald-700',
    'bg-rose-50 border-rose-300 text-rose-700',
  ];

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-pink-50 p-4 max-w-2xl mx-auto">
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
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getTimerColor()} bg-gray-100`}>
            🕐 {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <LinkIcon className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-gray-500">
          صِل العبارة بالإجابة الصحيحة ({matchedPairs.size / 2 > questions.length ? questions.length : Math.floor(matchedPairs.size / 2)} / {questions.length})
        </span>
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
        {/* SVG for connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {renderLines()}
        </svg>

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
                    opacity: isMatched ? 0.3 : 1,
                    x: 0,
                    scale: isLastMatched ? [1, 1.1, 1] : isSelected ? 1.05 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => !isMatched && handleLeftClick(index)}
                  className={`rounded-2xl p-4 text-center text-xl font-bold border-2 transition-colors cursor-pointer ${
                    isMatched
                      ? 'bg-gray-100 border-gray-300 text-gray-400 line-through'
                      : isWrong
                      ? 'bg-red-50 border-red-400 text-red-600'
                      : isSelected
                      ? 'bg-amber-100 border-amber-400 text-amber-700 shadow-lg'
                      : `${expressionColors[index % expressionColors.length]} shadow-md hover:shadow-lg`
                  }`}
                >
                  {q.display}
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
                    opacity: isMatched ? 0.3 : 1,
                    x: 0,
                    scale: isMatched ? 0.95 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => !isMatched && handleRightClick(shuffledIndex)}
                  className={`rounded-2xl p-4 text-center text-2xl font-extrabold border-2 transition-colors cursor-pointer ${
                    isMatched
                      ? 'bg-gray-100 border-gray-300 text-gray-400'
                      : isWrong
                      ? 'bg-red-50 border-red-400 text-red-600'
                      : 'bg-white border-gray-200 text-gray-700 shadow-md hover:shadow-lg hover:border-emerald-300'
                  }`}
                >
                  {q.correctAnswer}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
