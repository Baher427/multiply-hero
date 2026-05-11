import { create } from 'zustand';
import type { ChildProfile, GameType } from '@/types';

interface AuthUser {
  id: string;
  username: string;
  role: 'child' | 'parent' | 'admin';
  displayName?: string;
  email?: string;
  childId?: string;
}

interface AppState {
  // Auth state (from server)
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;

  // Selected child profile
  selectedChild: ChildProfile | null;

  // Game selections
  selectedTable: number | 'mixed';
  selectedGameType: GameType;

  // Sound settings
  soundEnabled: boolean;
  musicEnabled: boolean;

  // Actions
  setUser: (user: AuthUser | null, token: string | null) => void;
  setSelectedChild: (child: ChildProfile | null) => void;
  setSelectedTable: (table: number | 'mixed') => void;
  setSelectedGameType: (gameType: GameType) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  logout: () => void;
  setLoadingAuth: (loading: boolean) => void;

  // Initialize auth from stored token
  initAuth: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  selectedChild: null,
  selectedTable: 'mixed',
  selectedGameType: 'multiple-choice',
  soundEnabled: true,
  musicEnabled: true,

  setUser: (user, token) => {
    set({ user, token, isAuthenticated: !!user, isLoadingAuth: false });
    // Store token in cookie for middleware
    if (typeof document !== 'undefined') {
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      } else {
        document.cookie = 'auth-token=; path=/; max-age=0';
      }
    }
  },

  setSelectedChild: (child) => set({ selectedChild: child }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setSelectedGameType: (gameType) => set({ selectedGameType: gameType }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  setLoadingAuth: (loading) => set({ isLoadingAuth: loading }),

  logout: async () => {
    const { token } = get();
    if (token) {
      try {
        await fetch('/api/auth', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch { /* ignore */ }
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      selectedChild: null,
      isLoadingAuth: false,
    });
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; max-age=0';
    }
  },

  initAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      // Try to get token from cookie
      const cookieToken = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1]
        : null;

      if (!cookieToken) {
        set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
        return;
      }

      const res = await fetch('/api/auth', {
        headers: { 'Authorization': `Bearer ${cookieToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          set({
            user: data.data.user,
            token: data.data.token || cookieToken,
            isAuthenticated: true,
            isLoadingAuth: false,
          });
          return;
        }
      }

      // Token invalid
      set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-token=; path=/; max-age=0';
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
    }
  },
}));
