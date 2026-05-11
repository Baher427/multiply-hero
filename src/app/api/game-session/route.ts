import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getLevelFromXP, getXPForLevel, calculateMasteryChange, getPerformanceRating, getAccuracyPercentage } from '@/lib/game-engine/scoring-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!childId) {
      return NextResponse.json({ success: false, error: 'childId is required' }, { status: 400 });
    }

    const sessions = await db.gameSession.findMany({
      where: { childId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch game sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      childId, gameType, tableNumber, score, correctCount, wrongCount, duration,
      questions, bestCombo, avgResponseTime, responseTimes,
      // Scoring engine results
      totalPoints, xpEarned, coinsEarned, gemsEarned, starsEarned,
      masteryChange, newLevel, leveledUp, performanceRating,
      basePoints, comboBonus, speedBonus, accuracyBonus, difficultyMultiplier,
    } = body;

    if (!childId || !gameType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Save response times as JSON if provided
    const sessionData: Record<string, unknown> = {
      childId,
      gameType,
      tableNumber: tableNumber || 0,
      score: totalPoints || score || 0,
      correctCount: correctCount || 0,
      wrongCount: wrongCount || 0,
      duration: duration || 0,
      questions: JSON.stringify(questions || []),
    };

    const session = await db.gameSession.create({
      data: sessionData as Parameters<typeof db.gameSession.create>[0]['data'],
    });

    // Update child's points and stats using scoring engine
    const child = await db.child.findUnique({ where: { id: childId } });
    if (child) {
      const accuracy = getAccuracyPercentage(correctCount || 0, wrongCount || 0);
      const calculatedStars = starsEarned ?? (accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0);
      const calculatedPoints = totalPoints || score || 0;
      const calculatedCoins = coinsEarned ?? Math.floor(calculatedPoints / 5);
      const calculatedGems = gemsEarned ?? (calculatedStars === 3 ? 2 : calculatedStars === 2 ? 1 : 0);

      // Calculate XP using scoring engine
      const currentXP = (child as Record<string, unknown>).xp as number || 0;
      const calculatedXP = xpEarned ?? Math.floor(calculatedPoints * 0.8);
      const newTotalXP = currentXP + calculatedXP;
      const calculatedLevel = newLevel ?? getLevelFromXP(newTotalXP);

      // Update streak: if played today, keep streak; if not played yesterday, reset to 1
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newStreak = child.streak;
      if (child.lastActiveDate === today) {
        // Already played today, keep streak
      } else if (child.lastActiveDate === yesterday) {
        // Played yesterday, increment streak
        newStreak = child.streak + 1;
      } else {
        // Haven't played recently, reset streak to 1
        newStreak = 1;
      }

      // Update combo - use bestCombo from game result if provided
      const newBestCombo = bestCombo != null
        ? Math.max(child.bestCombo, bestCombo)
        : Math.max(child.bestCombo, (correctCount || 0) > 0 && (wrongCount || 0) === 0 ? (correctCount || 0) : child.bestCombo);

      // Calculate performance rating if not provided
      const rating = performanceRating || getPerformanceRating(accuracy, avgResponseTime || 0);

      await db.child.update({
        where: { id: childId },
        data: {
          points: child.points + calculatedPoints,
          level: calculatedLevel,
          stars: child.stars + calculatedStars,
          coins: child.coins + calculatedCoins,
          gems: child.gems + calculatedGems,
          totalPlayTime: child.totalPlayTime + (duration || 0),
          lastActiveDate: today,
          streak: newStreak,
          bestCombo: newBestCombo,
        },
      });

      // Update mastery for affected tables
      if (masteryChange !== undefined && masteryChange !== 0) {
        const tables = (tableNumber || 0) === 0
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
          : [tableNumber as number];

        for (const t of tables) {
          const existingProgress = await db.tableProgress.findUnique({
            where: { childId_tableNumber: { childId, tableNumber: t } },
          });

          if (existingProgress) {
            const currentMastery = existingProgress.masteryLevel;
            const newMastery = Math.max(0, Math.min(1, currentMastery + (masteryChange / tables.length)));
            await db.tableProgress.update({
              where: { id: existingProgress.id },
              data: {
                masteryLevel: newMastery,
                correctAnswers: existingProgress.correctAnswers + Math.round((correctCount || 0) / tables.length),
                wrongAnswers: existingProgress.wrongAnswers + Math.round((wrongCount || 0) / tables.length),
                totalAttempts: existingProgress.totalAttempts + Math.round(((correctCount || 0) + (wrongCount || 0)) / tables.length),
                avgSpeed: avgResponseTime || existingProgress.avgSpeed,
                lastPracticed: new Date().toISOString(),
              },
            });
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        data: session,
        meta: {
          newLevel: calculatedLevel,
          levelUp: leveledUp ?? (calculatedLevel > child.level),
          starsEarned: calculatedStars,
          streakUpdated: newStreak !== child.streak,
          xpEarned: calculatedXP,
          totalXP: newTotalXP,
          performanceRating: rating,
          coinsEarned: calculatedCoins,
          gemsEarned: calculatedGems,
          masteryChange: masteryChange || 0,
        }
      });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save game session' }, { status: 500 });
  }
}
