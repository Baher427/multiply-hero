import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  try {
    const { childId } = await params;
    const child = await db.child.findUnique({
      where: { id: childId },
      include: {
        tableProgress: { orderBy: { tableNumber: 'asc' } },
        badges: { orderBy: { earnedAt: 'desc' } },
        gameSessions: { orderBy: { completedAt: 'desc' }, take: 30 },
        unlockedAvatars: true,
        storyProgress: true,
      },
    });

    if (!child) {
      return NextResponse.json({ success: false, error: 'Child not found' }, { status: 404 });
    }

    // Calculate weekly data (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekSessions = child.gameSessions.filter(
      s => new Date(s.completedAt) >= weekAgo
    );

    // Daily activity for the past 7 days
    const dailyActivity = [];
    for (let d = 6; d >= 0; d--) {
      const dayStart = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const daySessions = weekSessions.filter(s => {
        const date = new Date(s.completedAt);
        return date >= dayStart && date < dayEnd;
      });

      const totalQuestions = daySessions.reduce((s, sess) => s + sess.correctCount + sess.wrongCount, 0);
      const correctAnswers = daySessions.reduce((s, sess) => s + sess.correctCount, 0);
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      dailyActivity.push({
        date: dayStart.toISOString().split('T')[0],
        dayName: getArabicDayName(dayStart),
        sessionCount: daySessions.length,
        totalQuestions,
        correctAnswers,
        accuracy,
        totalDuration: daySessions.reduce((s, sess) => s + sess.duration, 0),
      });
    }

    // Weekly totals
    const weekTotalQuestions = weekSessions.reduce((s, sess) => s + sess.correctCount + sess.wrongCount, 0);
    const weekCorrectAnswers = weekSessions.reduce((s, sess) => s + sess.correctCount, 0);
    const weekAccuracy = weekTotalQuestions > 0
      ? Math.round((weekCorrectAnswers / weekTotalQuestions) * 100)
      : 0;

    // Overall mastery
    const overallMastery = child.tableProgress.length > 0
      ? Math.round(child.tableProgress.reduce((s, p) => s + p.masteryLevel, 0) / child.tableProgress.length)
      : 0;

    // Recommendations
    const recommendations: string[] = [];
    const weakTables = child.tableProgress.filter(p => p.masteryLevel < 40).sort((a, b) => a.masteryLevel - b.masteryLevel);
    const strongTables = child.tableProgress.filter(p => p.masteryLevel >= 80).sort((a, b) => b.masteryLevel - a.masteryLevel);

    if (weakTables.length > 0) {
      recommendations.push(`يجب على طفلك التمرن أكثر على جدول ${weakTables[0].tableNumber} 💪`);
    }
    if (strongTables.length > 0) {
      recommendations.push(`تحسّن رائع في جدول ${strongTables[0].tableNumber}! 🎉`);
    }
    if (child.streak >= 7) {
      recommendations.push(`سلسلة رائعة من ${child.streak} أيام متتالية! استمر! 🔥`);
    }
    if (weakTables.length > 2) {
      recommendations.push(`يحتاج طفلك للتركيز على الجداول الصعبة (${weakTables.map(t => t.tableNumber).join('، ')}) 📚`);
    }
    if (strongTables.length >= 7) {
      recommendations.push(`طفلك على وشك إتقان جميع الجداول! 🌟`);
    }

    return NextResponse.json({
      success: true,
      data: {
        child,
        dailyActivity,
        weekTotalQuestions,
        weekCorrectAnswers,
        weekAccuracy,
        overallMastery,
        recommendations,
        weekSessionCount: weekSessions.length,
      },
    });
  } catch (error) {
    console.error('Child detail API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch child data' }, { status: 500 });
  }
}

function getArabicDayName(date: Date): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[date.getDay()];
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  try {
    const { childId } = await params;
    const body = await req.json();

    const allowedFields = ['name', 'displayName', 'age', 'avatarId', 'favoriteColor', 'points', 'level', 'stars', 'gems', 'coins', 'streak'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const updated = await db.child.update({
      where: { id: childId },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update child error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update child' }, { status: 500 });
  }
}
