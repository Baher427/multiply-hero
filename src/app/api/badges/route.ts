import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');
    
    if (!childId) {
      return NextResponse.json({ success: false, error: 'childId is required' }, { status: 400 });
    }

    const badges = await db.badge.findMany({
      where: { childId },
      orderBy: { earnedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: badges });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch badges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { childId, badgeType } = body;

    if (!childId || !badgeType) {
      return NextResponse.json({ success: false, error: 'childId and badgeType are required' }, { status: 400 });
    }

    // Check if already earned
    const existing = await db.badge.findUnique({
      where: { childId_badgeType: { childId, badgeType } },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing, alreadyEarned: true });
    }

    const badge = await db.badge.create({
      data: { childId, badgeType },
    });

    return NextResponse.json({ success: true, data: badge, alreadyEarned: false });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create badge' }, { status: 500 });
  }
}
