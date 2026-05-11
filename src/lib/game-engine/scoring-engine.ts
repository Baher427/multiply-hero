// ===== Intelligent Scoring / Leveling / Progress Engine =====
// Comprehensive scoring system with 50 levels, XP, mastery, performance ratings,
// adaptive difficulty, and player titles.

// ─── Scoring Result ───────────────────────────────────────────────────────────

export interface ScoringResult {
  basePoints: number;           // Points from correct answers
  comboBonus: number;           // Bonus from combos
  speedBonus: number;           // Bonus for fast answers
  accuracyBonus: number;        // Bonus for high accuracy
  difficultyMultiplier: number; // 1x easy, 1.5x medium, 2x hard
  totalPoints: number;          // Total points earned
  xpEarned: number;             // XP for leveling
  coinsEarned: number;          // Coins earned
  gemsEarned: number;           // Gems earned (rare)
  starsEarned: number;          // Stars (1-3)
  masteryChange: number;        // How much mastery changed (-0.05 to +0.15)
  newLevel: number;              // New level after XP
  leveledUp: boolean;            // Did they level up?
  performanceRating: PerformanceRating;
}

export interface PerformanceRating {
  rating: string;       // SSS, SS, S, A, B, C, D
  description: string;  // Arabic description
  emoji: string;        // Emoji representation
}

// ─── Level System ─────────────────────────────────────────────────────────────
// 50 levels with exponential XP requirements
// Each level requires: 100 * (level^1.5) XP cumulative

const MAX_LEVEL = 50;

/**
 * Get the cumulative XP required to reach a given level.
 * Level 1 = 0 XP, Level 2 = 100 * (2^1.5) ≈ 283, etc.
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate what level a player should be at given their total XP.
 */
export function getLevelFromXP(xp: number): number {
  if (xp <= 0) return 1;
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (xp >= getXPForLevel(level)) return level;
  }
  return 1;
}

/**
 * Get XP progress details for the current level.
 */
export function getXPProgress(xp: number): { current: number; required: number; percentage: number } {
  const currentLevel = getLevelFromXP(xp);
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const xpInLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const percentage = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;
  return { current: xpInLevel, required: xpNeeded, percentage };
}

// ─── Title System ─────────────────────────────────────────────────────────────

interface PlayerTitle {
  title: string;
  color: string;
  icon: string;
}

const PLAYER_TITLES: Array<{ minLevel: number; maxLevel: number; title: string; color: string; icon: string }> = [
  { minLevel: 1,  maxLevel: 3,  title: 'مبتدئ',        color: '#9ca3af', icon: '🌱' },  // Beginner
  { minLevel: 4,  maxLevel: 7,  title: 'متعلم',        color: '#3b82f6', icon: '📖' },  // Learner
  { minLevel: 8,  maxLevel: 12, title: 'محترف',        color: '#8b5cf6', icon: '⚡' },  // Skilled
  { minLevel: 13, maxLevel: 18, title: 'خبير',         color: '#f59e0b', icon: '🎯' },  // Expert
  { minLevel: 19, maxLevel: 25, title: 'بطل',          color: '#ef4444', icon: '🏆' },  // Champion
  { minLevel: 26, maxLevel: 35, title: 'أسطورة',       color: '#ec4899', icon: '💫' },  // Legend
  { minLevel: 36, maxLevel: 50, title: 'بطل الأساطير', color: '#f97316', icon: '👑' },  // Mythic Hero
];

export function getPlayerTitle(level: number): PlayerTitle {
  const clampedLevel = Math.max(1, Math.min(level, MAX_LEVEL));
  const titleDef = PLAYER_TITLES.find(t => clampedLevel >= t.minLevel && clampedLevel <= t.maxLevel);
  return titleDef
    ? { title: titleDef.title, color: titleDef.color, icon: titleDef.icon }
    : { title: 'مبتدئ', color: '#9ca3af', icon: '🌱' };
}

// ─── Mastery Calculation ──────────────────────────────────────────────────────

/**
 * Calculate mastery change based on performance.
 * Returns a value between -0.05 and +0.15.
 * - Correct answers increase mastery (more so if fast)
 * - Wrong answers decrease mastery
 * - Current mastery affects the rate (diminishing returns at high mastery)
 */
