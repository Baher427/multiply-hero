'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Flame, Trophy, Timer, Target, Sparkles, Clock, BarChart3, Star, ChevronLeft, RotateCcw } from 'lucide-react';
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
  iconChar: string;
  color: string;
  gradient: string;
  minQPM: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const RANKS: RankInfo[] = [
  { name: 'برونزي', iconChar: '🥉', color: 'text-amber-700', gradient: 'from-amber-600 to-amber-800', minQPM: 0 },
  { name: 'فضّي', iconChar: '🥈', color: 'text-slate-400', gradient: 'from-slate-400 to-slate-600', minQPM: 10 },
  { name: 'ذهبي', iconChar: '🥇', color: 'text-yellow-500', gradient: 'from-yellow-400 to-amber-500', minQPM: 20 },
  { name: 'ألماسي', iconChar: '💎', color: 'text-cyan-400', gradient: 'from-cyan-400 to-blue-500', minQPM: 30 },
];

const TIME_OPTIONS = [
  { seconds: 30, label: '30 ثانية', icon: <Clock className="w-4 h-4" /> },
  { seconds: 60, label: '60 ثانية', icon: <Timer className="w-4 h-4" /> },
  { seconds: 120, label: '120 ثانية', icon: <Flame className="w-4 h-4" /> },
];

const TABLE_FILTERS = [
  { value: 0, label: 'مختلط' },
  { value: 2, label: 'جدول 2' }, { value: 3, label: 'جدول 3' }, { value: 4, label: 'جدول 4' },
  { value: 5, label: 'جدول 5' }, { value: 6, label: 'جدول 6' }, { value: 7, label: 'جدول 7' },
  { value: 8, label: 'جدول 8' }, { value: 9, label: 'جدول 9' },
];

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

function generateQuestion(tableFilter: number): SpeedQuestion {
  const a = tableFilter > 0 ? tableFilter : Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a * b };
}

function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>();
  options.add(correctAnswer);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = correctAnswer + (offset === 0 ? 1 : offset);
    if (wrong > 0 && wrong !== correctAnswer) options.add(wrong);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

// ─── Timer Circle Component ──────────────────────────────────────────────────

