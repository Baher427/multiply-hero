import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const children = await db.child.findMany({
      include: {
        tableProgress: true,
        badges: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: children });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch children' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, displayName, age, avatarId, favoriteColor } = body;

    if (!name || !displayName) {
      return NextResponse.json({ success: false, error: 'Name and display name are required' }, { status: 400 });
    }

    const child = await db.child.create({
      data: {
        name,
        displayName,
        age: age || 7,
        avatarId: avatarId || 'lion',
        favoriteColor: favoriteColor || 'emerald',
      },
    });

    // Initialize table progress for all tables
    for (let t = 1; t <= 9; t++) {
      await db.tableProgress.create({
        data: {
          childId: child.id,
          tableNumber: t,
        },
      });
    }

    // Unlock starter avatars
    const starterAvatars = ['lion', 'cat', 'bear', 'rabbit', 'dog', 'apple', 'banana', 'balloon', 'star-face', 'heart-face'];
    for (const aid of starterAvatars) {
      await db.unlockedAvatar.create({
        data: { childId: child.id, avatarId: aid },
      });
    }

    return NextResponse.json({ success: true, data: child });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create child' }, { status: 500 });
  }
}
