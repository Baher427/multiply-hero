'use client';

import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/game-store';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import MultipleChoiceGame from '@/components/games/MultipleChoiceGame';
import TrueFalseGame from '@/components/games/TrueFalseGame';
import MatchingGame from '@/components/games/MatchingGame';
import FillBlankGame from '@/components/games/FillBlankGame';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { calculateScore } from '@/lib/game-engine/scoring-engine';
import type { ScoringResult } from '@/lib/game-engine/scoring-engine';

export default function GamePlayPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild } = useAuthGuard();
  const { gameConfig, questions, endGame, selectedGameType } = useGameStore();
  const { goBack } = useSmartBack('/games');
  const noGameRedirectedRef = useRef(false);

  // If no game is active, redirect to game selector (use replace to not pollute history)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !gameConfig && questions.length === 0 && !noGameRedirectedRef.current) {
      noGameRedirectedRef.current = true;
      router.replace('/games');
    }
  }, [isLoading, isAuthenticated, gameConfig, questions.length, router]);

  const handleGameComplete = (result: any) => {
    const state = useGameStore.getState();
    const currentLevel = 1;
    const currentXP = 0;
    const currentMastery = 0;
    const streak = 0;

    const enrichedResult = endGame(currentLevel, currentXP, currentMastery, streak);

    // Save game result to session storage for the results page
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('lastGameResult', JSON.stringify(enrichedResult));
    }

    // Save to API
    if (selectedChild && gameConfig) {
      fetch('/api/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChild.id,
          gameType: gameConfig.gameType,
          tableNumber: gameConfig.tableNumber === 'mixed' ? 0 : gameConfig.tableNumber,
          score: enrichedResult.score,
          correctCount: enrichedResult.correctCount,
          wrongCount: enrichedResult.wrongCount,
          duration: enrichedResult.duration,
          bestCombo: enrichedResult.bestCombo,
          avgResponseTime: enrichedResult.avgResponseTime,
          responseTimes: enrichedResult.responseTimes,
          totalPoints: enrichedResult.pointsEarned,
          xpEarned: enrichedResult.scoringResult?.xpEarned,
          coinsEarned: enrichedResult.coinsEarned,
          gemsEarned: enrichedResult.gemsEarned,
          starsEarned: enrichedResult.starsEarned,
          masteryChange: enrichedResult.scoringResult?.masteryChange,
          newLevel: enrichedResult.scoringResult?.newLevel,
          leveledUp: enrichedResult.scoringResult?.leveledUp,
          performanceRating: enrichedResult.scoringResult?.performanceRating,
          basePoints: enrichedResult.scoringResult?.basePoints,
          comboBonus: enrichedResult.scoringResult?.comboBonus,
          speedBonus: enrichedResult.scoringResult?.speedBonus,
          accuracyBonus: enrichedResult.scoringResult?.accuracyBonus,
          difficultyMultiplier: enrichedResult.scoringResult?.difficultyMultiplier,
        }),
      }).catch(() => {});

      // Update progress
      const tables = gameConfig.tableNumber === 'mixed' ? [1,2,3,4,5,6,7,8,9] : [gameConfig.tableNumber];
      for (const t of tables) {
        fetch('/api/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childId: selectedChild.id,
            tableNumber: t,
            correct: Math.round(enrichedResult.correctCount / tables.length),
            wrong: Math.round(enrichedResult.wrongCount / tables.length),
            speed: enrichedResult.duration > 0 ? (enrichedResult.duration * 1000) / (enrichedResult.correctCount + enrichedResult.wrongCount) : 0,
          }),
        }).catch(() => {});
      }
    }

    router.push('/games/results');
  };

  if (isLoading || !isAuthenticated || !gameConfig || questions.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const handleBack = () => {
    // Going back from game play should use replace so the play page
    // is removed from history (user can't accidentally return to a finished game)
    router.replace('/games');
  };

  switch (gameConfig.gameType) {
    case 'multiple-choice':
      return <MultipleChoiceGame questions={questions} onComplete={handleGameComplete} onBack={handleBack} />;
    case 'true-false':
      return <TrueFalseGame questions={questions} onComplete={handleGameComplete} onBack={handleBack} />;
    case 'matching':
      return <MatchingGame questions={questions} onComplete={handleGameComplete} onBack={handleBack} />;
    case 'fill-blank':
      return <FillBlankGame questions={questions} onComplete={handleGameComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
