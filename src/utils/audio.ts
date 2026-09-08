// Accessible Speech Synthesis and Audio Tone Synthesizer for Blind Navigation Stick

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTone(frequency: number = 880, durationMs: number = 150, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Gracefully ignore audio context restrictions if blocked by browser policy
  }
}

export function playAlarmCadence() {
  playTone(950, 200, 'square');
  setTimeout(() => playTone(1400, 250, 'sawtooth'), 220);
}

export function speakAnnouncement(text: string, voiceEnabled: boolean = true) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // cancel previous utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors
  }
}
