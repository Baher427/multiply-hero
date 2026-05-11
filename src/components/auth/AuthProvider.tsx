'use client';

import { useEffect, createContext, useContext, ReactNode } from 'react';
import { useAppStore } from '@/stores/auth-store';
import type { ChildProfile } from '@/types';

interface AuthContextType {
  user: {
    id: string;
    username: string;
    role: 'child' | 'parent' | 'admin';
    displayName?: string;
    email?: string;
    childId?: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedChild: ChildProfile | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    username: string;
    password: string;
    role: string;
    displayName?: string;
    email?: string;
    age?: number;
    avatarId?: string;
    favoriteColor?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setSelectedChild: (child: ChildProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    token,
    isAuthenticated,
    isLoadingAuth,
    selectedChild,
    setUser,
    setSelectedChild,
    logout: storeLogout,
    initAuth,
  } = useAppStore();

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Load child profile when user changes
  useEffect(() => {
    if (isAuthenticated && user?.childId && !selectedChild) {
      fetch(`/api/children/${user.childId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setSelectedChild(data.data.child || data.data);
          }
        })
        .catch(() => { /* ignore */ });
    }
  }, [isAuthenticated, user?.childId, selectedChild, setSelectedChild]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data.user, data.data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'فشل تسجيل الدخول' };
    } catch {
      return { success: false, error: 'خطأ في الاتصال' };
    }
  };

  const register = async (data: {
    username: string;
    password: string;
    role: string;
    displayName?: string;
    email?: string;
    age?: number;
    avatarId?: string;
    favoriteColor?: string;
  }) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...data }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setUser(result.data.user, result.data.token);
        return { success: true };
      }
      return { success: false, error: result.error || 'فشل إنشاء الحساب' };
    } catch {
      return { success: false, error: 'خطأ في الاتصال' };
    }
  };

  const logout = async () => {
    await storeLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading: isLoadingAuth,
        selectedChild,
        login,
        register,
        logout,
        setSelectedChild,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