export function calculateMasteryChange(
  correct: number,
  wrong: number,
  currentMastery: number,
  avgSpeed: number // in ms
): number {
  const total = correct + wrong;
  if (total === 0) return 0;

  const accuracy = correct / total;

  // Base change from accuracy
  let change = accuracy * 0.15 - (1 - accuracy) * 0.05;

  // Speed bonus: faster answers give more mastery
  const speedBonus = avgSpeed < 2000 ? 0.03 : avgSpeed < 4000 ? 0.01 : 0;

  // Diminishing returns at high mastery
  const diminishingFactor = Math.max(0.2, 1 - currentMastery * 0.6);

  change = (change + speedBonus) * diminishingFactor;

  // Clamp between -0.05 and +0.15
  return Math.max(-0.05, Math.min(0.15, change));
}

// ─── Adaptive Difficulty Recommendation ────────────────────────────────────────

export function getRecommendedDifficulty(
  mastery: number,
  avgSpeed: number,
  combo: number
): 'easy' | 'medium' | 'hard' {
  // High mastery + fast + good combo → hard
  if (mastery >= 0.8 && avgSpeed < 3000 && combo >= 5) return 'hard';
  // Medium mastery or moderate speed → medium
  if (mastery >= 0.5 || (avgSpeed < 5000 && combo >= 3)) return 'medium';
  // Low mastery or slow → easy
  return 'easy';
}

// ─── Performance Rating ───────────────────────────────────────────────────────

export function getPerformanceRating(accuracy: number, avgSpeed: number): PerformanceRating {
  // accuracy is 0-100 percentage
  const speedSec = avgSpeed / 1000;

  if (accuracy > 95 && speedSec < 2) {
    return { rating: 'SSS', description: 'أداء أسطوري لا يُصدق!', emoji: '🌟' };
  }
  if (accuracy > 90 && speedSec < 3) {
    return { rating: 'SS', description: 'أداء استثنائي مذهل!', emoji: '💫' };
  }
  if (accuracy > 85) {
    return { rating: 'S', description: 'أداء ممتاز رائع!', emoji: '⭐' };
  }
  if (accuracy > 75) {
    return { rating: 'A', description: 'أداء جيد جداً!', emoji: '🎯' };
  }
  if (accuracy > 60) {
    return { rating: 'B', description: 'أداء جيد، استمر!', emoji: '👍' };
  }
  if (accuracy > 40) {
    return { rating: 'C', description: 'تحتاج مزيداً من التمرين', emoji: '💪' };
  }
  return { rating: 'D', description: 'لا تستسلم، حاول مرة أخرى!', emoji: '🔄' };
}

// ─── Main Scoring Function ────────────────────────────────────────────────────

