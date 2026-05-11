import { create } from 'zustand';
import { Question, GameConfig, GameResult, GameType } from '@/types';
import { calculateScore, calculateAvgResponseTime } from '@/lib/game-engine/scoring-engine';
import type { ScoringResult } from '@/lib/game-engine/scoring-engine';

interface GameState {
  // Game configuration
  gameConfig: GameConfig | null;
  currentQuestionIndex: number;
  questions: Question[];
  
  // Game state
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  correctCount: number;
  wrongCount: number;
  combo: number;
  bestCombo: number;
  startTime: number;
  
  // Response time tracking
  responseTimes: number[];
  questionStartTime: number;
  avgResponseTime: number; // in ms
  
  // Current answer feedback
  lastAnswerCorrect: boolean | null;
  lastCorrectAnswer: number | null;
  showFeedback: boolean;
  
  // Matching game specific
  matchedPairs: number[];
  selectedMatchItem: number | null;

  // Scoring result from last game
  lastScoringResult: ScoringResult | null;

  // Actions
  startGame: (config: GameConfig, questions: Question[]) => void;
  answerQuestion: (answer: number | boolean) => void;
  nextQuestion: () => void;
  endGame: (currentLevel?: number, currentXP?: number, currentMastery?: number, streak?: number) => GameResult & { scoringResult?: ScoringResult };
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setLastAnswerCorrect: (correct: boolean, correctAnswer?: number) => void;
  clearFeedback: () => void;
  
  // Matching game actions
  setMatchedPairs: (pairs: number[]) => void;
  setSelectedMatchItem: (item: number | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameConfig: null,
  currentQuestionIndex: 0,
  questions: [],
  isPlaying: false,
  isPaused: false,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  combo: 0,
  bestCombo: 0,
  startTime: 0,
  responseTimes: [],
  questionStartTime: 0,
  avgResponseTime: 0,
  lastAnswerCorrect: null,
  lastCorrectAnswer: null,
  showFeedback: false,
  matchedPairs: [],
  selectedMatchItem: null,
  lastScoringResult: null,

  startGame: (config, questions) => set({
    gameConfig: config,
    currentQuestionIndex: 0,
    questions,
    isPlaying: true,
    isPaused: false,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    combo: 0,
    bestCombo: 0,
    startTime: Date.now(),
    questionStartTime: Date.now(),
    responseTimes: [],
    avgResponseTime: 0,
    lastAnswerCorrect: null,
    lastCorrectAnswer: null,
    showFeedback: false,
    matchedPairs: [],
    selectedMatchItem: null,
    lastScoringResult: null,
  }),

  answerQuestion: (answer) => {
    const state = get();
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    // Record response time for this question
    const responseTime = Date.now() - state.questionStartTime;

    let isCorrect = false;
    if (typeof answer === 'boolean') {
      isCorrect = answer === currentQuestion.isTrue;
    } else {
      isCorrect = answer === currentQuestion.correctAnswer;
    }

    const newCombo = isCorrect ? state.combo + 1 : 0;
    const newBestCombo = Math.max(state.bestCombo, newCombo);
    const comboBonus = isCorrect ? Math.min(newCombo, 10) * 2 : 0;
    const basePoints = isCorrect ? 10 : 0;
    const pointsEarned = basePoints + comboBonus;

    // Update response times and calculate running average
    const newResponseTimes = [...state.responseTimes, responseTime];
    const newAvgResponseTime = calculateAvgResponseTime(newResponseTimes);

    set({
      score: state.score + pointsEarned,
      correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
      wrongCount: !isCorrect ? state.wrongCount + 1 : state.wrongCount,
      combo: newCombo,
      bestCombo: newBestCombo,
      responseTimes: newResponseTimes,
      avgResponseTime: newAvgResponseTime,
      lastAnswerCorrect: isCorrect,
      lastCorrectAnswer: !isCorrect ? currentQuestion.correctAnswer : null,
      showFeedback: true,
    });
  },

  nextQuestion: () => set((state) => ({
    currentQuestionIndex: state.currentQuestionIndex + 1,
    showFeedback: false,
    lastAnswerCorrect: null,
    lastCorrectAnswer: null,
    questionStartTime: Date.now(), // Reset question start time for next question
  })),

  endGame: (currentLevel = 1, currentXP = 0, currentMastery = 0, streak = 0) => {
    const state = get();
    const duration = state.startTime > 0 ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    const accuracy = (state.correctCount + state.wrongCount) > 0 ? (state.correctCount / (state.correctCount + state.wrongCount)) * 100 : 0;
    const avgResponseTime = state.avgResponseTime || (duration > 0 && (state.correctCount + state.wrongCount) > 0
      ? Math.floor((duration * 1000) / (state.correctCount + state.wrongCount))
      : 0);

    // Use the scoring engine for comprehensive results
    const scoringResult = calculateScore({
      correctCount: state.correctCount,
      wrongCount: state.wrongCount,
      combo: state.combo,
      bestCombo: state.bestCombo,
      avgResponseTime,
      difficulty: state.gameConfig?.difficulty || 'easy',
      tableNumber: state.gameConfig?.tableNumber || 1,
      currentLevel,
      currentXP,
      currentMastery,
      streak,
    });

    // Backward-compatible stars calculation (use scoring engine result)
    const starsEarned = scoringResult.starsEarned;
    const pointsEarned = scoringResult.totalPoints;
    const coinsEarned = scoringResult.coinsEarned;
    const gemsEarned = scoringResult.gemsEarned;

    set({ isPlaying: false, lastScoringResult: scoringResult });

    return {
      score: state.score,
      correctCount: state.correctCount,
      wrongCount: state.wrongCount,
      combo: state.combo,
      bestCombo: state.bestCombo,
      duration,
      avgResponseTime,
      responseTimes: state.responseTimes,
      pointsEarned,
      starsEarned,
      coinsEarned,
      gemsEarned,
      newBadges: [],
      scoringResult,
    };
  },

  resetGame: () => set({
    gameConfig: null,
    currentQuestionIndex: 0,
    questions: [],
    isPlaying: false,
    isPaused: false,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    combo: 0,
    bestCombo: 0,
    startTime: 0,
    questionStartTime: 0,
    responseTimes: [],
    avgResponseTime: 0,
    lastAnswerCorrect: null,
    lastCorrectAnswer: null,
    showFeedback: false,
    matchedPairs: [],
    selectedMatchItem: null,
    lastScoringResult: null,
  }),

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),

  setLastAnswerCorrect: (correct, correctAnswer) => set({
    lastAnswerCorrect: correct,
    lastCorrectAnswer: correctAnswer ?? null,
    showFeedback: true,
  }),

  clearFeedback: () => set({
    showFeedback: false,
    lastAnswerCorrect: null,
    lastCorrectAnswer: null,
  }),

  setMatchedPairs: (pairs) => set({ matchedPairs: pairs }),
  setSelectedMatchItem: (item) => set({ selectedMatchItem: item }),
}));
