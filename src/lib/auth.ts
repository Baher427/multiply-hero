import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { db } from '@/lib/db';

// JWT Secret - in production, this should be a strong env variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'multiply-hero-super-secret-key-change-in-production-2024'
);

const SALT_ROUNDS = 12;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthUser {
  id: string;
  username: string;
  role: 'child' | 'parent' | 'admin';
  displayName?: string;
  email?: string;
  childId?: string; // For child users, the linked Child profile ID
}

export interface AuthTokenPayload {
  userId: string;
  username: string;
  role: string;
  childId?: string;
}

// Hash a password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify a password against a hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create a JWT token
export async function createToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      childId: payload.childId as string | undefined,
    };
  } catch {
    return null;
  }
}

// Register a new user
export async function registerUser(data: {
  username: string;
  password: string;
  role: 'child' | 'parent' | 'admin';
  displayName?: string;
  email?: string;
  age?: number;
  avatarId?: string;
  favoriteColor?: string;
}): Promise<{ user: AuthUser; token: string } | { error: string }> {
  try {
    // Check if username already exists
    const existing = await db.user.findUnique({ where: { username: data.username } });
    if (existing) {
      return { error: 'اسم المستخدم موجود بالفعل' };
    }

    // Check if email already exists (if provided)
    if (data.email) {
      const existingEmail = await db.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        return { error: 'البريد الإلكتروني مستخدم بالفعل' };
      }
    }

    // Validate password strength
    if (data.password.length < 6) {
      return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
    }

    if (data.username.length < 3) {
      return { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await db.user.create({
      data: {
        username: data.username,
        passwordHash,
        role: data.role,
        displayName: data.displayName || data.username,
        email: data.email,
      },
    });

    // Create role-specific profile
    let childId: string | undefined;

    if (data.role === 'child') {
      const child = await db.child.create({
        data: {
          name: data.displayName || data.username,
          displayName: data.displayName || data.username,
          age: data.age || 7,
          avatarId: data.avatarId || 'lion',
          favoriteColor: data.favoriteColor || 'emerald',
          userId: user.id,
        },
      });
      childId = child.id;
    } else if (data.role === 'parent') {
      await db.parent.create({
        data: {
          name: data.displayName || data.username,
          email: data.email || `${data.username}@multiplyhero.app`,
          userId: user.id,
        },
      });
    } else if (data.role === 'admin') {
      await db.admin.create({
        data: {
          email: data.email || `${data.username}@multiplyhero.admin`,
          passwordHash,
          userId: user.id,
        },
      });
    }

    // Create JWT token
    const tokenPayload: AuthTokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      childId,
    };
    const token = await createToken(tokenPayload);

    // Store session in database
    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + SESSION_DURATION),
      },
    });

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role as 'child' | 'parent' | 'admin',
        displayName: user.displayName || undefined,
        email: user.email || undefined,
        childId,
      },
      token,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'حدث خطأ أثناء إنشاء الحساب' };
  }
}

// Login a user
export async function loginUser(username: string, password: string): Promise<{ user: AuthUser; token: string } | { error: string }> {
  try {
    const user = await db.user.findUnique({ where: { username } });
    if (!user) {
      return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    if (!user.isActive) {
      return { error: 'هذا الحساب معطل' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    // Get child ID for child users
    let childId: string | undefined;
    if (user.role === 'child') {
      const child = await db.child.findFirst({ where: { userId: user.id } });
      childId = child?.id;
    }

    // Create JWT token
    const tokenPayload: AuthTokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      childId,
    };
    const token = await createToken(tokenPayload);

    // Store session in database
    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + SESSION_DURATION),
      },
    });

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role as 'child' | 'parent' | 'admin',
        displayName: user.displayName || undefined,
        email: user.email || undefined,
        childId,
      },
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
}

// Verify session from token
export async function verifySession(token: string): Promise<AuthUser | null> {
  try {
    const payload = await verifyToken(token);
    if (!payload) return null;

    // Check session exists in DB
    const session = await db.session.findUnique({ where: { token } });
    if (!session) return null;

    // Check expiry
    if (new Date() > session.expiresAt) {
      await db.session.delete({ where: { token } });
      return null;
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) return null;

    let childId: string | undefined;
    if (user.role === 'child') {
      const child = await db.child.findFirst({ where: { userId: user.id } });
      childId = child?.id;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role as 'child' | 'parent' | 'admin',
      displayName: user.displayName || undefined,
      email: user.email || undefined,
      childId,
    };
  } catch {
    return null;
  }
}

// Logout - invalidate session
export async function logoutUser(token: string): Promise<void> {
  try {
    await db.session.deleteMany({ where: { token } });
  } catch {
    // ignore
  }
}

// Clean up expired sessions
export async function cleanupSessions(): Promise<void> {
  try {
    await db.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  } catch {
    // ignore
  }
}
