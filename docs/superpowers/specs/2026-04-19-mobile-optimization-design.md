# Mobile Optimization Design Spec

## Goal
Ensure "Brain Dump" offers a flawless UI/UX on mobile devices, handling screen resolution limitations, on-screen keyboard spacing constraints, and low-end GPU performance issues.

## 1. Dynamic Canvas Layout (Shrink Mode)
Instead of a hardcoded `MAX_H = 360` for the typing container:
- `MAX_H` will be dynamically calculated via `window.innerHeight`.
- If `window.innerWidth < 640` (mobile), the container's max height will scale up relative to the viewport height (approx 55vh), allowing space for the on-screen keyboard, while still providing enough room for the box to actively "shrink" via the game loop.
- `MIN_H` remains `44px` across all devices.

## 2. Fog Performance Caps
Phones often lag when recalculating high-radius CSS blurs 60 times a second.
- We will cap the `fogBlur` max value on small screens (`window.innerWidth < 640`).
- Instead of peaking at `12px` blur in the danger zone, mobile will peak at `4px` blur and rely more heavily on `opacity` fading to ensure a 60fps stable experience.

## 3. Grid & Typography Responsive Scaling
- **Start Screen:** The `Settings` layout and modes will transition from fixed `w-[460px]` blocks to fluid width `w-full max-w-[460px] px-4`.
- **End Screen:** The Grid stats (words, time, wpm) will be `grid-cols-2` on mobile (using `grid-cols-2 sm:grid-cols-4`) to prevent text clipping.
- **Text Area Size:** The main editor font size will drop slightly from `15px` to `16px` (ironically, 16px is required on iOS to prevent automatic page zooming on focus) and adjust line heights appropriately.

## Execution
All changes will be housed natively within `src/App.tsx` and standard Tailwind CSS breakpoints (`sm:` suffix). No external libraries are needed.
