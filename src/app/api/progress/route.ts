import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    return NextResponse.json({ success: true, data: progress });
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
    
    // Calculate mastery level
    const accuracy = newTotal > 0 ? newCorrect / newTotal : 0;
    const speedFactor = speed ? Math.max(0, 1 - (speed / 10000)) : 0.5;
    const masteryLevel = Math.min(1, accuracy * 0.8 + speedFactor * 0.2);
    
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
