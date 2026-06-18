## What to build

The core **Color Inventory** feature in the `tidy-color-finder` module: point the plugin at a scope, scan it entirely inside Figma (no AI, nothing leaves the file), and generate a dated inventory page that lists every color grouped by role with usage counts, token status, and links to where it's used.

This replaces the current placeholder `scan-colors` action and its UI.

**Build it skeleton-first to de-risk the test seam early** (this is build order, not separate tickets): get the thinnest end-to-end path working first — current-page scan, backgrounds only, through the pure aggregator into a minimal rendered page — then add breadth (all roles, full scope picker, options, full row detail).

**Input panel — three zones:**
- *Scope picker:* a scrollable list of every page with checkboxes (multi-select, shift-click for a range), plus quick buttons **Current page · Selected pages · All pages · Current selection**.
- *Options* (all with defaults so Run works immediately): Include **Backgrounds / Text / Borders** (all on); **Skip colors already bound to a variable/style** (off); **Look inside component instances** (off — when off, traversal does not descend into `INSTANCE` children, though the instance node's own fills/strokes are read).
- *Run:* a progress line (`Scanning 3 pages · 4,120 nodes`) then a result line linking to the generated page.

**Categorization rule (purely mechanical — no semantic guessing):**
- visible SOLID fill on a `TEXT` node → **Text**
- any visible SOLID stroke → **Border**
- any other visible SOLID fill → **Background**
- gradient / image / video paints → **Other**, excluded from the tables, counted in an "other/skipped" summary line.

**Pure aggregation core (the test seam).** Traversal emits a flat, serializable `ColorUsage[]` (no live Figma nodes); a pure `buildColorInventory(usages, options)` returns the full inventory model. Shape (from PRD prototype sketch — encodes decisions, not final code):

```ts
interface ColorInventory {
  summary: { pagesScanned: number; uniqueTotal: number;
             byRole: Record<Role, number>; untokenized: number; otherSkipped: number };
  sections: Array<{
    role: "background" | "text" | "border";
    colors: Array<{
      hex: string; opacity: number; hsl: { h: number; s: number; l: number };
      count: number; tokenName: string | null;
      whereUsed: Array<{ id: string; name: string; type: string }>; // capped ~10
      whereUsedOverflow: number; // the "and N more" remainder
    }>;
  }>;
}
```

Grouping by role, dedup by **hex + opacity**, count summation, default sort (usage count desc), where-used cap + overflow, and summary totals all live in this pure function.

**Color identity & token status.** Key = uppercase `#RRGGBB` + paint opacity. Token status reads paint-level `boundVariables` and the node's `fillStyleId`/`strokeStyleId`, resolving to the variable/style **name** when bound, else "Raw". When *Skip tokenized* is on, bound usages are dropped before aggregation.

**Where-used.** For each usage, walk ancestors to the nearest container: enclosing `COMPONENT_SET`, else nearest `SECTION`, else the top-level node under the page. A color's where-used is the **distinct** set of those containers, capped at the top ~10 by per-container count with an "and N more" remainder, rendered as Figma node-links to the container (not individual nodes).

**Output page.** A new page `Color Inventory — {scope} — {date}` in auto-layout: a summary block (pages scanned; totals like "38 unique colors — 19 background, 11 text, 8 border; 31 untokenized"), then three table sections — **Backgrounds · Text · Borders** — each sorted by usage count desc. Each row: swatch (filled with the real color) · hex (+ opacity when not 100%) · optional HSL column · token status · count · where-used node-links (capped) · an empty **→ Token** column for hand-filling semantic names.

For multi-page scopes, load each target page (async) before walking it. The plugin makes no semantic judgments (never infers primary/danger/etc.) and creates/binds no tokens — the inventory is read-only analysis.

## Acceptance criteria

- [ ] Scope picker lists all document pages with checkboxes (multi-select + shift-range) and the four quick-scope buttons; selecting a quick button sets the scope correctly.
- [ ] Run with default options scans the chosen scope and produces a new auto-layout page named `Color Inventory — {scope} — {date}`.
- [ ] A progress line updates during the scan; on completion a result line links to the generated page.
- [ ] Colors are categorized by the mechanical rule (text-node fill → Text; stroke → Border; other fill → Background; gradient/image → other/skipped, excluded from tables).
- [ ] Colors are deduplicated by hex + opacity (same hex at two opacities = two rows); counts are summed across usages.
- [ ] Each section is sorted by usage count, most-used first.
- [ ] Each row shows swatch, hex (+ opacity when ≠100%), HSL, token status (variable/style name or "Raw"), count, capped where-used container node-links with "and N more", and an empty → Token cell.
- [ ] Where-used links resolve to containers (component set / section / top-level frame), not individual nodes.
- [ ] "Skip colors already bound to a variable/style" excludes bound usages when on; off by default shows them marked with their token name.
- [ ] "Look inside component instances" off by default does not descend into instance children; on, it does.
- [ ] The summary block reports pages scanned and the role/untokenized/other totals.
- [ ] Multi-page scopes load pages on demand and complete without lazy-load errors.
- [ ] `buildColorInventory` is a pure function (no Figma dependency) covered by Vitest: grouping by role, dedup by hex+opacity, count summation, default sort order, where-used cap + overflow count, token-name passthrough, summary totals, and gradient/image → other/skipped counting. (Vitest added to this repo, mirroring the parent toolbox's iconfinder hash tests.)
- [ ] No network access (manifest `allowedDomains: ["none"]`); the Figma traversal, page loading, token-name resolution, and page renderer are verified manually in Figma.

## Blocked by

None - can start immediately.
