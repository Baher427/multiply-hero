// Web Audio API based sound generator - Enhanced with rich, realistic audio effects
// Uses layered oscillators, ADSR envelopes, detuning, and delay effects for depth

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ─── Core Helpers ──────────────────────────────────────────────────

  /**
   * Create a single oscillator with gain envelope (ADSR-style).
   * Returns { oscillator, gainNode } — caller must call .start() / .stop().
   */
  private createOsc(
    frequency: number,
    duration: number,
    opts: {
      type?: OscillatorType;
      volume?: number;
      attack?: number;   // time to reach peak volume
      decay?: number;    // time to reach sustain volume
      sustain?: number;  // sustain volume ratio (0-1 of volume)
      release?: number;  // time from sustain end to silence
      detune?: number;   // cents of detuning
      startTime?: number; // absolute start time (defaults to now)
    } = {}
  ) {
    const {
      type = 'sine',
      volume = 0.3,
      attack = 0.005,
      decay = 0.05,
      sustain = 0.7,
      release = 0.1,
      detune = 0,
      startTime,
    } = opts;

    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    if (detune !== 0) {
      osc.detune.setValueAtTime(detune, ctx.currentTime);
    }

    const t0 = startTime ?? ctx.currentTime;
    const peakVol = volume;
    const sustainVol = volume * sustain;

    // Attack
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(peakVol, t0 + attack);

    // Decay
    gain.gain.exponentialRampToValueAtTime(Math.max(sustainVol, 0.001), t0 + attack + decay);

    // Release — ramp to silence near end of duration
    const releaseStart = t0 + duration - release;
    gain.gain.setValueAtTime(Math.max(sustainVol, 0.001), releaseStart);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + duration);

    return { oscillator: osc, gainNode: gain };
  }

  /**
   * Play a layered tone using multiple oscillators at harmonic intervals
   * with slight detuning for warmth.
   */
  private playLayeredTone(
    baseFreq: number,
    duration: number,
    opts: {
      harmonics?: number[];     // frequency multipliers (default [1])
      types?: OscillatorType[]; // one per harmonic, cycles if shorter
      volume?: number;
      attack?: number;
      decay?: number;
      sustain?: number;
      release?: number;
      detuneSpread?: number;    // ± cents spread between detuned pairs
      startTime?: number;
    } = {}
  ) {
    if (!this.enabled) return;
    try {
      const {
        harmonics = [1],
        types = ['sine'],
        volume = 0.25,
        attack = 0.005,
        decay = 0.05,
        sustain = 0.7,
        release = 0.1,
        detuneSpread = 5,
        startTime,
      } = opts;

      const volPerHarmonic = volume / harmonics.length;

      harmonics.forEach((h, i) => {
        const type = types[i % types.length];
        this.createOsc(baseFreq * h, duration, {
          type,
          volume: volPerHarmonic,
          attack,
          decay,
          sustain,
          release,
          detune: 0,
          startTime,
        });
        // Add a slightly detuned copy for warmth
        if (detuneSpread > 0) {
          this.createOsc(baseFreq * h, duration, {
            type,
            volume: volPerHarmonic * 0.6,
            attack,
            decay,
            sustain,
            release,
            detune: detuneSpread,
            startTime,
          });
        }
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * Create a simple delay/echo effect node chain.
   * Returns the final gain node that should be connected to destination.
   */
  private createDelayEffect(
    delayTime: number,
    feedback: number,
    wetLevel: number,
  ): { input: GainNode; ctx: AudioContext } {
    const ctx = this.getContext();
    const input = ctx.createGain();
    const delay = ctx.createDelay(1.0);
    const feedbackGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const dryGain = ctx.createGain();

    delay.delayTime.setValueAtTime(delayTime, ctx.currentTime);
    feedbackGain.gain.setValueAtTime(feedback, ctx.currentTime);
    wetGain.gain.setValueAtTime(wetLevel, ctx.currentTime);
    dryGain.gain.setValueAtTime(1 - wetLevel, ctx.currentTime);

    // dry path
    input.connect(dryGain);
    dryGain.connect(ctx.destination);

    // wet path
    input.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(ctx.destination);

    return { input, ctx };
  }

  /**
   * Play a note routed through a delay effect for spatial depth.
   */
  private playDelayedNote(
    frequency: number,
    duration: number,
    delayTime: number,
    feedback: number,
    wetLevel: number,
    opts: {
      type?: OscillatorType;
      volume?: number;
      attack?: number;
      decay?: number;
      sustain?: number;
      release?: number;
      detune?: number;
      startTime?: number;
    } = {}
  ) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const { input } = this.createDelayEffect(delayTime, feedback, wetLevel);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const {
        type = 'sine',
        volume = 0.25,
        attack = 0.005,
        decay = 0.05,
        sustain = 0.7,
        release = 0.1,
        detune = 0,
        startTime,
      } = opts;

      osc.type = type;
      const t0 = startTime ?? ctx.currentTime;
      osc.frequency.setValueAtTime(frequency, t0);
      if (detune !== 0) osc.detune.setValueAtTime(detune, t0);

      const peakVol = volume;
      const sustainVol = volume * sustain;
      const releaseStart = t0 + duration - release;

      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.exponentialRampToValueAtTime(peakVol, t0 + attack);
      gain.gain.exponentialRampToValueAtTime(Math.max(sustainVol, 0.001), t0 + attack + decay);
      gain.gain.setValueAtTime(Math.max(sustainVol, 0.001), releaseStart);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

      osc.connect(gain);
      gain.connect(input);
      gain.connect(ctx.destination); // also direct for clarity

      osc.start(t0);
      osc.stop(t0 + duration + 0.5); // extra time for delay tail
    } catch {
      // Silently fail
    }
  }

  // ─── Sound Effects ─────────────────────────────────────────────────

  /**
   * 1. Correct Answer — Happy ascending chime with harmonics & reverb-like delay
   */
  playCorrect() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Three ascending notes: C5 → E5 → G5 with harmonics
      const notes = [523.25, 659.25, 783.99];
      const noteDur = 0.22;
      const gap = 0.12;

      notes.forEach((freq, i) => {
        const start = now + i * (noteDur + gap);
        // Fundamental + octave harmonic, sine + triangle for warmth
        this.playLayeredTone(freq, noteDur + 0.1, {
          harmonics: [1, 2],
          types: ['sine', 'triangle'],
          volume: 0.22,
          attack: 0.008,
          decay: 0.06,
          sustain: 0.5,
          release: 0.12,
          detuneSpread: 4,
          startTime: start,
        });
      });

      // Sparkle overtone on the last note
      this.createOsc(1567.98, 0.25, {
        type: 'sine',
        volume: 0.07,
        attack: 0.01,
        decay: 0.08,
        sustain: 0.3,
        release: 0.15,
        startTime: now + 2 * (noteDur + gap),
      });

      // Subtle delay for spatial depth
      this.playDelayedNote(783.99, 0.3, 0.12, 0.25, 0.15, {
        type: 'sine',
        volume: 0.08,
        startTime: now + 2 * (noteDur + gap),
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 2. Wrong Answer — Soft encouraging "boop" with subtle descending tone
   */
  playWrong() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Soft boop — triangle wave for roundness
      this.playLayeredTone(330, 0.2, {
        harmonics: [1],
        types: ['triangle'],
        volume: 0.18,
        attack: 0.01,
        decay: 0.06,
        sustain: 0.4,
        release: 0.12,
        detuneSpread: 6,
        startTime: now,
      });

      // Subtle descending tone that fades quickly — not punishing
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(0.001, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.08);
      osc.stop(now + 0.4);
    } catch {
      // Silently fail
    }
  }

  /**
   * 3. Combo — Exciting accelerating arpeggio with sparkle overtone
   */
  playCombo() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Accelerating arpeggio: notes get closer together and higher
      const notes = [
        { freq: 523.25, time: 0, dur: 0.1 },
        { freq: 659.25, time: 0.09, dur: 0.1 },
        { freq: 783.99, time: 0.16, dur: 0.1 },
        { freq: 1046.5, time: 0.22, dur: 0.12 },
        { freq: 1318.5, time: 0.27, dur: 0.15 },
      ];

      notes.forEach(({ freq, time, dur }) => {
        this.playLayeredTone(freq, dur, {
          harmonics: [1, 2],
          types: ['sine', 'triangle'],
          volume: 0.2,
          attack: 0.005,
          decay: 0.04,
          sustain: 0.5,
          release: 0.08,
          detuneSpread: 3,
          startTime: now + time,
        });
      });

      // Sparkle overtone — high shimmer
      this.createOsc(2093, 0.2, {
        type: 'sine',
        volume: 0.06,
        attack: 0.005,
        decay: 0.04,
        sustain: 0.3,
        release: 0.1,
        startTime: now + 0.27,
      });
      this.createOsc(2637, 0.15, {
        type: 'sine',
        volume: 0.04,
        attack: 0.005,
        decay: 0.03,
        sustain: 0.2,
        release: 0.08,
        startTime: now + 0.3,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 4. Level Up — Triumphant fanfare with multiple layered tones
   */
  playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Fanfare: C5 → E5 → G5 → C6 (bold, layered)
      const fanfare = [
        { freq: 523.25, time: 0, dur: 0.25 },
        { freq: 659.25, time: 0.15, dur: 0.25 },
        { freq: 783.99, time: 0.3, dur: 0.25 },
        { freq: 1046.5, time: 0.45, dur: 0.5 },
      ];

      fanfare.forEach(({ freq, time, dur }) => {
        // Main tone — square for brightness (like a trumpet)
        this.playLayeredTone(freq, dur, {
          harmonics: [1, 2, 3],
          types: ['square', 'sine', 'triangle'],
          volume: 0.16,
          attack: 0.01,
          decay: 0.06,
          sustain: 0.6,
          release: 0.15,
          detuneSpread: 6,
          startTime: now + time,
        });
      });

      // Final sustained chord — C major spread
      const chordTime = now + 0.55;
      this.playLayeredTone(523.25, 0.8, {
        harmonics: [1, 2],
        types: ['sine', 'triangle'],
        volume: 0.1,
        attack: 0.02,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
        detuneSpread: 8,
        startTime: chordTime,
      });
      this.playLayeredTone(659.25, 0.8, {
        harmonics: [1],
        types: ['sine'],
        volume: 0.07,
        attack: 0.02,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
        detuneSpread: 8,
        startTime: chordTime,
      });
      this.playLayeredTone(783.99, 0.8, {
        harmonics: [1],
        types: ['sine'],
        volume: 0.07,
        attack: 0.02,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
        detuneSpread: 8,
        startTime: chordTime,
      });

      // Delay effect for grandeur
      this.playDelayedNote(1046.5, 0.6, 0.15, 0.3, 0.2, {
        type: 'sine',
        volume: 0.08,
        startTime: chordTime,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 5. Badge/Achievement — Magical "ding" with sparkle overtones
   */
  playBadge() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Main ding — bell-like tone with harmonics (triangle for bell quality)
      this.playLayeredTone(880, 0.6, {
        harmonics: [1, 2.0, 3.0, 4.2, 5.4],
        types: ['triangle', 'sine', 'sine', 'sine', 'sine'],
        volume: 0.18,
        attack: 0.003,
        decay: 0.15,
        sustain: 0.3,
        release: 0.35,
        detuneSpread: 4,
        startTime: now,
      });

      // Sparkle overtones — rapid high-frequency cascading
      const sparkles = [1760, 2217.46, 2637.02, 3135.96];
      sparkles.forEach((freq, i) => {
        this.createOsc(freq, 0.15 + i * 0.02, {
          type: 'sine',
          volume: 0.05 - i * 0.008,
          attack: 0.003,
          decay: 0.04,
          sustain: 0.2,
          release: 0.08,
          startTime: now + 0.05 + i * 0.04,
        });
      });

      // Magical shimmer — delayed echo
      this.playDelayedNote(880, 0.4, 0.1, 0.35, 0.2, {
        type: 'triangle',
        volume: 0.06,
        attack: 0.01,
        decay: 0.1,
        sustain: 0.4,
        release: 0.2,
        startTime: now + 0.15,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 6. Click — Crisp, satisfying click with slight resonance
   */
  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Sharp attack click — very short sine burst
      this.createOsc(1200, 0.04, {
        type: 'sine',
        volume: 0.15,
        attack: 0.001,
        decay: 0.01,
        sustain: 0.1,
        release: 0.02,
        startTime: now,
      });

      // Resonance body — short triangle at lower frequency
      this.createOsc(600, 0.06, {
        type: 'triangle',
        volume: 0.06,
        attack: 0.001,
        decay: 0.02,
        sustain: 0.1,
        release: 0.03,
        startTime: now,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 7. Star — Twinkle sound with rapid high-frequency decay
   */
  playStar() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Twinkle — high frequency with fast decay
      const twinkleFreqs = [1567.98, 2093.0, 2637.02];
      twinkleFreqs.forEach((freq, i) => {
        this.createOsc(freq, 0.12, {
          type: 'sine',
          volume: 0.12 - i * 0.025,
          attack: 0.003,
          decay: 0.03,
          sustain: 0.15,
          release: 0.06,
          detune: i * 3,
          startTime: now + i * 0.035,
        });
      });

      // Shimmer tail
      this.createOsc(3135.96, 0.2, {
        type: 'sine',
        volume: 0.04,
        attack: 0.005,
        decay: 0.04,
        sustain: 0.1,
        release: 0.1,
        startTime: now + 0.08,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 8. Coins — Coin-collecting cascade sound, like multiple coins dropping
   */
  playCoins() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Multiple coin hits at slightly different times and pitches
      const coinHits = [
        { freq: 1108.73, time: 0, vol: 0.15 },
        { freq: 1318.51, time: 0.06, vol: 0.13 },
        { freq: 1479.98, time: 0.12, vol: 0.14 },
        { freq: 1661.22, time: 0.18, vol: 0.12 },
        { freq: 1975.53, time: 0.25, vol: 0.10 },
        { freq: 2217.46, time: 0.32, vol: 0.08 },
      ];

      coinHits.forEach(({ freq, time, vol }) => {
        // Main coin tone — metallic (triangle + sine)
        this.createOsc(freq, 0.1, {
          type: 'triangle',
          volume: vol,
          attack: 0.001,
          decay: 0.02,
          sustain: 0.2,
          release: 0.06,
          startTime: now + time,
        });
        // Metallic overtone
        this.createOsc(freq * 2.4, 0.06, {
          type: 'sine',
          volume: vol * 0.3,
          attack: 0.001,
          decay: 0.015,
          sustain: 0.1,
          release: 0.03,
          startTime: now + time,
        });
      });

      // Final settling shimmer
      this.createOsc(2637.02, 0.15, {
        type: 'sine',
        volume: 0.05,
        attack: 0.005,
        decay: 0.03,
        sustain: 0.15,
        release: 0.08,
        startTime: now + 0.35,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 9. Game Over — Satisfying completion jingle that feels rewarding
   */
  playGameOver() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Rising melody: C5 → D5 → E5 → G5 → C6 (conclusion feel)
      const melody = [
        { freq: 523.25, time: 0, dur: 0.18 },
        { freq: 587.33, time: 0.16, dur: 0.18 },
        { freq: 659.25, time: 0.32, dur: 0.18 },
        { freq: 783.99, time: 0.48, dur: 0.22 },
        { freq: 1046.5, time: 0.65, dur: 0.5 },
      ];

      melody.forEach(({ freq, time, dur }) => {
        this.playLayeredTone(freq, dur, {
          harmonics: [1, 2],
          types: ['sine', 'triangle'],
          volume: 0.2,
          attack: 0.01,
          decay: 0.06,
          sustain: 0.55,
          release: 0.12,
          detuneSpread: 5,
          startTime: now + time,
        });
      });

      // Resolution chord
      const chordTime = now + 0.75;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
        this.createOsc(freq, 0.7, {
          type: 'sine',
          volume: 0.07,
          attack: 0.02,
          decay: 0.1,
          sustain: 0.6,
          release: 0.3,
          startTime: chordTime,
        });
      });

      // Final sparkle
      this.createOsc(2093, 0.3, {
        type: 'sine',
        volume: 0.04,
        attack: 0.01,
        decay: 0.06,
        sustain: 0.3,
        release: 0.15,
        startTime: chordTime + 0.1,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 10. Countdown — Urgent but not annoying tick
   */
  playCountdown() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Short percussive tick
      this.createOsc(880, 0.05, {
        type: 'sine',
        volume: 0.12,
        attack: 0.001,
        decay: 0.01,
        sustain: 0.05,
        release: 0.03,
        startTime: now,
      });

      // Subtle click body
      this.createOsc(440, 0.03, {
        type: 'triangle',
        volume: 0.05,
        attack: 0.001,
        decay: 0.005,
        sustain: 0.05,
        release: 0.02,
        startTime: now,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 11. Match — Pleasant connection sound for matching games
   */
  playMatch() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Two-note "connection" — harmonious interval
      this.playLayeredTone(660, 0.2, {
        harmonics: [1, 1.5],
        types: ['sine', 'triangle'],
        volume: 0.18,
        attack: 0.008,
        decay: 0.05,
        sustain: 0.5,
        release: 0.1,
        detuneSpread: 4,
        startTime: now,
      });

      this.playLayeredTone(880, 0.25, {
        harmonics: [1, 2],
        types: ['sine', 'triangle'],
        volume: 0.15,
        attack: 0.008,
        decay: 0.06,
        sustain: 0.5,
        release: 0.12,
        detuneSpread: 4,
        startTime: now + 0.08,
      });

      // Subtle shimmer
      this.createOsc(1320, 0.15, {
        type: 'sine',
        volume: 0.04,
        attack: 0.005,
        decay: 0.03,
        sustain: 0.2,
        release: 0.08,
        startTime: now + 0.1,
      });
    } catch {
      // Silently fail
    }
  }

  // ─── New Sound Effects ─────────────────────────────────────────────

  /**
   * 12. Heartbeat — For when time is running low (subtle pulse)
   */
  playHeartbeat() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // "Lub-dub" double pulse
      // First beat (lub) — slightly louder, lower
      this.createOsc(80, 0.12, {
        type: 'sine',
        volume: 0.18,
        attack: 0.01,
        decay: 0.04,
        sustain: 0.2,
        release: 0.06,
        startTime: now,
      });
      this.createOsc(120, 0.1, {
        type: 'sine',
        volume: 0.1,
        attack: 0.01,
        decay: 0.03,
        sustain: 0.15,
        release: 0.05,
        startTime: now,
      });

      // Second beat (dub) — slightly softer, higher
      this.createOsc(90, 0.1, {
        type: 'sine',
        volume: 0.12,
        attack: 0.01,
        decay: 0.03,
        sustain: 0.15,
        release: 0.05,
        startTime: now + 0.15,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * 13. Whoosh — For page transitions
   */
  playWhoosh() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Noise-like whoosh using rapidly swept oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // White-noise approximation via detuned high freq
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);
      filter.Q.setValueAtTime(1.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Silently fail
    }
  }

  /**
   * 14. Pop — For small UI interactions
   */
  playPop() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Short pop — frequency drops quickly for "pop" character
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.07);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Silently fail
    }
  }

  /**
   * 15. Drumroll — Before revealing results
   */
  playDrumroll() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Rapid series of soft hits that accelerate slightly
      const hitCount = 12;
      for (let i = 0; i < hitCount; i++) {
        // Accelerating timing
        const time = now + i * (0.08 - i * 0.003);
        const vol = 0.06 + (i / hitCount) * 0.06;

        // Low thump
        this.createOsc(100 + i * 5, 0.04, {
          type: 'sine',
          volume: vol,
          attack: 0.001,
          decay: 0.01,
          sustain: 0.05,
          release: 0.02,
          startTime: time,
        });

        // Crackle layer
        this.createOsc(800 + i * 30, 0.02, {
          type: 'triangle',
          volume: vol * 0.3,
          attack: 0.001,
          decay: 0.005,
          sustain: 0.05,
          release: 0.01,
          startTime: time,
        });
      }

      // Final hit — the reveal
      this.createOsc(150, 0.15, {
        type: 'sine',
        volume: 0.2,
        attack: 0.005,
        decay: 0.04,
        sustain: 0.3,
        release: 0.08,
        startTime: now + hitCount * 0.06,
      });
    } catch {
      // Silently fail
    }
  }
}

// Singleton
export const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : null;
