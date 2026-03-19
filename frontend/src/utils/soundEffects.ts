type Tone = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
};

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {
      // no-op: browsers can block autoplay until direct user interaction
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

    const toneGain = (tone.gain ?? 1) * masterGain;
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(toneGain, startAt + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  });
};

export const playSellSound = () => {
  playTones(
    [
      { frequency: 700, duration: 0.07, type: "triangle", gain: 0.85 },
      { frequency: 980, duration: 0.09, type: "triangle", gain: 0.7, delay: 0.06 },
      { frequency: 1320, duration: 0.1, type: "sine", gain: 0.6, delay: 0.12 },
    ],
    0.1,
  );
};

export const playChestOpenSound = () => {
  playTones(
    [
      { frequency: 230, duration: 0.2, type: "triangle", gain: 1 },
      { frequency: 310, duration: 0.16, type: "triangle", gain: 0.8, delay: 0.06 },
      { frequency: 480, duration: 0.2, type: "sine", gain: 0.55, delay: 0.12 },
    ],
    0.09,
  );
};

export const playRewardFlipSound = () => {
  playTones(
    [
      { frequency: 540, duration: 0.06, type: "square", gain: 0.4 },
      { frequency: 760, duration: 0.05, type: "square", gain: 0.26, delay: 0.05 },
    ],
    0.06,
  );
};
