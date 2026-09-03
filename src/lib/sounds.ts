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

    // iOS puts Web Audio in the "ambient" audio session, which the physical
    // ringer switch silences — unlike <audio> elements. Safari's AudioSession
    // API lets us opt into "playback", which ignores the switch. Set before
    // constructing the context; harmlessly absent on other browsers.
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) {
      try {
        nav.audioSession.type = "playback";
      } catch {
        // Not fatal — we just stay subject to the ringer switch.
      }
    }

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

function scheduleArpeggio(ctx: AudioContext) {
  // Small lead-in: scheduling exactly at currentTime can clip the attack.
  const now = ctx.currentTime + 0.02;
  // Major arpeggio: C5, E5, G5, C6 — bright and happy.
  const arpeggio = [523.25, 659.25, 783.99, 1046.5];
  arpeggio.forEach((freq, i) => {
    playNote(ctx, freq, now + i * 0.08, 0.35, 0.16, "triangle");
  });

  // A high sparkle to top it off.
  playNote(ctx, 1567.98, now + arpeggio.length * 0.08 + 0.02, 0.5, 0.09, "sine");
}

export function playSuccessSound() {
  const ctx = getCtx();
  if (!ctx) return;

  // A suspended context's currentTime doesn't advance, so scheduling before
  // resume() settles puts every note in the past and nothing is heard. resume()
  // still has to be called from the gesture — it is, since this runs from the
  // click handler — but the notes must wait for it.
  if (ctx.state === "suspended") {
    ctx.resume().then(() => scheduleArpeggio(ctx)).catch(() => {});
    return;
  }

  scheduleArpeggio(ctx);
}
