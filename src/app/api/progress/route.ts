import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Normalize masteryLevel to 0-1 range
// Seed data may use 0-100 scale while game API saves in 0-1 scale
function normalizeMastery(masteryLevel: number): number {
  if (masteryLevel > 1) return masteryLevel / 100;
  return masteryLevel;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');
    
    if (!childId) {
      return NextResponse.json({ success: false, error: 'childId is required' }, { status: 400 });
    }

    const progress = await db.tableProgress.findMany({
      where: { childId },
      orderBy: { tableNumber: 'asc' },
    });

    // Normalize masteryLevel to always be in 0-1 range
    const normalized = progress.map(p => ({
      ...p,
      masteryLevel: normalizeMastery(p.masteryLevel),
    }));

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { childId, tableNumber, correct, wrong, speed } = body;

    if (!childId || tableNumber === undefined) {
      return NextResponse.json({ success: false, error: 'childId and tableNumber are required' }, { status: 400 });
    }

    const existing = await db.tableProgress.findUnique({
      where: { childId_tableNumber: { childId, tableNumber } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Progress record not found' }, { status: 404 });
    }

    const newCorrect = existing.correctAnswers + (correct || 0);
    const newWrong = existing.wrongAnswers + (wrong || 0);
    const newTotal = existing.totalAttempts + (correct || 0) + (wrong || 0);
    
    // Calculate mastery level as correctAnswers / totalAttempts (0-1 range)
    const masteryLevel = newTotal > 0 ? newCorrect / newTotal : 0;
    
    // Calculate average speed
    const newAvgSpeed = speed 
      ? (existing.avgSpeed * existing.totalAttempts + speed) / newTotal
      : existing.avgSpeed;

    const updated = await db.tableProgress.update({
      where: { childId_tableNumber: { childId, tableNumber } },
      data: {
        correctAnswers: newCorrect,
        wrongAnswers: newWrong,
        totalAttempts: newTotal,
        masteryLevel,
        avgSpeed: newAvgSpeed,
        lastPracticed: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update progress' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ success: false, error: 'childId is required' }, { status: 400 });
    }

    // Reset all progress for the child (set mastery to 0, clear counts)
    const progress = await db.tableProgress.findMany({ where: { childId } });

    for (const p of progress) {
      await db.tableProgress.update({
        where: { id: p.id },
        data: {
          correctAnswers: 0,
          wrongAnswers: 0,
          totalAttempts: 0,
          masteryLevel: 0,
          avgSpeed: 0,
          lastPracticed: new Date(),
        },
      });
    }

    // Also reset child points, level, stars, coins, gems, streak
    await db.child.update({
      where: { id: childId },
      data: {
        points: 0,
        level: 1,
        stars: 0,
        coins: 0,
        gems: 0,
        streak: 0,
        bestCombo: 0,
        comboCount: 0,
        totalPlayTime: 0,
      },
    });

    return NextResponse.json({ success: true, data: { resetCount: progress.length } });
  } catch (error) {
    console.error('Reset progress error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset progress' }, { status: 500 });
  }
}
