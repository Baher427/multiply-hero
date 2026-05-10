import { TableProgressData, AdaptiveState, Question, GameConfig } from '@/types';

export function calculateAdaptiveState(progress: TableProgressData[]): AdaptiveState {
  const weakTables: number[] = [];
  const strongTables: number[] = [];
  
  for (let t = 1; t <= 9; t++) {
    const tableProg = progress.find(p => p.tableNumber === t);
    if (!tableProg || tableProg.masteryLevel < 0.5) {
      weakTables.push(t);
    } else if (tableProg.masteryLevel >= 0.8) {
      strongTables.push(t);
    } else {
      weakTables.push(t);
    }
  }

  const avgMastery = progress.length > 0
    ? progress.reduce((sum, p) => sum + p.masteryLevel, 0) / progress.length
    : 0;

  let currentDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (avgMastery < 0.3) currentDifficulty = 'easy';
  else if (avgMastery > 0.7) currentDifficulty = 'hard';

  return {
    weakTables,
    strongTables,
    currentDifficulty,
    questionsToRepeat: [],
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
  };
}

export function getRecommendedTable(progress: TableProgressData[]): number {
  const adaptive = calculateAdaptiveState(progress);
  if (adaptive.weakTables.length > 0) {
    // Pick the weakest table
    const weakProgress = adaptive.weakTables.map(t => {
      const p = progress.find(pr => pr.tableNumber === t);
      return { table: t, mastery: p?.masteryLevel ?? 0 };
    });
    weakProgress.sort((a, b) => a.mastery - b.mastery);
    return weakProgress[0].table;
  }
  // If all are strong, pick a random one for review
  return Math.floor(Math.random() * 9) + 1;
}

export function adjustDifficulty(
  currentDifficulty: 'easy' | 'medium' | 'hard',
  consecutiveCorrect: number,
  consecutiveWrong: number
): 'easy' | 'medium' | 'hard' {
  if (consecutiveCorrect >= 5) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
  }
  if (consecutiveWrong >= 3) {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
  }
  return currentDifficulty;
}

export function calculateMasteryLevel(
  correctAnswers: number,
  totalAttempts: number,
  avgSpeed: number
): number {
  if (totalAttempts === 0) return 0;
  
  const accuracy = correctAnswers / totalAttempts;
  const speedFactor = avgSpeed > 0 ? Math.max(0, 1 - (avgSpeed / 10000)) : 0.5;
  
  return Math.min(1, accuracy * 0.8 + speedFactor * 0.2);
}

export function getAdaptiveConfig(
  progress: TableProgressData[],
  gameType: string
): GameConfig {
  const adaptive = calculateAdaptiveState(progress);
  const recommendedTable = getRecommendedTable(progress);
  
  return {
    gameType: gameType as any,
    tableNumber: recommendedTable,
    questionCount: adaptive.currentDifficulty === 'easy' ? 8 : adaptive.currentDifficulty === 'medium' ? 10 : 12,
    difficulty: adaptive.currentDifficulty,
  };
}
