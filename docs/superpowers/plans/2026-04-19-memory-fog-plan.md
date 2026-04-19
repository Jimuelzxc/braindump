# Memory Fog Implementation Plan

**Goal:** Apply a progressive blur and opacity fade to the `textarea` text natively in React based on the user's penalty phase ratio in Erase mode, creating a "memory fog" that clears instantly when typing resumes.

---

### Task 1: Add Fog State and CSS Modifiers
**File to modify:** `src/App.tsx`

- [ ] Inside `WritingScreen`, create two state variables holding the current blur radius and opacity, mapped from the tick loop:
  `const [fogBlur, setFogBlur] = useState(0);`
  `const [fogOpacity, setFogOpacity] = useState(1);`
- [ ] Add the required CSS inline styles to the `<textarea>` to map to these states: `opacity: fogOpacity`, `filter: \`blur(${fogBlur}px)\``.
- [ ] Add Tailwind transitions to the `textarea` `className`: `transition-[filter_opacity] duration-200 ease-out`.

### Task 2: Implement Fog Tick Logic
**File to modify:** `src/App.tsx`

- [ ] In the `tick` requestAnimationFrame loop, find the `if (idleTime < warn)` zone. If `isEraseMode` is true, immediately clear the fog states: `setFogBlur(0); setFogOpacity(1)`.
- [ ] Find the `} else if (idleTime < decay)` zone. If `isEraseMode`, calculate `ratio = (idleTime - warn) / (decay - warn)`, cap it at 1.0. Set `setFogBlur(ratio * 12);` and `setFogOpacity(1.0 - (ratio * 0.85));`.
- [ ] Find the panic loop `} else {`. For `isEraseMode`, ensure the blur stays maxed out during active deletion: `setFogBlur(12); setFogOpacity(0.15);`.

### Task 3: Commit
- [ ] Commit with `feat: add memory fog effect to erase mode`. 
