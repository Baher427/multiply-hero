import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple token store (in-memory for development)
const activeSessions = new Map<string, { childId: string; createdAt: number; expiresAt: number }>();

// POST: Validate child credentials, return session token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { childId, pin } = body;

    if (!childId) {
      return NextResponse.json({ success: false, error: 'childId is required' }, { status: 400 });
    }

    const child = await db.child.findUnique({ where: { id: childId } });

    if (!child) {
      return NextResponse.json({ success: false, error: 'الطفل غير موجود' }, { status: 404 });
    }

    // If child has a PIN set, verify it
    if (child.pin && child.pin.length > 0) {
      if (!pin || pin !== child.pin) {
        return NextResponse.json({ success: false, error: 'رمز PIN غير صحيح' }, { status: 401 });
      }
    }

    // Generate session token
    const token = `mh_${childId.slice(0, 8)}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Store session
    activeSessions.set(token, { childId, createdAt: Date.now(), expiresAt });

    // Clean up expired sessions
    for (const [key, session] of activeSessions.entries()) {
      if (Date.now() > session.expiresAt) {
        activeSessions.delete(key);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        token,
        childId,
        expiresAt,
        childName: child.displayName,
      },
    });
  } catch (error) {
    console.error('Auth POST error:', error);
    return NextResponse.json({ success: false, error: 'فشل في المصادقة' }, { status: 500 });
  }
}

// GET: Check session validity
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const session = activeSessions.get(token);
    if (!session) {
      return NextResponse.json({ success: false, valid: false, error: 'جلسة غير صالحة' }, { status: 401 });
    }

    if (Date.now() > session.expiresAt) {
      activeSessions.delete(token);
      return NextResponse.json({ success: false, valid: false, error: 'انتهت صلاحية الجلسة' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        childId: session.childId,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Auth GET error:', error);
    return NextResponse.json({ success: false, error: 'فشل في التحقق' }, { status: 500 });
  }
}

// DELETE: Invalidate session (logout)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    activeSessions.delete(token);
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج' });
  } catch (error) {
    console.error('Auth DELETE error:', error);
    return NextResponse.json({ success: false, error: 'فشل في تسجيل الخروج' }, { status: 500 });
  }
}
