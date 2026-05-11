import { create } from 'zustand';
import { AppView, ChildProfile, GameType } from '@/types';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const REMEMBER_ME_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface AuthState {
  authToken: string | null;
  sessionExpiry: number | null;
  loginAttempts: number;
  isLocked: boolean;
  lockUntil: number | null;
  lastActivity: number;
  rememberMe: boolean;
}

interface AppState extends AuthState {
  currentView: AppView;
  previousView: AppView | null;
  selectedChild: ChildProfile | null;
  selectedTable: number | 'mixed';
  selectedGameType: GameType;
  isAdminMode: boolean;
  isParentMode: boolean;
  isAuthenticated: boolean;
  currentChildId: string | null;
  soundEnabled: boolean;
  musicEnabled: boolean;
  isLoading: boolean;

  navigate: (view: AppView) => void;
  goBack: () => void;
  setSelectedChild: (child: ChildProfile | null) => void;
  setSelectedTable: (table: number | 'mixed') => void;
  setSelectedGameType: (gameType: GameType) => void;
  setAdminMode: (val: boolean) => void;
  setParentMode: (val: boolean) => void;
  authenticate: (childId: string, rememberMe?: boolean) => void;
  logout: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  setLoading: (val: boolean) => void;

  // Auth methods
  persistAuth: () => void;
  restoreAuth: () => boolean;
  checkSession: () => boolean;
  recordFailedAttempt: () => { isLocked: boolean; attemptsLeft: number };
  resetFailedAttempts: () => void;
  isSessionValid: () => boolean;
  updateActivity: () => void;
  generateToken: (childId: string) => string;
}

function generateSimpleToken(childId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `mh_${childId.slice(0, 8)}_${timestamp.toString(36)}_${random}`;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'landing',
  previousView: null,
  selectedChild: null,
  selectedTable: 'mixed',
  selectedGameType: 'multiple-choice',
  isAdminMode: false,
  isParentMode: false,
  isAuthenticated: false,
  currentChildId: null,
  soundEnabled: true,
  musicEnabled: true,
  isLoading: false,

  // Auth state
  authToken: null,
  sessionExpiry: null,
  loginAttempts: 0,
  isLocked: false,
  lockUntil: null,
  lastActivity: Date.now(),
  rememberMe: false,

  navigate: (view) => set((state) => ({
    previousView: state.currentView,
    currentView: view,
  })),

  goBack: () => {
    const { previousView } = get();
    if (previousView) {
      set({ currentView: previousView, previousView: null });
    }
  },

  setSelectedChild: (child) => set({ selectedChild: child }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setSelectedGameType: (gameType) => set({ selectedGameType: gameType }),
  setAdminMode: (val) => set({ isAdminMode: val }),
  setParentMode: (val) => set({ isParentMode: val }),
  
  generateToken: (childId: string) => generateSimpleToken(childId),

  authenticate: (childId, remember = false) => {
    const token = generateSimpleToken(childId);
    const expiry = Date.now() + (remember ? REMEMBER_ME_DURATION : SESSION_TIMEOUT);
    set({
      isAuthenticated: true,
      currentChildId: childId,
      authToken: token,
      sessionExpiry: expiry,
      lastActivity: Date.now(),
      rememberMe: remember,
      loginAttempts: 0,
      isLocked: false,
      lockUntil: null,
    });
    // Persist to localStorage
    get().persistAuth();
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentChildId: null,
      selectedChild: null,
      currentView: 'landing',
      previousView: null,
      authToken: null,
      sessionExpiry: null,
      loginAttempts: 0,
      isLocked: false,
      lockUntil: null,
      isAdminMode: false,
      isParentMode: false,
    });
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mh_auth');
    }
  },

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  setLoading: (val) => set({ isLoading: val }),

  persistAuth: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    const authData = {
      authToken: state.authToken,
      sessionExpiry: state.sessionExpiry,
      currentChildId: state.currentChildId,
      lastActivity: state.lastActivity,
      rememberMe: state.rememberMe,
      isAuthenticated: state.isAuthenticated,
    };
    try {
      localStorage.setItem('mh_auth', JSON.stringify(authData));
    } catch {
      // localStorage might be full or unavailable
    }
  },

  restoreAuth: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('mh_auth');
      if (!stored) return false;
      const authData = JSON.parse(stored);
      if (!authData.authToken || !authData.sessionExpiry || !authData.currentChildId) {
        localStorage.removeItem('mh_auth');
        return false;
      }
      // Check if session is still valid
      if (Date.now() > authData.sessionExpiry) {
        localStorage.removeItem('mh_auth');
        set({ isAuthenticated: false, authToken: null, sessionExpiry: null });
        return false;
      }
      set({
        authToken: authData.authToken,
        sessionExpiry: authData.sessionExpiry,
        currentChildId: authData.currentChildId,
        lastActivity: authData.lastActivity || Date.now(),
        rememberMe: authData.rememberMe || false,
        isAuthenticated: true,
      });
      return true;
    } catch {
      localStorage.removeItem('mh_auth');
      return false;
    }
  },

  checkSession: () => {
    const state = get();
    if (!state.isAuthenticated || !state.sessionExpiry) return false;
    if (Date.now() > state.sessionExpiry) {
      // Session expired
      state.logout();
      return false;
    }
    // Check inactivity timeout (30 min)
    const inactiveTime = Date.now() - state.lastActivity;
    if (inactiveTime > SESSION_TIMEOUT && !state.rememberMe) {
      state.logout();
      return false;
    }
    return true;
  },

  recordFailedAttempt: () => {
    const state = get();
    const newAttempts = state.loginAttempts + 1;
    
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_DURATION;
      set({
        loginAttempts: newAttempts,
        isLocked: true,
        lockUntil,
      });
      // Persist lock state
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mh_lock', JSON.stringify({ isLocked: true, lockUntil, loginAttempts: newAttempts }));
        } catch { /* ignore */ }
      }
      return { isLocked: true, attemptsLeft: 0 };
    }
    
    set({ loginAttempts: newAttempts });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mh_lock', JSON.stringify({ isLocked: false, lockUntil: null, loginAttempts: newAttempts }));
      } catch { /* ignore */ }
    }
    return { isLocked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - newAttempts };
  },

  resetFailedAttempts: () => {
    set({ loginAttempts: 0, isLocked: false, lockUntil: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mh_lock');
    }
  },

  isSessionValid: () => {
    const state = get();
    if (!state.authToken || !state.sessionExpiry) return false;
    if (Date.now() > state.sessionExpiry) return false;
    if (!state.rememberMe) {
      const inactiveTime = Date.now() - state.lastActivity;
      if (inactiveTime > SESSION_TIMEOUT) return false;
    }
    return true;
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },
}));

// Helper to restore lock state on app start
export function restoreLockState(): { isLocked: boolean; lockUntil: number | null; loginAttempts: number } {
  if (typeof window === 'undefined') return { isLocked: false, lockUntil: null, loginAttempts: 0 };
  try {
    const stored = localStorage.getItem('mh_lock');
    if (!stored) return { isLocked: false, lockUntil: null, loginAttempts: 0 };
    const data = JSON.parse(stored);
    // Check if lockout has expired
    if (data.isLocked && data.lockUntil && Date.now() > data.lockUntil) {
      localStorage.removeItem('mh_lock');
      return { isLocked: false, lockUntil: null, loginAttempts: 0 };
    }
    return {
      isLocked: data.isLocked || false,
      lockUntil: data.lockUntil || null,
      loginAttempts: data.loginAttempts || 0,
    };
  } catch {
    return { isLocked: false, lockUntil: null, loginAttempts: 0 };
  }
}