export function calculateScore(params: {
  correctCount: number;
  wrongCount: number;
  combo: number;
  bestCombo: number;
  avgResponseTime: number; // in ms
  difficulty: 'easy' | 'medium' | 'hard';
  tableNumber: number | 'mixed';
  currentLevel: number;
  currentXP: number;
  currentMastery: number; // 0-1 for this table
  streak: number; // daily streak
}): ScoringResult {
  const {
    correctCount,
    wrongCount,
    combo,
    bestCombo,
    avgResponseTime,
    difficulty,
    tableNumber,
    currentLevel,
    currentXP,
    currentMastery,
    streak,
  } = params;

  const totalQuestions = correctCount + wrongCount;
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  // 1. Base points: 10 per correct answer
  const basePoints = correctCount * 10;

  // 2. Combo bonus: combo * 2 per correct answer (capped at 20 bonus per answer)
  const comboBonus = correctCount * Math.min(combo, 10) * 2;

  // 3. Speed bonus: faster answers earn more
  let speedBonus = 0;
  if (totalQuestions > 0) {
    if (avgResponseTime < 2000) speedBonus = correctCount * 5;       // Very fast
    else if (avgResponseTime < 3000) speedBonus = correctCount * 3;  // Fast
    else if (avgResponseTime < 5000) speedBonus = correctCount * 1;  // Normal
    // Slow = no speed bonus
  }

  // 4. Accuracy bonus: bonus for high accuracy
  let accuracyBonus = 0;
  if (totalQuestions > 0) {
    if (accuracy >= 100) accuracyBonus = 30;       // Perfect
    else if (accuracy >= 90) accuracyBonus = 20;   // Excellent
    else if (accuracy >= 80) accuracyBonus = 10;   // Great
    else if (accuracy >= 70) accuracyBonus = 5;    // Good
  }

  // 5. Difficulty multiplier
  const difficultyMultiplier =
    difficulty === 'easy' ? 1 :
    difficulty === 'medium' ? 1.5 :
    2; // hard

  // 6. Mixed table bonus
  const mixedBonus = tableNumber === 'mixed' ? 1.2 : 1;

  // 7. Streak bonus (daily streak)
  const streakMultiplier = 1 + Math.min(streak, 30) * 0.01; // 1% per streak day, max 30%

  // Calculate total points
  const rawPoints = basePoints + comboBonus + speedBonus + accuracyBonus;
  const totalPoints = Math.floor(
    rawPoints * difficultyMultiplier * mixedBonus * streakMultiplier
  );

  // 8. XP calculation
  let xpEarned = Math.floor(totalPoints * 0.8); // 80% of points become XP
  // Perfect game bonus
  if (accuracy === 100 && correctCount > 0) xpEarned += 50;
  // Daily challenge bonus (applied externally via tableNumber === 'mixed' + difficulty)
  if (difficulty === 'hard' && accuracy >= 80) xpEarned += 30;

  // 9. Coins: roughly 1/5 of total points
  const coinsEarned = Math.floor(totalPoints / 5);

  // 10. Gems: rare, only for exceptional performance
  let gemsEarned = 0;
  if (accuracy === 100 && correctCount > 0) gemsEarned = 3;
  else if (accuracy >= 90) gemsEarned = 2;
  else if (accuracy >= 80) gemsEarned = 1;

  // Extra gem for very fast perfect games
  if (accuracy === 100 && avgResponseTime < 3000 && correctCount >= 5) gemsEarned += 1;

  // 11. Stars (1-3)
  let starsEarned = 0;
  if (accuracy >= 90) starsEarned = 3;
  else if (accuracy >= 70) starsEarned = 2;
  else if (accuracy >= 50) starsEarned = 1;

  // 12. Mastery change
  const masteryChange = calculateMasteryChange(correctCount, wrongCount, currentMastery, avgResponseTime);

  // 13. Level calculation
  const newTotalXP = currentXP + xpEarned;
  const newLevel = getLevelFromXP(newTotalXP);
  const leveledUp = newLevel > currentLevel;

  // 14. Performance rating
  const performanceRating = getPerformanceRating(accuracy, avgResponseTime);

  return {
    basePoints,
    comboBonus,
    speedBonus,
    accuracyBonus,
    difficultyMultiplier,
    totalPoints,
    xpEarned,
    coinsEarned,
    gemsEarned,
    starsEarned,
    masteryChange,
    newLevel,
    leveledUp,
    performanceRating,
  };
}

// ─── Utility: Get accuracy percentage from counts ─────────────────────────────

export function getAccuracyPercentage(correct: number, wrong: number): number {
  const total = correct + wrong;
  return total > 0 ? (correct / total) * 100 : 0;
}

// ─── Utility: Get average response time from array ────────────────────────────

export function calculateAvgResponseTime(responseTimes: number[]): number {
  if (responseTimes.length === 0) return 0;
  const sum = responseTimes.reduce((a, b) => a + b, 0);
  return Math.floor(sum / responseTimes.length);
}

// ─── Utility: Get rating color for display ────────────────────────────────────

export function getRatingColor(rating: string): string {
  switch (rating) {
    case 'SSS': return '#f59e0b'; // amber-500
    case 'SS': return '#f97316';  // orange-500
    case 'S': return '#ef4444';   // red-500
    case 'A': return '#8b5cf6';   // violet-500
    case 'B': return '#3b82f6';   // blue-500
    case 'C': return '#6b7280';   // gray-500
    case 'D': return '#9ca3af';   // gray-400
    default: return '#6b7280';
  }
}
