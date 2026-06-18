# Tidy Color Finder

A Figma plugin for finding and tidying colors. Built to drop into the
**Tidy DS Toolbox** later as a sub-module with minimal changes.

## Architecture

Dual-threaded, mirroring the parent Tidy DS Toolbox:

- **UI thread** — React 19, bundled by **Vite** (`vite-plugin-singlefile` →
  single `dist/index.html`). Entry: `src/main.tsx` → `src/App.tsx`.
- **Plugin thread** — Figma API code, bundled by **esbuild** → `dist/code.js`.
  Entry: `src/code.ts`.

The two threads talk only via typed `postMessage` using the envelope
`{ target, action, payload, requestId }` (`src/shared/bridge.ts`).

### The migrating module

The actual feature lives in `src/plugins/tidy-color-finder/` as three files,
following the parent's module convention exactly:

- `ui.tsx` — exports `TidyColorFinderUI` (React component)
- `logic.ts` — exports `tidyColorFinderHandler(action, payload, figma?)`
- `types.ts` — exports the `TidyColorFinderAction` union + payloads

Imports inside these files (`@shell/components`, `@shared/bridge`, `./types`)
resolve identically in both repos because this project replicates the parent's
`@shell` / `@plugins` / `@shared` path aliases (tsconfig + vite). Everything
outside that folder (`App.tsx`, `code.ts`, `src/shared/*`, `src/components/*`,
build config) is throwaway shell — the toolbox supplies its own.

**To migrate into the toolbox:** copy `src/plugins/tidy-color-finder/` in, then
add it to `moduleRegistry.ts`, `moduleHandlers.ts`, and the `PluginID` union.

## Commands

```bash
npm install
npm run build       # build UI (Vite) + plugin code (esbuild)
npm run build:ui    # UI only
npm run build:main  # plugin code only
npm run typecheck   # tsc --noEmit
```

Build generates `dist/code.js` and `dist/index.html`.

## Install in Figma

1. Open the Figma desktop app.
2. Plugins → Development → **Import plugin from manifest…**
3. Select `manifest.json`.

## Status

The current scan (solid fill & stroke colors → unique color list) is a
**placeholder** that proves the bridge wiring end to end. The real
color-tidying behaviour is still to be defined.
