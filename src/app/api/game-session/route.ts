import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Level thresholds: level = points / threshold
const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000];

function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { childId, gameType, tableNumber, score, correctCount, wrongCount, duration, questions } = body;

    if (!childId || !gameType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const session = await db.gameSession.create({
      data: {
        childId,
        gameType,
        tableNumber: tableNumber || 0,
        score: score || 0,
        correctCount: correctCount || 0,
        wrongCount: wrongCount || 0,
        duration: duration || 0,
        questions: JSON.stringify(questions || []),
      },
    });

    // Update child's points and stats
    const child = await db.child.findUnique({ where: { id: childId } });
    if (child) {
      const accuracy = (correctCount + wrongCount) > 0 ? correctCount / (correctCount + wrongCount) * 100 : 0;
      let starsEarned = 0;
      if (accuracy >= 90) starsEarned = 3;
      else if (accuracy >= 70) starsEarned = 2;
      else if (accuracy >= 50) starsEarned = 1;

      const newPoints = child.points + (score || 0);
      const newLevel = calculateLevel(newPoints);

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

      // Update combo
      const newBestCombo = Math.max(child.bestCombo, correctCount > 0 && wrongCount === 0 ? correctCount : child.bestCombo);

      await db.child.update({
        where: { id: childId },
        data: {
          points: newPoints,
          level: newLevel,
          stars: child.stars + starsEarned,
          coins: child.coins + Math.floor((score || 0) / 5),
          gems: child.gems + (starsEarned === 3 ? 2 : starsEarned === 2 ? 1 : 0),
          totalPlayTime: child.totalPlayTime + (duration || 0),
          lastActiveDate: today,
          streak: newStreak,
          bestCombo: newBestCombo,
        },
      });

      return NextResponse.json({ 
        success: true, 
        data: session,
        meta: {
          newLevel,
          levelUp: newLevel > child.level,
          starsEarned,
          streakUpdated: newStreak !== child.streak,
        }
      });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save game session' }, { status: 500 });
  }
}
