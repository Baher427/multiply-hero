import { create } from 'zustand';
import { AppView, ChildProfile, GameType } from '@/types';

interface AppState {
  currentView: AppView;
  previousView: AppView | null;
  selectedChild: ChildProfile | null;
  selectedTable: number | 'mixed';
  selectedGameType: GameType;
  isAdminMode: boolean;
  isParentMode: boolean;
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
  toggleSound: () => void;
  toggleMusic: () => void;
  setLoading: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'landing',
  previousView: null,
  selectedChild: null,
  selectedTable: 'mixed',
  selectedGameType: 'multiple-choice',
  isAdminMode: false,
  isParentMode: false,
  soundEnabled: true,
  musicEnabled: true,
  isLoading: false,

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
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  setLoading: (val) => set({ isLoading: val }),
}));
