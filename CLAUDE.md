# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`tidy-color-finder` is a Figma plugin for finding and tidying colors. It is built
to drop into the **Tidy DS Toolbox** later as a sub-module with minimal changes,
so it mirrors that project's architecture (React 19 + Vite UI, esbuild plugin
thread, `{ target, action, payload, requestId }` postMessage bridge). The
migrating feature lives in `src/plugins/tidy-color-finder/` as the three-file
module pattern (`ui.tsx` / `logic.ts` / `types.ts`); everything else is throwaway
standalone shell. See `README.md` for the full architecture and migration notes.

## Commands

```bash
npm install
npm run build       # build UI (Vite) + plugin code (esbuild) → dist/
npm run build:ui    # UI only
npm run build:main  # plugin code only
npm run typecheck   # tsc --noEmit
```

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues on `tidy-dev-team/tidy-color-finder` (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles map 1:1 to GitHub label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily). See `docs/agents/domain.md`.
