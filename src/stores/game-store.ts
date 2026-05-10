import { create } from 'zustand';
import { Question, GameConfig, GameResult, GameType } from '@/types';

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
  
  // Current answer feedback
  lastAnswerCorrect: boolean | null;
  lastCorrectAnswer: number | null;
  showFeedback: boolean;
  
  // Matching game specific
  matchedPairs: number[];
  selectedMatchItem: number | null;

  // Actions
  startGame: (config: GameConfig, questions: Question[]) => void;
  answerQuestion: (answer: number | boolean) => void;
  nextQuestion: () => void;
  endGame: () => GameResult;
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
  lastAnswerCorrect: null,
  lastCorrectAnswer: null,
  showFeedback: false,
  matchedPairs: [],
  selectedMatchItem: null,

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
    lastAnswerCorrect: null,
    lastCorrectAnswer: null,
    showFeedback: false,
    matchedPairs: [],
    selectedMatchItem: null,
  }),

  answerQuestion: (answer) => {
    const state = get();
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

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

    set({
      score: state.score + pointsEarned,
      correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
      wrongCount: !isCorrect ? state.wrongCount + 1 : state.wrongCount,
      combo: newCombo,
      bestCombo: newBestCombo,
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
  })),

  endGame: () => {
    const state = get();
    const duration = state.startTime > 0 ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    const accuracy = (state.correctCount + state.wrongCount) > 0 ? (state.correctCount / (state.correctCount + state.wrongCount)) * 100 : 0;
    
    let starsEarned = 0;
    if (accuracy >= 90) starsEarned = 3;
    else if (accuracy >= 70) starsEarned = 2;
    else if (accuracy >= 50) starsEarned = 1;

    const pointsEarned = state.score;
    const coinsEarned = Math.floor(state.score / 5);
    const gemsEarned = starsEarned === 3 ? 2 : starsEarned === 2 ? 1 : 0;

    set({ isPlaying: false });

    return {
      score: state.score,
      correctCount: state.correctCount,
      wrongCount: state.wrongCount,
      combo: state.combo,
      bestCombo: state.bestCombo,
      duration,
      pointsEarned,
      starsEarned,
      coinsEarned,
      gemsEarned,
      newBadges: [],
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
    lastAnswerCorrect: null,
    lastCorrectAnswer: null,
    showFeedback: false,
    matchedPairs: [],
    selectedMatchItem: null,
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