function TimerCircle({ timeLeft, total }: { timeLeft: number; total: number }) {
  const progress = (timeLeft / total) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg width={100} height={100} className="-rotate-90">
        <circle cx={50} cy={50} r={42} fill="none" stroke="currentColor" strokeWidth={6} className="text-white/20" />
        <motion.circle
          cx={50} cy={50} r={42} fill="none"
          stroke={isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e'}
          strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{
            strokeDashoffset: circumference * (1 - progress / 100),
            filter: isCritical ? 'drop-shadow(0 0 8px #ef4444)' : isLow ? 'drop-shadow(0 0 6px #f59e0b)' : 'none',
          }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-3xl font-black ${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-white'}`}
          animate={isCritical ? { scale: [1, 1.2, 1] } : {}}
          transition={isCritical ? { repeat: Infinity, duration: 0.5 } : {}}
        >
          {timeLeft}
        </motion.span>
        <span className="text-[9px] font-bold text-white/60">ثانية</span>
      </div>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg width={32} height={32} className="-rotate-90">
          <circle cx={16} cy={16} r={12} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
          <circle cx={16} cy={16} r={12} fill="none" stroke="#22c55e" strokeWidth={3}
            strokeLinecap="round" strokeDasharray={2 * Math.PI * 12}
            strokeDashoffset={2 * Math.PI * 12 * (1 - pct / 100)} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-black text-white">{current}</span>
        </div>
      </div>
      <span className="text-[9px] text-white/50">سؤال</span>
    </div>
  );
}

// ─── Intro Screen ────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['⚡', '🔥', '💎', '🎯', '🏆', '✨', '💫', '🌟'].map((sym, i) => (
          <motion.div key={i} className="absolute text-2xl opacity-10 select-none"
            style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 180, 360], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
            {sym}
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-center relative z-10">
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-7xl md:text-8xl mb-4">⚡</motion.div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">اختبار السرعة</h1>
        <p className="text-base md:text-lg text-purple-300 mb-6">كم سؤالاً تقدر تحلّ؟</p>

        <div className="space-y-3 mb-8 max-w-sm mx-auto">
          {[
            { icon: <Timer className="w-5 h-5" />, text: 'اختر الوقت: 30، 60، أو 120 ثانية' },
            { icon: <Flame className="w-5 h-5" />, text: 'السلسلة تزيد نقاطك!' },
            { icon: <Trophy className="w-5 h-5" />, text: 'احصل على رتبة ألماسي!' },
          ].map((rule, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <span className="text-purple-300">{rule.icon}</span>
              <span className="text-sm font-bold text-white">{rule.text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <Button onClick={onStart}
            className="h-16 px-12 text-xl font-black bg-gradient-to-l from-yellow-400 to-amber-500 hover:opacity-90 shadow-2xl border-0 rounded-2xl text-slate-900">
            🚀 ابدأ التحدي!
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Results Screen ──────────────────────────────────────────────────────────

function ResultsScreen({
  score, correctCount, wrongCount, bestCombo, avgSpeed, fastestAnswer, totalDuration, personalBest, onBack, onPlayAgain,
}: {
  score: number; correctCount: number; wrongCount: number; bestCombo: number;
  avgSpeed: number; fastestAnswer: number; totalDuration: number; personalBest: number | null;
  onBack: () => void; onPlayAgain: () => void;
}) {
  const totalAnswered = correctCount + wrongCount;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const qpm = totalDuration > 0 ? Math.round((totalAnswered / totalDuration) * 60) : 0;
  const rank = getRank(qpm);
  const isNewBest = personalBest === null || score > personalBest;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4" dir="rtl">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${((i * 5) % 100)}%`, top: '-5%',
              backgroundColor: ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'][i % 6],
            }}
            animate={{ y: ['0vh', '110vh'], x: [0, ((i % 3) - 1) * 80], rotate: [0, 360], opacity: [1, 0] }}
            transition={{ duration: 3 + (i % 4), delay: i * 0.15, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
      </div>

      <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }} className="text-center relative z-10 max-w-sm w-full">
        {/* Rank Badge */}
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }} className="mb-6">
          <motion.div animate={{ scale: [1, 1.08, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className={`inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br ${rank.gradient} shadow-2xl`}
            style={{ boxShadow: 'inset -3px -3px 6px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.3)' }}>
            <span className="text-6xl">{rank.iconChar}</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className={`mt-3 text-2xl font-black ${rank.color}`}>رتبة {rank.name}</motion.div>
        </motion.div>

        {/* Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="text-5xl font-black text-white mb-1">{score}</div>
          <div className="text-sm text-purple-300 mb-2">نقطة</div>
          {isNewBest && (
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-amber-400">رقم قياسي جديد!</span>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-3 mb-6 mt-4">
          {[
            { label: 'إجابات صحيحة', value: correctCount, color: 'text-green-400' },
            { label: 'إجابات خاطئة', value: wrongCount, color: 'text-red-400' },
            { label: 'أفضل سلسلة', value: `${bestCombo}x`, color: 'text-orange-400' },
            { label: 'الدقة', value: `${accuracy}%`, color: 'text-cyan-400' },
            { label: 'متوسط السرعة', value: `${avgSpeed.toFixed(1)}ث`, color: 'text-yellow-400' },
            { label: 'أسئلة/دقيقة', value: qpm, color: 'text-purple-400' },
            { label: 'أسرع إجابة', value: `${fastestAnswer.toFixed(1)}ث`, color: 'text-emerald-400' },
            { label: 'إجمالي الأسئلة', value: totalAnswered, color: 'text-blue-400' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.06 }}>
              <Card className="border-0 shadow-lg bg-white/10 backdrop-blur-sm">
                <CardContent className="p-3 text-center">
                  <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-white/60 font-bold">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Speed Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          className="mb-6">
          <Card className="border-0 shadow-lg bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white/80">تحليل السرعة</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">السرعة</span>
                    <span className={`font-bold ${avgSpeed <= 3 ? 'text-green-400' : avgSpeed <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {avgSpeed <= 3 ? 'خارق ⚡' : avgSpeed <= 5 ? 'جيد 🔥' : 'بطيء 🐢'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${avgSpeed <= 3 ? 'bg-green-400' : avgSpeed <= 5 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(10, 100 - (avgSpeed - 1) * 15)}%` }}
                      transition={{ duration: 0.8, delay: 1.3 }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
          className="flex gap-3">
          <Button onClick={onBack} variant="outline"
            className="flex-1 h-12 text-sm font-bold border-white/20 text-white hover:bg-white/10 bg-transparent">رجوع</Button>
          <Button onClick={onPlayAgain}
            className="flex-1 h-12 text-sm font-black bg-gradient-to-l from-yellow-400 to-amber-500 hover:opacity-90 border-0 text-slate-900">
            <RotateCcw className="w-4 h-4 ml-1" /> حاول مرة أخرى
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SpeedTestPage({ onBack, onComplete }: SpeedTestPageProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedTable, setSelectedTable] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState<SpeedQuestion>(generateQuestion(0));
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
  const [fastestAnswer, setFastestAnswer] = useState(Infinity);
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load personal best from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('speedTestPersonalBest');
      if (stored) setPersonalBest(parseInt(stored, 10));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setOptions(generateOptions(currentQuestion.answer));
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    setCurrentQuestion(generateQuestion(selectedTable));
    setQuestionStartTime(Date.now());
    setFeedback(null);
  }, [selectedTable]);

  const handleAnswer = useCallback((selectedAnswer: number) => {
    if (feedback !== null) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    const answerTime = (Date.now() - questionStartTime) / 1000;
    setTotalAnswerTime(prev => prev + answerTime);
    setAnsweredCount(prev => prev + 1);
    if (answerTime < fastestAnswer) setFastestAnswer(answerTime);

    if (isCorrect) {
      const newCombo = combo + 1;
      const comboMultiplier = 1 + Math.min(newCombo, 10) * 0.2;
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

    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => { nextQuestion(); }, 400);
  }, [currentQuestion, combo, bestCombo, feedback, questionStartTime, nextQuestion, fastestAnswer]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Complete
  useEffect(() => {
    if (phase === 'results') {
      if (feedbackRef.current) clearTimeout(feedbackRef.current);
      if (timerRef.current) clearInterval(timerRef.current);

      // Save personal best
      if (personalBest === null || score > personalBest) {
        try { localStorage.setItem('speedTestPersonalBest', String(score)); } catch { /* ignore */ }
        setPersonalBest(score);
      }

      onComplete({ score, correctCount, wrongCount, combo, bestCombo, duration: selectedDuration });
    }
  }, [phase, score, correctCount, wrongCount, combo, bestCombo, selectedDuration, onComplete, personalBest]);

  const startGame = useCallback(() => {
    setScore(0); setCorrectCount(0); setWrongCount(0); setCombo(0); setBestCombo(0);
    setTimeLeft(selectedDuration); setTotalAnswerTime(0); setAnsweredCount(0);
    setFastestAnswer(Infinity); setFeedback(null);
    setCurrentQuestion(generateQuestion(selectedTable));
    setQuestionStartTime(Date.now());
    setPhase('playing');
  }, [selectedDuration, selectedTable]);

  const avgSpeed = answeredCount > 0 ? totalAnswerTime / answeredCount : 0;

  const randomEncouragement = useMemo(() => {
    if (feedback === 'correct') return ENCOURAGEMENTS.correct[Math.floor(Math.random() * ENCOURAGEMENTS.correct.length)];
    if (feedback === 'wrong') return ENCOURAGEMENTS.wrong[Math.floor(Math.random() * ENCOURAGEMENTS.wrong.length)];
    return '';
  }, [feedback, currentQuestion]);

  // ─── Intro Screen ───
  if (phase === 'intro') {
    return <IntroScreen onStart={startGame} />;
  }

  // ─── Results Screen ───
  if (phase === 'results') {
    return (
      <ResultsScreen
        score={score} correctCount={correctCount} wrongCount={wrongCount}
        bestCombo={bestCombo} avgSpeed={avgSpeed} fastestAnswer={fastestAnswer === Infinity ? 0 : fastestAnswer}
        totalDuration={selectedDuration} personalBest={personalBest}
        onBack={onBack} onPlayAgain={startGame}
      />
    );
  }

  // ─── Playing Screen ───
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col" dir="rtl">
      {/* Top Bar */}
      <div className="p-3 md:p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            {/* Score */}
            <div className="flex items-center gap-2">
              <motion.div key={score} initial={{ scale: 1.3, color: '#fbbf24' }} animate={{ scale: 1, color: '#ffffff' }}
                className="text-2xl font-black text-white">{score}</motion.div>
              <span className="text-xs text-white/60">نقطة</span>
            </div>

            {/* Timer */}
            <TimerCircle timeLeft={timeLeft} total={selectedDuration} />

            {/* Combo & Progress */}
            <div className="flex flex-col items-center gap-1">
              {combo >= 2 && (
                <motion.div className="flex items-center gap-1"
                  animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                  <Flame className="w-5 h-5 text-orange-400" style={{ fontSize: Math.min(20 + combo * 3, 40) }} />
                  <span className="text-sm font-black text-orange-400">{combo}x</span>
                </motion.div>
              )}
              <ProgressRing current={correctCount + wrongCount} total={50} />
            </div>
          </div>

          {/* Combo flame bar */}
          {combo >= 3 && (
            <motion.div className="h-1.5 rounded-full bg-orange-900/30 overflow-hidden mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="h-full rounded-full bg-gradient-to-l from-orange-400 to-yellow-400"
                animate={{ width: `${Math.min(combo * 10, 100)}%` }}
                transition={{ duration: 0.3 }} />
            </motion.div>
          )}

          {/* Progress Bar */}
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-l from-green-400 to-emerald-500"
              animate={{ width: `${(timeLeft / selectedDuration) * 100}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, scale: 0.5, y: -30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className={`text-center text-2xl font-black mb-2 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {randomEncouragement}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question */}
          <motion.div key={`${currentQuestion.a}-${currentQuestion.b}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-8 py-6 rounded-3xl bg-white/10 backdrop-blur-sm shadow-xl border border-white/10"
              style={{ boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.15)' }}>
              <span className="text-4xl md:text-5xl font-black text-white">{currentQuestion.a}</span>
              <span className="text-3xl md:text-4xl font-bold text-purple-300">×</span>
              <span className="text-4xl md:text-5xl font-black text-white">{currentQuestion.b}</span>
              <span className="text-3xl md:text-4xl font-bold text-purple-300">=</span>
              <span className="text-4xl md:text-5xl font-black text-yellow-400">?</span>
            </div>
          </motion.div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((option, i) => {
              const isCorrectOption = option === currentQuestion.answer;
              let buttonStyle = 'bg-white/10 hover:bg-white/20 border-white/10 text-white';

              if (feedback !== null) {
                if (isCorrectOption) buttonStyle = 'bg-green-500/30 border-green-400/50 text-green-300';
                else if (feedback === 'wrong') buttonStyle = 'bg-red-500/20 border-red-400/30 text-red-300/50';
              }

              return (
                <motion.button key={`${currentQuestion.a}-${currentQuestion.b}-${option}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={feedback === null ? { scale: 1.05 } : {}}
                  whileTap={feedback === null ? { scale: 0.95 } : {}}
                  onClick={() => handleAnswer(option)} disabled={feedback !== null}
                  className={`h-16 md:h-20 rounded-2xl text-xl md:text-2xl font-black border-2 transition-all duration-150 ${buttonStyle}`}
                  style={{ boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.15)' }}>
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Counters */}
          <div className="flex justify-center gap-6 mt-6">
            <span className="text-sm text-green-400 font-bold">✅ {correctCount}</span>
            <span className="text-sm text-red-400 font-bold">❌ {wrongCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
