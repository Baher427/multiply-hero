import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Batch save multiple operations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { operations } = body;

    if (!Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json({ success: false, error: 'Operations array is required' }, { status: 400 });
    }

    const results = [];

    for (const op of operations) {
      try {
        switch (op.type) {
          case 'game-session': {
            const session = await db.gameSession.create({
              data: {
                childId: op.childId,
                gameType: op.gameType || 'multiple-choice',
                tableNumber: op.tableNumber || 0,
                score: op.score || 0,
                correctCount: op.correctCount || 0,
                wrongCount: op.wrongCount || 0,
                duration: op.duration || 0,
              },
            });
            results.push({ type: op.type, success: true, id: session.id });
            break;
          }
          case 'progress': {
            if (op.childId && op.tableNumber) {
              const existing = await db.tableProgress.findUnique({
                where: { childId_tableNumber: { childId: op.childId, tableNumber: op.tableNumber } },
              });
              if (existing) {
                const updated = await db.tableProgress.update({
                  where: { id: existing.id },
                  data: {
                    correctAnswers: existing.correctAnswers + (op.correct || 0),
                    wrongAnswers: existing.wrongAnswers + (op.wrong || 0),
                    totalAttempts: existing.totalAttempts + (op.correct || 0) + (op.wrong || 0),
                    lastPracticed: new Date(),
                  },
                });
                results.push({ type: op.type, success: true, id: updated.id });
              } else {
                const created = await db.tableProgress.create({
                  data: {
                    childId: op.childId,
                    tableNumber: op.tableNumber,
                    correctAnswers: op.correct || 0,
                    wrongAnswers: op.wrong || 0,
                    totalAttempts: (op.correct || 0) + (op.wrong || 0),
                  },
                });
                results.push({ type: op.type, success: true, id: created.id });
              }
            }
            break;
          }
          case 'badge': {
            if (op.childId && op.badgeType) {
              try {
                const badge = await db.badge.create({
                  data: { childId: op.childId, badgeType: op.badgeType },
                });
                results.push({ type: op.type, success: true, id: badge.id });
              } catch {
                // Badge might already exist (unique constraint)
                results.push({ type: op.type, success: true, note: 'already_exists' });
              }
            }
            break;
          }
          default:
            results.push({ type: op.type, success: false, error: 'Unknown operation type' });
        }
      } catch (opError) {
        results.push({ type: op.type, success: false, error: 'Operation failed' });
      }
    }

    const allSuccess = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccess,
      data: {
        totalOperations: operations.length,
        successfulOperations: results.filter(r => r.success).length,
        results,
        syncTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync data' }, { status: 500 });
  }
}

// GET: Get sync status (last save time, pending changes)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');

    const totalSessions = childId
      ? await db.gameSession.count({ where: { childId } })
      : await db.gameSession.count();

    const totalProgress = childId
      ? await db.tableProgress.count({ where: { childId } })
      : await db.tableProgress.count();

    const lastSession = childId
      ? await db.gameSession.findFirst({ where: { childId }, orderBy: { completedAt: 'desc' } })
      : await db.gameSession.findFirst({ orderBy: { completedAt: 'desc' } });

    return NextResponse.json({
      success: true,
      data: {
        lastSaveTime: lastSession?.completedAt || null,
        totalSessions,
        totalProgress,
        syncTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get sync status' }, { status: 500 });
  }
}
