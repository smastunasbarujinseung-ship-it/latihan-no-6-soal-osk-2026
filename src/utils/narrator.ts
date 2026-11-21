export type NarratorStatus = 'idle' | 'speaking' | 'paused' | 'unsupported';

type StatusListener = (status: NarratorStatus, activeLabel: string | null) => void;

/**
 * Converts LaTeX / physics symbols into clear, natural spoken Indonesian
 * so the Olympiad narrator never reads raw syntax awkwardly.
 */
export function normalizePhysicsSpeech(raw: string): string {
  let text = raw;

  // Strip LaTeX delimiters
  text = text.replace(/\$\$/g, ' ').replace(/\$/g, ' ');

  // Replace common LaTeX fractions and roots before stripping braces
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 per $2');
  text = text.replace(/\\sqrt\{([^}]+)\}/g, 'akar kuadrat dari $1');
  text = text.replace(/\\arctan/g, 'arkus tangen');
  text = text.replace(/\\tan/g, 'tangen');
  text = text.replace(/\\sin/g, 'sinus');
  text = text.replace(/\\cos/g, 'kosinus');
  text = text.replace(/\\cot/g, 'kotangen');

  // Physics symbols & Greek letters
  const replacements: Array<[RegExp, string]> = [
    [/\\Sigma\s*F/g, 'resultan gaya'],
    [/ΣF/g, 'resultan gaya'],
    [/\\ell/g, 'el'],
    [/ℓ/g, 'el'],
    [/\\alpha/g, 'sudut alfa'],
    [/α/g, 'sudut alfa'],
    [/\\beta/g, 'sudut beta'],
    [/β/g, 'sudut beta'],
    [/\\theta/g, 'sudut teta'],
    [/θ/g, 'sudut teta'],
    [/\\psi/g, 'sudut psi'],
    [/ψ/g, 'sudut psi'],
    [/\\phi/g, 'sudut fi'],
    [/φ/g, 'sudut fi'],
    [/\\mu_k/g, 'koefisien gesek kinetik miu k'],
    [/\\mu_s/g, 'koefisien gesek statis miu s'],
    [/\\mu_\{\\text\{eff\}\}/g, 'koefisien gesek efektif miu efektif'],
    [/\\mu/g, 'koefisien gesek miu'],
    [/μ/g, 'koefisien gesek miu'],
    [/\\Delta/g, 'delta'],
    [/Δ/g, 'delta'],
    [/\\vec\{g\}_\{\\text\{eff\}\}/g, 'vektor percepatan gravitasi efektif'],
    [/\\vec\{([^}]+)\}/g, 'vektor $1'],
    [/\\text\{([^}]+)\}/g, '$1'],
    [/\\cdot|\\times/g, 'dikali'],
    [/\\le/g, 'kurang dari atau sama dengan'],
    [/\\ge/g, 'lebih dari atau sama dengan'],
    [/\\approx/g, 'mendekati'],
    [/\\Rightarrow/g, 'sehingga diperoleh'],
    [/\\circ/g, ' derajat'],
    [/°/g, ' derajat'],
    [/\^2/g, ' kuadrat'],
    [/m\/s\^?2/g, 'meter per sekon kuadrat'],
    [/m\/s/g, 'meter per sekon'],
    [/N\/m/g, 'newton per meter'],
    [/\\,/g, ' '],
    [/[{}]/g, ' '],
    [/\\/g, ' '],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  // Contextual single-letter physics symbols when isolated
  text = text.replace(/\bW\s*=\s*m\s*g/g, 'gaya berat sama dengan massa dikali percepatan gravitasi');
  text = text.replace(/\bf_k\b/g, 'gaya gesek kinetik');
  text = text.replace(/\bf_s\b/g, 'gaya gesek statis');
  text = text.replace(/\bt_\{?\\?min\}?/g, 'waktu minimum');
  text = text.replace(/\bv_x\b/g, 'kecepatan horizontal');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

class OlympiadNarrator {
  private status: NarratorStatus = 'idle';
  private activeLabel: string | null = null;
  private listeners: Set<StatusListener> = new Set();

  constructor() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.status = 'unsupported';
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getStatus(): { status: NarratorStatus; activeLabel: string | null } {
    return { status: this.status, activeLabel: this.activeLabel };
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.activeLabel);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    for (const listener of this.listeners) {
      listener(this.status, this.activeLabel);
    }
  }

  private pickIndonesianVoice(): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'));
    if (idVoice) return idVoice;
    return voices.find((v) => v.default) || voices[0] || null;
  }

  public speak(rawText: string, label: string, onEnd?: () => void) {
    if (!this.isSupported()) {
      this.status = 'unsupported';
      this.activeLabel = label;
      this.emit();
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = normalizePhysicsSpeech(rawText);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = this.pickIndonesianVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = 'id-ID';
    utterance.rate = 0.98;
    utterance.pitch = 0.95;

    this.activeLabel = label;
    this.status = 'speaking';
    this.emit();

    utterance.onend = () => {
      this.status = 'idle';
      this.activeLabel = null;
      this.emit();
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.status = 'idle';
      this.activeLabel = null;
      this.emit();
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (!this.isSupported()) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      this.status = 'paused';
      this.emit();
    }
  }

  public resume() {
    if (!this.isSupported()) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.status = 'speaking';
      this.emit();
    }
  }

  public stop() {
    if (!this.isSupported()) {
      this.activeLabel = null;
      this.emit();
      return;
    }
    window.speechSynthesis.cancel();
    this.status = 'idle';
    this.activeLabel = null;
    this.emit();
  }
}

export const narrator = new OlympiadNarrator();

/**
 * Subtle Web Audio API feedback chime (safe on user gesture, silent fallback if unavailable)
 */
export function playFeedbackTone(type: 'correct' | 'hint') {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.setValueAtTime(290, now + 0.09);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.21);
    }
  } catch {
    // Ignore audio context restrictions
  }
}
