# Panic Attack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase adrenaline inside the Brain Dump app by adding an escalating Web Audio heartbeat and CSS shake animation when approaching game over.

**Architecture:** Modifies Web Audio functions in `src/lib/audio.ts` to support looping heartbeat state. Modifies `src/index.css` with Tailwind/CSS shake classes. Modifies the primary `tick` function in `src/App.tsx` to mount these effects seamlessly.

**Tech Stack:** React, Tailwind CSS v4, Web Audio API.

---

### Task 1: CSS Setup for Visual Shake

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Write minimal implementation**

Append the keyframes and utility class to `src/index.css`:

```css
@theme {
  --animate-panic-shake: panic-shake 0.2s cubic-bezier(.36,.07,.19,.97) infinite;
  
  @keyframes panic-shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
    40%, 60% { transform: translate3d(2px, 0, 0); }
  }
}

.animate-panic-shake {
  animation: var(--animate-panic-shake);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: add panic-shake CSS animation"
```

---

### Task 2: Audio Heartbeat Logic

**Files:**
- Modify: `src/lib/audio.ts`

- [ ] **Step 1: Write the minimal implementation**

Add the heartbeat controller logic to the bottom of `src/lib/audio.ts`:

```typescript
let heartbeatTimer: number | null = null;
let currentHeartbeatRate = 1.0;

function triggerSingleBeat() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(55, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.8, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  
  osc.start(t);
  osc.stop(t + 0.15);

  // Schedule next beat relative to the rate
  const delayMs = Math.max(200, 1000 / currentHeartbeatRate);
  heartbeatTimer = window.setTimeout(triggerSingleBeat, delayMs);
}

export function startHeartbeat() {
  if (heartbeatTimer !== null) return; // already running
  triggerSingleBeat();
}

export function stopHeartbeat() {
  if (heartbeatTimer !== null) {
    clearTimeout(heartbeatTimer);
    heartbeatTimer = null;
  }
}

export function setHeartbeatRate(rate: number) {
  currentHeartbeatRate = rate;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/audio.ts
git commit -m "feat: add heartbeat looping engine to Web Audio API"
```

---

### Task 3: Integrating Panic Attack into Application Logic

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the minimal implementation**

In `src/App.tsx`:
1. Import `startHeartbeat, stopHeartbeat, setHeartbeatRate` from `./lib/audio`.
2. Find `const tick = () => {` loop inside `WritingScreen`.
3. Locate `if (idleTime < warn) {` and inject `stopHeartbeat();` inside it.
4. Locate `} else if (idleTime < decay) {` and inject:
```typescript
        // Warning/Squeezing
        if (!isEraseMode) {
          startHeartbeat();
          const ratio = (idleTime - warn) / (decay - warn);
          setHeartbeatRate(1.0 + (ratio * 3.0));
```
5. Inside the Panic Phase (`} else {`), ensure `stopHeartbeat();` is paired seamlessly with `playGameOver()`. Add it there.
6. Make sure `useEffect` cleanup for `WritingScreen` calls `stopHeartbeat()` directly to handle sudden component unmounting.
7. Wrap the `<textarea>` container in `animate-panic-shake` conditionally.
  
Update `WritingScreen` component return DOM:

Replace:
```typescript
        <div 
          className={`relative rounded-lg overflow-hidden border border-solid ${isGameoverPhase ? 'animate-crt-off' : 'transition-[height_border-color] duration-[120px_400ms]'} ${isDanger ? 'bg-[#1a0808]' : 'bg-[#111]'}`}
```
With:
```typescript
        <div 
          className={`relative rounded-lg overflow-hidden border border-solid ${isGameoverPhase ? 'animate-crt-off' : 'transition-[height_border-color] duration-[120px_400ms]'} ${isDanger ? 'bg-[#1a0808]' : 'bg-[#111]'} ${(idleTime - warn) / (decay - warn) >= 0.85 && !isGameoverPhase && !isEraseMode ? 'animate-panic-shake' : ''}`}
```

Add inside `useEffect` in `WritingScreen`:
```typescript
    return () => {
      cancelAnimationFrame(raf);
      stopHeartbeat();
    };
```

Update `} else {` block for Game over:
```typescript
        // Panic Phase
        if (!isEraseMode) {
          stopHeartbeat();
          // CRT Game Over trigger
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: hook app logic to panic feedback modules"
```
