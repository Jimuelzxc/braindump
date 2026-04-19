# AGENTS.md Format Design

## Purpose
The purpose of `AGENTS.md` is to serve as a compact instruction file for future agent sessions. It provides high-signal information about repository quirks, minimizing context-gathering mistakes while omitting generic advice.

## Required Information

### 1. Commands & Workflows
- **Testing**: No test runner configured yet. Do not attempt to run tests.
- **Linting**: `npm run lint` only performs TypeScript typechecking (`tsc --noEmit`), there is no ESLint or Prettier setup.
- **Dev Server**: Standard dev server starts on `0.0.0.0:3000` (`npm run dev`).

### 2. Key Architecture & Quirks
- **Path Aliases**: The alias `@` resolves to the project root directory (`.`), **NOT** `src/`. This distinguishes imports strongly from standard setups (e.g., `import '@/src/App'`).
- **Environment Variables**: The `GEMINI_API_KEY` is manually injected globally via `vite.config.ts`. It must be accessed via `process.env.GEMINI_API_KEY`, rather than `import.meta.env.*`.
- **HMR Behavior**: File watching for Hot Module Replacement is actively turned off if the environment variable `DISABLE_HMR=true` is used (common for AI Studio setups).
- **Framework Versions**: The project uses Tailwind CSS v4 (no `tailwind.config.js`) and relies directly on the `motion` package rather than `framer-motion`.

## Exclusions Checks
- No speculative claims
- No generic AI/LLM software advice
- No exhaustive file trees
