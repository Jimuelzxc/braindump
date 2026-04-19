# AGENTS.md Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an `AGENTS.md` file that provides strict, high-signal information about repository quirks so future agents do not make assumptions about standard React/Vite/Tailwind configurations.

**Architecture:** A single markdown file residing at the root of the repository, containing precisely formatted commands, alias quirks, and environment variable rules discovered during the brainstorming investigation.

**Tech Stack:** Markdown.

---

### Task 1: Create `AGENTS.md`

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Verify pre-existing state**

Run: `ls AGENTS.md` (or check if it exists)
Expected: Usually not existing or empty. If it does exist, we will overwrite it with the verified content.

- [ ] **Step 2: Write minimal implementation**

Create/overwrite `AGENTS.md` with:

```markdown
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
```

- [ ] **Step 3: Verify the implementation**

Run: `cat AGENTS.md` (or your platform's equivalent view command)
Expected: PASS if the file exactly matches the snippet above. 

- [ ] **Step 4: Commit the changes**

Run:
```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md instructions for agents"
```
