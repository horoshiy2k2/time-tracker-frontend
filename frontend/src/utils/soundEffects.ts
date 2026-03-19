type Tone = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  glideTo?: number;
};

let audioCtx: AudioContext | null = null;
let lastHoverAt = 0;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {
      // no-op: browser can block until user interacts with page
    });
  }

  return audioCtx;
};

const playTones = (tones: Tone[], masterGain = 0.08) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  tones.forEach((tone) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const startAt = now + (tone.delay || 0);
    const endAt = startAt + tone.duration;

    oscillator.type = tone.type || "sine";
    oscillator.frequency.setValueAtTime(tone.frequency, startAt);
    if (tone.glideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(tone.glideTo, endAt);
    }

    const toneGain = (tone.gain ?? 1) * masterGain;
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(toneGain, startAt + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  });
};

export const playSellSound = () => {
  // warm coin-jingle for selling
  playTones(
    [
      { frequency: 620, duration: 0.05, type: "triangle", gain: 0.8 },
      { frequency: 840, duration: 0.055, type: "sine", gain: 0.65, delay: 0.04 },
      { frequency: 1060, duration: 0.06, type: "sine", gain: 0.5, delay: 0.085 },
    ],
    0.1,
  );
};

export const playBuySound = () => {
  // soft coin rustle: tiny click + gentle shimmer
  playTones(
    [
      { frequency: 540, duration: 0.045, type: "sine", gain: 0.55 },
      { frequency: 700, duration: 0.05, type: "triangle", gain: 0.45, delay: 0.03 },
      { frequency: 880, duration: 0.06, type: "sine", gain: 0.35, delay: 0.07 },
      { frequency: 740, duration: 0.08, type: "sine", gain: 0.25, delay: 0.04, glideTo: 640 },
    ],
    0.09,
  );
};

export const playErrorBlipSound = () => {
  // low and muted, but audible
  playTones(
    [
      { frequency: 170, duration: 0.1, type: "triangle", gain: 0.55 },
      { frequency: 140, duration: 0.08, type: "sine", gain: 0.4, delay: 0.03 },
    ],
    0.08,
  );
};

export const playChestOpenSound = () => {
  // softer "whoomph" chest open with gentle reveal sparkle
  playTones(
    [
      { frequency: 95, duration: 0.16, type: "sine", gain: 0.55, glideTo: 150 },
      { frequency: 140, duration: 0.14, type: "triangle", gain: 0.42, delay: 0.05, glideTo: 220 },
      { frequency: 560, duration: 0.09, type: "sine", gain: 0.24, delay: 0.16 },
      { frequency: 860, duration: 0.08, type: "sine", gain: 0.18, delay: 0.22 },
    ],
    0.09,
  );
};

export const playRewardFlipSound = () => {
  playTones(
    [
      { frequency: 560, duration: 0.05, type: "triangle", gain: 0.35 },
      { frequency: 760, duration: 0.045, type: "sine", gain: 0.23, delay: 0.045 },
    ],
    0.065,
  );
};

export const playMixSuccessSound = () => {
  // liquid pop + sparkle
  playTones(
    [
      { frequency: 290, duration: 0.075, type: "triangle", gain: 0.55, glideTo: 410 },
      { frequency: 980, duration: 0.08, type: "sine", gain: 0.3, delay: 0.08 },
      { frequency: 1460, duration: 0.06, type: "sine", gain: 0.22, delay: 0.13 },
    ],
    0.085,
  );
};

const paintTargetBase: Record<string, number> = {
  progress: 640,
  text: 560,
  buttons: 700,
  background: 480,
};

export const playPaintApplySound = (target: string) => {
  const base = paintTargetBase[target] || 600;
  playTones(
    [
      { frequency: base, duration: 0.04, type: "triangle", gain: 0.35 },
      { frequency: base + 140, duration: 0.05, type: "sine", gain: 0.22, delay: 0.03 },
    ],
    0.07,
  );
};

export const playTimerStartSound = () => {
  playTones(
    [
      { frequency: 560, duration: 0.045, type: "square", gain: 0.45 },
      { frequency: 760, duration: 0.055, type: "triangle", gain: 0.35, delay: 0.04 },
    ],
    0.08,
  );
};

export const playTimerStopSound = () => {
  playTones(
    [
      { frequency: 740, duration: 0.055, type: "triangle", gain: 0.34 },
      { frequency: 540, duration: 0.07, type: "sine", gain: 0.28, delay: 0.045 },
    ],
    0.075,
  );
};

export const playSessionCoinsSound = () => {
  // quiet coin cascade 2-3 notes
  playTones(
    [
      { frequency: 920, duration: 0.05, type: "triangle", gain: 0.42 },
      { frequency: 1180, duration: 0.06, type: "triangle", gain: 0.36, delay: 0.04 },
      { frequency: 1460, duration: 0.07, type: "sine", gain: 0.3, delay: 0.09 },
    ],
    0.082,
  );
};

export const playUiTabClickSound = () => {
  playTones([{ frequency: 620, duration: 0.032, type: "triangle", gain: 0.3 }], 0.07);
};

export const playHoverItemSound = () => {
  const now = Date.now();
  if (now - lastHoverAt < 32) return;
  lastHoverAt = now;

  playTones(
    [{ frequency: 860, duration: 0.024, type: "sine", gain: 0.2 }],
    0.055,
  );
};
