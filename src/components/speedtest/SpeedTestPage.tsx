'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Flame, Trophy, Timer, Target, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Props ───────────────────────────────────────────────────────────────────

interface SpeedTestPageProps {
  onBack: () => void;
  onComplete: (result: {
    score: number;
    correctCount: number;
    wrongCount: number;
    combo: number;
    bestCombo: number;
    duration: number;
  }) => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type GamePhase = 'intro' | 'playing' | 'results';

interface SpeedQuestion {
  a: number;
  b: number;
  answer: number;
}

interface RankInfo {
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  minQPM: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const RANKS: RankInfo[] = [
  { name: 'برونزي', emoji: '🥉', color: 'text-amber-700', gradient: 'from-amber-600 to-amber-800', minQPM: 0 },
  { name: 'فضّي', emoji: '🥈', color: 'text-slate-400', gradient: 'from-slate-400 to-slate-600', minQPM: 10 },
  { name: 'ذهبي', emoji: '🥇', color: 'text-yellow-500', gradient: 'from-yellow-400 to-amber-500', minQPM: 20 },
  { name: 'ألماسي', emoji: '💎', color: 'text-cyan-400', gradient: 'from-cyan-400 to-blue-500', minQPM: 30 },
];

const TOTAL_DURATION = 60; // seconds

const ENCOURAGEMENTS = {
  correct: ['أحسنت! ⚡', 'رائع! 🔥', 'ممتاز! 🌟', 'يا بطل! 💪', 'سريع! 🚀', 'جبّار! 🎯'],
  wrong: ['حاول مرة أخرى', 'لا بأس!', 'تقدّم أكثر!', 'استمر!'],
  combo: ['🔥 سلسلة!', '⚡ كومبو!', '💥 خارق!', '🌪️ أعاصير!'],
};

function getRank(qpm: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (qpm >= RANKS[i].minQPM) return RANKS[i];
  }
  return RANKS[0];
}

function generateQuestion(): SpeedQuestion {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a * b };
}

function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>();
  options.add(correctAnswer);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = correctAnswer + (offset === 0 ? 1 : offset);
    if (wrong > 0 && wrong !== correctAnswer) {
      options.add(wrong);
    }
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

// ─── Timer Circle Component ──────────────────────────────────────────────────

