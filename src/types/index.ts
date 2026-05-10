// ===== App Views =====
export type AppView =
  | 'landing'
  | 'login'
  | 'profile-setup'
  | 'child-select'
  | 'dashboard'
  | 'game-select'
  | 'game-play'
  | 'game-results'
  | 'world-map'
  | 'achievements'
  | 'daily-challenge'
  | 'story-mode'
  | 'admin'
  | 'parent'
  | 'settings'
  | 'leaderboard'
  | 'shop'
  | 'practice'
  | 'speed-test';

// ===== Game Types =====
export type GameType = 'multiple-choice' | 'true-false' | 'matching' | 'fill-blank';

export interface Question {
  id: string;
  tableNumber: number;
  multiplicand: number;
  multiplier: number;
  correctAnswer: number;
  options?: number[];
  isTrue?: boolean;
  blankPosition?: 'result' | 'multiplicand' | 'multiplier';
  display: string;
}

export interface GameConfig {
  gameType: GameType;
  tableNumber: number | 'mixed';
  questionCount: number;
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameResult {
  score: number;
  correctCount: number;
  wrongCount: number;
  combo: number;
  bestCombo: number;
  duration: number;
  pointsEarned: number;
  starsEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  newBadges: string[];
}

// ===== Child Profile =====
export interface ChildProfile {
  id: string;
  name: string;
  displayName: string;
  age: number;
  avatarId: string;
  favoriteColor: string;
  points: number;
  level: number;
  stars: number;
  gems: number;
  coins: number;
  streak: number;
  lastActiveDate: string | null;
  totalPlayTime: number;
  comboCount: number;
  bestCombo: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Progress =====
export interface TableProgressData {
  id: string;
  childId: string;
  tableNumber: number;
  masteryLevel: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalAttempts: number;
  avgSpeed: number;
  lastPracticed: string;
}

// ===== Badges =====
export type BadgeType =
  | 'first-game'
  | 'table-master-1' | 'table-master-2' | 'table-master-3' | 'table-master-4'
  | 'table-master-5' | 'table-master-6' | 'table-master-7' | 'table-master-8' | 'table-master-9'
  | 'combo-5' | 'combo-10' | 'combo-25' | 'combo-50'
  | 'speed-demon'
  | 'daily-warrior'
  | 'streak-3' | 'streak-7' | 'streak-14' | 'streak-30'
  | 'points-100' | 'points-500' | 'points-1000' | 'points-5000'
  | 'perfect-game'
  | 'explorer'
  | 'story-chapter-1'
  | 'all-tables';

export interface BadgeInfo {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

// ===== Avatars =====
export interface AvatarDef {
  id: string;
  name: string;
  emoji: string;
  category: 'animal' | 'emoji' | 'fruit' | 'object' | 'character';
  unlockLevel: number;
}

// ===== World / Map =====
export interface WorldTheme {
  tableNumber: number;
  name: string;
  emoji: string;
  bgColor: string;
  accentColor: string;
  description: string;
}

// ===== AI Coach =====
export interface CoachMessage {
  id: string;
  text: string;
  type: 'encouragement' | 'hint' | 'celebration' | 'comfort' | 'guidance';
  timestamp: number;
}

// ===== Daily Challenge =====
export interface DailyChallengeData {
  id: string;
  date: string;
  tables: number[];
  questions: Question[];
  reward: number;
  completed: boolean;
  score: number;
}

// ===== Adaptive Engine =====
export interface AdaptiveState {
  weakTables: number[];
  strongTables: number[];
  currentDifficulty: 'easy' | 'medium' | 'hard';
  questionsToRepeat: Question[];
  consecutiveCorrect: number;
  consecutiveWrong: number;
}

// ===== API Response =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
