import { NextRequest, NextResponse } from 'next/server';
import { registerUser, loginUser, verifySession, logoutUser, cleanupSessions } from '@/lib/auth';

// POST /api/auth/register - Register a new account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'register') {
      const { username, password, role, displayName, email, age, avatarId, favoriteColor } = body;

      // Validate required fields
      if (!username || !password) {
        return NextResponse.json(
          { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' },
          { status: 400 }
        );
      }

      // Validate role
      const validRole = ['child', 'parent', 'admin'].includes(role) ? role : 'child';

      const result = await registerUser({
        username,
        password,
        role: validRole,
        displayName,
        email,
        age,
        avatarId,
        favoriteColor,
      });

      if ('error' in result) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
      });
    }

    if (action === 'login') {
      const { username, password } = body;

      if (!username || !password) {
        return NextResponse.json(
          { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' },
          { status: 400 }
        );
      }

      const result = await loginUser(username, password);

      if ('error' in result) {
        return NextResponse.json({ success: false, error: result.error }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في المصادقة' }, { status: 500 });
  }
}

// GET /api/auth/me - Get current user from token
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const user = await verifySession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'جلسة غير صالحة' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    console.error('Auth GET error:', error);
    return NextResponse.json({ success: false, error: 'خطأ في التحقق' }, { status: 500 });
  }
}

// DELETE /api/auth/logout - Logout
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('auth-token')?.value;

    if (token) {
      await logoutUser(token);
    }

    // Also clean up expired sessions periodically
    await cleanupSessions();

    const response = NextResponse.json({ success: true, message: 'تم تسجيل الخروج' });
    response.cookies.delete('auth-token');
    return response;
  } catch (error) {
    console.error('Auth DELETE error:', error);
    return NextResponse.json({ success: false, error: 'خطأ في تسجيل الخروج' }, { status: 500 });
  }
}
