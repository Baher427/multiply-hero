'use client';

// Web Audio API based sound generator - no external files needed
class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail
    }
  }

  private playMelody(notes: number[], noteDuration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled) return;
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, noteDuration, type, volume), i * noteDuration * 800);
    });
  }

  // Success sounds
  playCorrect() {
    // Happy ascending chime
    this.playMelody([523, 659, 784], 0.15, 'sine', 0.25);
  }

  playWrong() {
    // Gentle low tone
    this.playTone(220, 0.3, 'triangle', 0.15);
  }

  playCombo() {
    // Exciting ascending melody
    this.playMelody([523, 659, 784, 1047], 0.1, 'sine', 0.3);
  }

  playLevelUp() {
    // Triumphant fanfare
    this.playMelody([523, 659, 784, 1047, 1319], 0.12, 'square', 0.2);
  }

  playBadge() {
    // Achievement sound
    this.playMelody([784, 988, 1175, 1568], 0.1, 'sine', 0.25);
  }

  playClick() {
    this.playTone(800, 0.05, 'sine', 0.1);
  }

  playStar() {
    // Twinkle sound
    this.playMelody([1200, 1400, 1600], 0.08, 'sine', 0.2);
  }

  playCoins() {
    // Coin collect sound
    this.playMelody([800, 1000, 1200, 1500], 0.06, 'square', 0.15);
  }

  playGameOver() {
    // Game complete melody
    this.playMelody([523, 587, 659, 784, 880, 1047], 0.15, 'sine', 0.3);
  }

  playCountdown() {
    this.playTone(440, 0.1, 'square', 0.1);
  }

  playMatch() {
    this.playMelody([660, 880], 0.1, 'sine', 0.2);
  }
}

// Singleton
export const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : null;
