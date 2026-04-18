export let audioCtx: AudioContext | null = null;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Organic tactile tap (like typing on thick paper or a muted woodblock).
// Deeply satisfying tactile dopamine without high-frequency fatigue.
export function playClick() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  // Low, mellow fundamental that drops quickly (thock)
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, t);
  osc.frequency.exponentialRampToValueAtTime(120, t + 0.03);
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.4, t + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  
  osc.start(t);
  osc.stop(t + 0.03);
}

// A subtle, grounding heartbeat. 
// Brings focus back and prompts action without adrenaline shock/distraction.
export function playWarning() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;

  // Two deep, soft pulses
  [0, 0.3].forEach(offset => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.connect(gain); gain.connect(audioCtx!.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t + offset); 
    
    // Gentle swell
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.7, t + offset + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.3);
    
    osc.start(t + offset);
    osc.stop(t + offset + 0.3);
  });
}

// A muffled, soft chalk-like erasure.
export function playDelete() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain); gain.connect(audioCtx.destination);
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.3, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  
  osc.start(t);
  osc.stop(t + 0.05);
}

// A warm, ambient, lush chord (Electric Piano / Rhodes vibe)
// Invokes a feeling of deep clarity, reward, and flow state.
export function playSuccess() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  
  // Warm, open, meditative chord (Db Major 9)
  const notes = [138.59, 277.18, 349.23, 415.30, 523.25]; 
  
  notes.forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    const filter = audioCtx!.createBiquadFilter();

    osc.connect(filter); filter.connect(gain); gain.connect(audioCtx!.destination);
    
    // Mix sines and triangles for a warm electronic piano sound
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + 2.0);
    
    const offset = i * 0.04; // slight strum/roll effect
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.25, t + offset + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 2.0);
    
    osc.start(t + offset);
    osc.stop(t + offset + 2.0);
  });
}

// A gentle, fading exhale / tape slow-down.
// Signals closure and resets focus without punishment.
export function playGameOver() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain); gain.connect(audioCtx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(20, t + 0.8);
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.8, t + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  
  osc.start(t);
  osc.stop(t + 0.8);
}

