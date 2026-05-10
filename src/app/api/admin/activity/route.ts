import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch recent game sessions across all children, most recent first
    const sessions = await db.gameSession.findMany({
      orderBy: { completedAt: 'desc' },
      take: 30,
      include: {
        child: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarId: true,
          },
        },
      },
    });

    const activity = sessions.map((s) => ({
      id: s.id,
      childId: s.childId,
      childName: s.child.name,
      childDisplayName: s.child.displayName,
      childAvatarId: s.child.avatarId,
      gameType: s.gameType,
      tableNumber: s.tableNumber,
      score: s.score,
      correctCount: s.correctCount,
      wrongCount: s.wrongCount,
      duration: s.duration,
      completedAt: s.completedAt,
    }));

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error('Admin activity API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch activity log' }, { status: 500 });
  }
}
