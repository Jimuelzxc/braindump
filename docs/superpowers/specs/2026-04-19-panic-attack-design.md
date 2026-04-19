# Panic Attack Sensory Feedback Design

## Architecture & Goal
The goal is to increase adrenaline and visual tension for users during the "decay/pressure" phase of Brain Dump. We will achieve this by adding a heartbeat audio loop that dynamically speeds up, combined with a violent UI shake animation when game over is imminent.

## Components & Data Flow

1. **Audio Mechanism (`src/lib/audio.ts`)**:
   - Add `startHeartbeat()` and `stopHeartbeat()` functions.
   - Add a `setHeartbeatRate(rate: number)` function that modifies the pitch/speed.
   - We will implement this using the Web Audio API (a low-frequency oscillator popping rapidly like a heartbeat) to ensure it works cleanly without wrestling with HTML5 Audio looping gaps or external file dependencies.

2. **Visual Shake (`src/index.css`)**:
   - Define `@keyframes panic-shake` that applies `transform: translate()` back and forth rapidly (e.g. `2px` left/right and up/down).
   - Create a `.animate-panic-shake` class mapping to `panic-shake` running infinitely over `0.2s` for a violent stutter.

3. **Integration into Tick Loop (`src/App.tsx`)**:
   - In `WritingScreen`, inside the `tick()` `requestAnimationFrame` function:
     - **Safe state (`idleTime < warn`)**: Call `stopHeartbeat()`, and `setIsShaking(false)`.
     - **Danger state (`warn <= idleTime < decay`)**: Call `startHeartbeat()`. Calculate the tension ratio: `const ratio = (idleTime - warn) / (decay - warn)`.
     - Apply that ratio to the audio speed using `setHeartbeatRate(1.0 + ratio * 2.0)` (scaling the tempo as time decreases).
     - **Panic state (`ratio >= 0.85`)**: If the user is in the final 15% of their time limit, set `setIsShaking(true)`. Otherwise `false`.
   - Apply the `.animate-panic-shake` CSS class to the primary editor container when `isShaking` is true.

## Error Handling & Resiliency
- Strict checks to only initialize the Web Audio API context after the user has interacted with the page (the `Start` button press already does this via `initAudio()`). 
- When navigating away from `WritingScreen` (e.g. game over), aggressively call `stopHeartbeat()`.
