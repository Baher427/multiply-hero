'use client';

import { useCallback } from 'react';
import { soundEngine } from '@/lib/sounds';

export function useSound() {
  const play = useCallback((sound: 'correct' | 'wrong' | 'combo' | 'levelUp' | 'badge' | 'click' | 'star' | 'coins' | 'gameOver' | 'countdown' | 'match') => {
    if (!soundEngine) return;
    switch (sound) {
      case 'correct': soundEngine.playCorrect(); break;
      case 'wrong': soundEngine.playWrong(); break;
      case 'combo': soundEngine.playCombo(); break;
      case 'levelUp': soundEngine.playLevelUp(); break;
      case 'badge': soundEngine.playBadge(); break;
      case 'click': soundEngine.playClick(); break;
      case 'star': soundEngine.playStar(); break;
      case 'coins': soundEngine.playCoins(); break;
      case 'gameOver': soundEngine.playGameOver(); break;
      case 'countdown': soundEngine.playCountdown(); break;
      case 'match': soundEngine.playMatch(); break;
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    soundEngine?.setEnabled(enabled);
  }, []);

  const isEnabled = useCallback(() => {
    return soundEngine?.isEnabled() ?? false;
  }, []);

  const toggle = useCallback(() => {
    const current = soundEngine?.isEnabled() ?? false;
    soundEngine?.setEnabled(!current);
    return !current;
  }, []);

  return { play, setEnabled, isEnabled, toggle };
}
