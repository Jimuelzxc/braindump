# Memory Fog Design Spec

## Goal
Make the "Erase Mode" penalty phase deeply thematic by causing the user's previously written text to violently blur and vanish into the background as their thoughts slip away, right before the text physically deletes.

## Overview
When a user goes idle in Erase Mode and enters the `< decay` danger window, the `<textarea>` container will dynamically scale its `filter: blur()` and drop its `opacity`, obscuring the words.

## Component & Logic Details (`src/App.tsx`)
Inside the `WritingScreen` component, we will calculate a `fog` ratio in the `requestAnimationFrame` loop `tick()` when `appMode === 'erase'`.
- **Safe Phase:** No blur, 100% opacity.
- **Danger Phase (Warning to Decay):**
  - Calculate `ratio = (idleTime - warn) / (decay - warn)`
  - Map `ratio` to `opacity` (shrinks from 1.0 down to 0.15)
  - Map `ratio` to `blur` (grows from 0px to 10px)
- **Erase Phase (Game Over / Actively Deleting):**
  - Opacity sits at `0.15`, Blur sits at `10px`. 
  - Text slowly deletes character by character from the end.

## CSS Transition
The `textarea` will have a `transition` applied to `filter` and `opacity` with a snappy `duration-200` to ensure that when a user "saves" themselves by pressing a key, the fog lifts almost instantly, returning them to a clean writing state without lag.

## Fallback / Safety
If the user switches to Shrink Mode, this fog calculation returns to 0 (no effect). It is strictly isolated to Erase mode.
