# Repository Instructions for Agents

This repository has specific quirks that deviate from standard React/Vite defaults. You MUST follow these rules when working in this codebase:

## 1. Commands & Workflows
- **Testing**: There is NO test runner configured initially. Do not attempt to run tests.
- **Linting**: `npm run lint` only performs TypeScript typechecking (`tsc --noEmit`). There is NO ESLint or Prettier setup.
- **Dev Server**: The standard dev server binds to `0.0.0.0:3000`. Use `npm run dev` to start it.

## 2. Key Architecture & Quirks (The Gotchas)
- **Path Aliases**: The alias `@` resolves to the project root directory (`.`), **NOT** to `src/`. Do not assume standard `src/` aliasing. Example: use `import '@/src/App'` instead of `import '@/App'`.
- **Environment Variables**: The GenAI SDK requires `GEMINI_API_KEY`. This is manually injected via `vite.config.ts`'s `define` block. In UI code, it MUST be accessed via `process.env.GEMINI_API_KEY`, rather than standard Vite `import.meta.env.*`.
- **HMR Behavior**: File watching for Hot Module Replacement is actively turned off if the environment variable `DISABLE_HMR=true` is used (this is common for AI Studio configurations).
- **Framework Versions**: 
  - Uses Tailwind CSS **v4** (there is no `tailwind.config.js`). Do not try to create or edit tailwind v3 configs.
  - Rely directly on the `motion` package for animations, rather than `framer-motion`.

*End of Document. Do not invent generic rules.*
