class SoundService {
  private enabled: boolean = true;
  private audioCtx: any = null;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private getAudioContext(): any {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported or blocked by browser gesture policy
    }
  }

  playMove() {
    if (!this.enabled) return;
    this.playTone(220, 0.08, 'triangle', 0.08);
  }

  playMerge(value: number = 4) {
    if (!this.enabled) return;
    // Calculate frequency based on merged value log2
    // 4 -> ~330Hz, 8 -> ~392Hz, 16 -> ~440Hz, 32 -> ~523Hz, 64 -> ~659Hz, etc.
    const exponent = Math.max(1, Math.min(12, Math.round(Math.log2(value))));
    const baseFreq = 220;
    const freq = baseFreq * Math.pow(1.12, exponent);

    this.playTone(freq, 0.18, 'sine', 0.2);
    // Add harmonic chime
    setTimeout(() => {
      this.playTone(freq * 1.5, 0.12, 'sine', 0.1);
    }, 40);
  }

  playCombo(comboCount: number) {
    if (!this.enabled) return;
    const count = Math.min(comboCount, 4);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playTone(440 + i * 110, 0.15, 'sine', 0.15);
      }, i * 60);
    }
  }

  playGameOver() {
    if (!this.enabled) return;
    const notes = [330, 293, 261, 196];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, 'sawtooth', 0.12);
      }, idx * 120);
    });
  }

  playWin() {
    if (!this.enabled) return;
    const notes = [261, 330, 392, 523, 659, 784];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'triangle', 0.18);
      }, idx * 90);
    });
  }

  playClick() {
    if (!this.enabled) return;
    this.playTone(600, 0.04, 'square', 0.05);
  }

  playCoin() {
    if (!this.enabled) return;
    this.playTone(987, 0.1, 'sine', 0.18);
    setTimeout(() => {
      this.playTone(1318, 0.2, 'sine', 0.2);
    }, 80);
  }
}

export const soundService = new SoundService();
