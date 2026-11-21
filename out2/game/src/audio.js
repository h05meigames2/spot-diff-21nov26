// audio.js — synthesised WebAudio sounds, no audio files.
// Every effect is a short oscillator phrase so the game ships zero assets.

/** The sound engine: created on first use, muted on demand. */
export class SoundEngine {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  /** Create (or resume) the AudioContext after a user gesture. */
  ensure() {
    if (typeof window === 'undefined' || !window.AudioContext) return null;
    if (!this.context) this.context = new window.AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  /** One tone: frequency, start delay, length, waveform and loudness. */
  tone(freq, delay, length, type, volume) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }

  /** A found difference: a bright two-note chime. */
  found() {
    this.tone(660, 0, 0.12, 'sine', 0.22);
    this.tone(990, 0.08, 0.18, 'sine', 0.2);
  }

  /** A wrong click: a low dull buzz. */
  wrong() {
    this.tone(140, 0, 0.18, 'sawtooth', 0.12);
  }

  /** A hint: a soft rising blip. */
  hint() {
    this.tone(520, 0, 0.1, 'triangle', 0.16);
    this.tone(780, 0.09, 0.14, 'triangle', 0.14);
  }

  /** A scene cleared: a quick rising arpeggio. */
  sceneClear() {
    [523, 659, 784, 1047].forEach((freq, i) => this.tone(freq, i * 0.09, 0.16, 'triangle', 0.18));
  }

  /** Winning the whole game: a longer fanfare. */
  win() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((freq, i) => this.tone(freq, i * 0.11, 0.22, 'triangle', 0.18));
  }

  /** Losing on time: a falling phrase. */
  lose() {
    [392, 330, 262, 196].forEach((freq, i) => this.tone(freq, i * 0.13, 0.2, 'sine', 0.16));
  }

  /** A plain UI click. */
  click() {
    this.tone(880, 0, 0.06, 'sine', 0.12);
  }
}