function TimerCircle({ timeLeft, total }: { timeLeft: number; total: number }) {
  const progress = (timeLeft / total) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg width={100} height={100} className="-rotate-90">
        <circle cx={50} cy={50} r={42} fill="none" stroke="currentColor" strokeWidth={6} className="text-white/20" />
        <motion.circle
          cx={50} cy={50} r={42} fill="none"
          stroke={isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e'}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 42}
          animate={{
            strokeDashoffset: 2 * Math.PI * 42 * (1 - progress / 100),
            filter: isCritical ? 'drop-shadow(0 0 8px #ef4444)' : isLow ? 'drop-shadow(0 0 6px #f59e0b)' : 'none',
          }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-3xl font-black ${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-white'}`}
          animate={isCritical ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {timeLeft}
        </motion.span>
        <span className="text-[9px] font-bold text-white/60">ثانية</span>
      </div>
    </div>
  );
}

// ─── Speed Meter Component ───────────────────────────────────────────────────

function SpeedMeter({ avgSpeed }: { avgSpeed: number }) {
  // avgSpeed is in seconds per question
  const speedScore = Math.max(0, Math.min(100, 100 - (avgSpeed - 1) * 20));
  const label = avgSpeed <= 2 ? 'خارق ⚡' : avgSpeed <= 4 ? 'سريع 🔥' : avgSpeed <= 6 ? 'جيد 👍' : 'تمهّل 🐢';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-20 h-3 rounded-full bg-white/20 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${avgSpeed <= 2 ? 'bg-green-400' : avgSpeed <= 4 ? 'bg-yellow-400' : avgSpeed <= 6 ? 'bg-orange-400' : 'bg-red-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${speedScore}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-[10px] font-bold text-white/70">{label}</span>
    </div>
  );
}

// ─── Streak Flame Component ──────────────────────────────────────────────────

function StreakFlameMini({ streak }: { streak: number }) {
  if (streak < 2) return null;
  const size = Math.min(20 + streak * 3, 50);
  const intensity = Math.min(streak / 10, 1);

  return (
    <motion.div
      className="flex items-center gap-1"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 0.6 }}
    >
      <motion.span
        style={{ fontSize: size }}
        animate={{
          filter: [`brightness(1)`, `brightness(${1.2 + intensity * 0.3})`, `brightness(1)`],
        }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        🔥
      </motion.span>
      <span className="text-sm font-black text-orange-400">{streak}x</span>
    </motion.div>
  );
}

// ─── Intro Screen ────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4" dir="rtl">
      {/* Floating symbols */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['⚡', '🔥', '💎', '🎯', '🏆', '✨', '💫', '🌟'].map((sym, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-10 select-none"
            style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 180, 360], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          >
            {sym}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center relative z-10"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-7xl md:text-8xl mb-4"
        >
          ⚡
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">اختبار السرعة</h1>
        <p className="text-base md:text-lg text-purple-300 mb-6">كم سؤالاً تقدر تحلّ في 60 ثانية؟</p>

        {/* Rules */}
        <div className="space-y-3 mb-8 max-w-sm mx-auto">
          {[
            { icon: '⏱️', text: '60 ثانية فقط!' },
            { icon: '🔥', text: 'سلسلة الإجابات الصحيحة تزيد نقاطك' },
            { icon: '💎', text: 'احصل على رتبة ألماسي!' },
          ].map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm"
            >
              <span className="text-2xl">{rule.icon}</span>
              <span className="text-sm font-bold text-white">{rule.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Ranks preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-3 mb-8"
        >
          {RANKS.map((rank, i) => (
            <motion.div
              key={rank.name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1, type: 'spring' }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-2xl">{rank.emoji}</span>
              <span className="text-[9px] font-bold text-white/60">{rank.name}</span>
              <span className="text-[8px] text-white/40">{rank.minQPM}+ س/د</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: 'spring' }}
        >
          <Button
            onClick={onStart}
            className="h-16 px-12 text-xl font-black bg-gradient-to-l from-yellow-400 to-amber-500 hover:opacity-90 shadow-2xl border-0 rounded-2xl text-slate-900"
          >
            🚀 ابدأ التحدي!
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Results Screen ──────────────────────────────────────────────────────────

function ResultsScreen({
  score,
  correctCount,
  wrongCount,
  bestCombo,
  avgSpeed,
  onBack,
  onPlayAgain,
}: {
  score: number;
  correctCount: number;
  wrongCount: number;
  bestCombo: number;
  avgSpeed: number;
  onBack: () => void;
  onPlayAgain: () => void;
}) {
  const totalAnswered = correctCount + wrongCount;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const qpm = totalAnswered; // questions per minute (60s game)
  const rank = getRank(qpm);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4" dir="rtl">
      {/* Confetti particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-5%',
              backgroundColor: ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'][i % 6],
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, (Math.random() - 0.5) * 100],
              rotate: [0, 360],
              opacity: [1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
        className="text-center relative z-10 max-w-sm w-full"
      >
        {/* Rank Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
          className="mb-6"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className={`inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br ${rank.gradient} shadow-2xl`}
          >
            <span className="text-6xl">{rank.emoji}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`mt-3 text-2xl font-black ${rank.color}`}
          >
            رتبة {rank.name}
          </motion.div>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-5xl font-black text-white mb-1">{score}</div>
          <div className="text-sm text-purple-300 mb-6">نقطة</div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {[
            { label: 'إجابات صحيحة', value: correctCount, emoji: '✅', color: 'text-green-400' },
            { label: 'إجابات خاطئة', value: wrongCount, emoji: '❌', color: 'text-red-400' },
            { label: 'أفضل سلسلة', value: `${bestCombo}x`, emoji: '🔥', color: 'text-orange-400' },
            { label: 'الدقة', value: `${accuracy}%`, emoji: '🎯', color: 'text-cyan-400' },
            { label: 'متوسط السرعة', value: `${avgSpeed.toFixed(1)}ث`, emoji: '⚡', color: 'text-yellow-400' },
            { label: 'أسئلة/دقيقة', value: qpm, emoji: '📊', color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.08 }}
            >
              <Card className="border-0 shadow-lg bg-white/10 backdrop-blur-sm">
                <CardContent className="p-3 text-center">
                  <span className="text-xl">{stat.emoji}</span>
                  <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-white/60 font-bold">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex gap-3"
        >
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 h-12 text-sm font-bold border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            رجوع
          </Button>
          <Button
            onClick={onPlayAgain}
            className="flex-1 h-12 text-sm font-black bg-gradient-to-l from-yellow-400 to-amber-500 hover:opacity-90 border-0 text-slate-900"
          >
            🔄 حاول مرة أخرى
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SpeedTestPage({ onBack, onComplete }: SpeedTestPageProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [currentQuestion, setCurrentQuestion] = useState<SpeedQuestion>(generateQuestion());
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalAnswerTime, setTotalAnswerTime] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate options when question changes
  useEffect(() => {
    setOptions(generateOptions(currentQuestion.answer));
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    setCurrentQuestion(generateQuestion());
    setQuestionStartTime(Date.now());
    setFeedback(null);
  }, []);

  const handleAnswer = useCallback((selectedAnswer: number) => {
    if (feedback !== null) return; // Already answered, wait for next

    const isCorrect = selectedAnswer === currentQuestion.answer;
    const answerTime = (Date.now() - questionStartTime) / 1000;
    setTotalAnswerTime(prev => prev + answerTime);
    setAnsweredCount(prev => prev + 1);

    if (isCorrect) {
      const newCombo = combo + 1;
      const comboMultiplier = 1 + Math.min(newCombo, 10) * 0.2; // 1x to 3x
      const points = Math.round(10 * comboMultiplier);
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      setCombo(newCombo);
      if (newCombo > bestCombo) setBestCombo(newCombo);
      setFeedback('correct');
    } else {
      setWrongCount(prev => prev + 1);
      setCombo(0);
      setFeedback('wrong');
    }

    // Auto-advance after brief feedback
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => {
      nextQuestion();
    }, 400);
  }, [currentQuestion, combo, bestCombo, feedback, questionStartTime, nextQuestion]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up!
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Complete when switching to results
  useEffect(() => {
    if (phase === 'results') {
      if (feedbackRef.current) clearTimeout(feedbackRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      onComplete({
        score,
        correctCount,
        wrongCount,
        combo,
        bestCombo,
        duration: TOTAL_DURATION,
      });
    }
  }, [phase, score, correctCount, wrongCount, combo, bestCombo, onComplete]);

  const startGame = useCallback(() => {
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCombo(0);
    setBestCombo(0);
    setTimeLeft(TOTAL_DURATION);
    setTotalAnswerTime(0);
    setAnsweredCount(0);
    setFeedback(null);
    setCurrentQuestion(generateQuestion());
    setQuestionStartTime(Date.now());
    setPhase('playing');
  }, []);

  const avgSpeed = answeredCount > 0 ? totalAnswerTime / answeredCount : 0;

  const randomEncouragement = useMemo(() => {
    if (feedback === 'correct') {
      return ENCOURAGEMENTS.correct[Math.floor(Math.random() * ENCOURAGEMENTS.correct.length)];
    }
    if (feedback === 'wrong') {
      return ENCOURAGEMENTS.wrong[Math.floor(Math.random() * ENCOURAGEMENTS.wrong.length)];
    }
    return '';
  }, [feedback, currentQuestion]);

  const comboEncouragement = useMemo(() => {
    if (combo >= 5 && combo % 5 === 0) {
      return ENCOURAGEMENTS.combo[Math.min(Math.floor(combo / 5) - 1, ENCOURAGEMENTS.combo.length - 1)];
    }
    return '';
  }, [combo]);

  // ─── Intro Screen ─────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return <IntroScreen onStart={startGame} />;
  }

  // ─── Results Screen ───────────────────────────────────────────────────────
  if (phase === 'results') {
    return (
      <ResultsScreen
        score={score}
        correctCount={correctCount}
        wrongCount={wrongCount}
        bestCombo={bestCombo}
        avgSpeed={avgSpeed}
        onBack={onBack}
        onPlayAgain={startGame}
      />
    );
  }

  // ─── Playing Screen ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col" dir="rtl">
      {/* Top Bar */}
      <div className="p-3 md:p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            {/* Score */}
            <div className="flex items-center gap-2">
              <motion.div
                key={score}
                initial={{ scale: 1.3, color: '#fbbf24' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-2xl font-black text-white"
              >
                {score}
              </motion.div>
              <span className="text-xs text-white/60">نقطة</span>
            </div>

            {/* Timer */}
            <TimerCircle timeLeft={timeLeft} total={TOTAL_DURATION} />

            {/* Combo & Streak */}
            <div className="flex flex-col items-center gap-1">
              <StreakFlameMini streak={combo} />
              {combo >= 3 && (
                <Badge className="bg-orange-500/30 text-orange-300 border-orange-400/30 text-[9px]">
                  ×{(1 + Math.min(combo, 10) * 0.2).toFixed(1)}
                </Badge>
              )}
            </div>
          </div>

          {/* Speed Meter */}
          <SpeedMeter avgSpeed={avgSpeed || 5} />

          {/* Progress Bar */}
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-l from-green-400 to-emerald-500"
              animate={{ width: `${(timeLeft / TOTAL_DURATION) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Feedback overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className={`text-center text-2xl font-black mb-2 ${
                  feedback === 'correct' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {randomEncouragement}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Combo celebration */}
          <AnimatePresence>
            {comboEncouragement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-center text-xl font-black text-orange-400 mb-2"
              >
                {comboEncouragement}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Display */}
          <motion.div
            key={`${currentQuestion.a}-${currentQuestion.b}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-8 py-6 rounded-3xl bg-white/10 backdrop-blur-sm shadow-xl border border-white/10">
              <span className="text-4xl md:text-5xl font-black text-white">{currentQuestion.a}</span>
              <span className="text-3xl md:text-4xl font-bold text-purple-300">×</span>
              <span className="text-4xl md:text-5xl font-black text-white">{currentQuestion.b}</span>
              <span className="text-3xl md:text-4xl font-bold text-purple-300">=</span>
              <span className="text-4xl md:text-5xl font-black text-yellow-400">?</span>
            </div>
          </motion.div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((option, i) => {
              const isCorrectOption = option === currentQuestion.answer;
              let buttonStyle = 'bg-white/10 hover:bg-white/20 border-white/10 text-white';

              if (feedback !== null) {
                if (isCorrectOption) {
                  buttonStyle = 'bg-green-500/30 border-green-400/50 text-green-300';
                } else if (feedback === 'wrong' && !isCorrectOption) {
                  buttonStyle = 'bg-red-500/20 border-red-400/30 text-red-300/50';
                }
              }

              return (
                <motion.button
                  key={`${currentQuestion.a}-${currentQuestion.b}-${option}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={feedback === null ? { scale: 1.05 } : {}}
                  whileTap={feedback === null ? { scale: 0.95 } : {}}
                  onClick={() => handleAnswer(option)}
                  disabled={feedback !== null}
                  className={`h-16 md:h-20 rounded-2xl text-xl md:text-2xl font-black border-2 transition-all duration-150 ${buttonStyle}`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Correct/Wrong counters */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-green-400 font-bold">✅ {correctCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-red-400 font-bold">❌ {wrongCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
