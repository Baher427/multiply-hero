import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
      const accuracy = correctCount / (correctCount + wrongCount) * 100;
      let starsEarned = 0;
      if (accuracy >= 90) starsEarned = 3;
      else if (accuracy >= 70) starsEarned = 2;
      else if (accuracy >= 50) starsEarned = 1;

      await db.child.update({
        where: { id: childId },
        data: {
          points: child.points + (score || 0),
          stars: child.stars + starsEarned,
          coins: child.coins + Math.floor((score || 0) / 5),
          gems: child.gems + (starsEarned === 3 ? 2 : starsEarned === 2 ? 1 : 0),
          totalPlayTime: child.totalPlayTime + (duration || 0),
          lastActiveDate: new Date().toISOString().split('T')[0],
        },
      });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save game session' }, { status: 500 });
  }
}
