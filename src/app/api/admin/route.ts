import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const children = await db.child.findMany({
      include: {
        tableProgress: true,
        badges: true,
        gameSessions: { orderBy: { completedAt: 'desc' }, take: 10 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSessions = await db.gameSession.count();
    const totalBadges = await db.badge.count();

    // Calculate average mastery across all children
    // Normalize masteryLevel to 0-1 range (seed data may use 0-100 scale)
    const normalizeMastery = (m: number) => m > 1 ? m / 100 : m;
    const allProgress = await db.tableProgress.findMany();
    const avgMastery = allProgress.length > 0
      ? Math.round(allProgress.reduce((s, p) => s + normalizeMastery(p.masteryLevel), 0) / allProgress.length * 100)
      : 0;

    // Find table stats (average mastery per table 1-9)
    const tableStats = [];
    for (let t = 1; t <= 9; t++) {
      const tableProg = allProgress.filter(p => p.tableNumber === t);
      const avgTableMastery = tableProg.length > 0
        ? Math.round(tableProg.reduce((s, p) => s + normalizeMastery(p.masteryLevel), 0) / tableProg.length * 100)
        : 0;
      const totalWrong = tableProg.reduce((s, p) => s + p.wrongAnswers, 0);
      const totalCorrect = tableProg.reduce((s, p) => s + p.correctAnswers, 0);
      tableStats.push({
        table: t,
        avgMastery: avgTableMastery,
        totalWrong,
        totalCorrect,
      });
    }

    // Sort by mastery to identify most difficult tables
    const sortedTables = [...tableStats].sort((a, b) => a.avgMastery - b.avgMastery);

    return NextResponse.json({
      success: true,
      data: {
        children,
        totalSessions,
        totalBadges,
        tableStats,
        sortedTables,
        totalChildren: children.length,
        avgMastery,
      },
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ success: false, error: 'childId is required' }, { status: 400 });
    }

    await db.child.delete({ where: { id: childId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete child error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete child' }, { status: 500 });
  }
}
