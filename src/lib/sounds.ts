// Synthesized celebration sound using the Web Audio API — no audio assets.
// Plays a cheerful ascending arpeggio with a little sparkle on top.

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function playNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gain = 0.18,
  type: OscillatorType = "triangle"
) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Quick attack, smooth exponential decay.
  env.gain.setValueAtTime(0.0001, startTime);
  env.gain.exponentialRampToValueAtTime(gain, startTime + 0.015);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(env);
  env.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export function playSuccessSound() {
  const ctx = getCtx();
  if (!ctx) return;

  // Some browsers suspend the context until a user gesture; this runs from a
  // click handler, so resume() is allowed here.
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  // Major arpeggio: C5, E5, G5, C6 — bright and happy.
  const arpeggio = [523.25, 659.25, 783.99, 1046.5];
  arpeggio.forEach((freq, i) => {
    playNote(ctx, freq, now + i * 0.08, 0.35, 0.16, "triangle");
  });

  // A high sparkle to top it off.
  playNote(ctx, 1567.98, now + arpeggio.length * 0.08 + 0.02, 0.5, 0.09, "sine");
}
