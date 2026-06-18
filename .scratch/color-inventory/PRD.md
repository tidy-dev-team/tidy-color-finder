# PRD: Color Inventory (tidy-color-finder)

Status: ready-for-agent

## Problem Statement

When a designer starts cleaning up or tokenizing a project's colors — especially
after inheriting a client file that was never properly tokenized — they do it by
hand. They hunt through the file to find every background, text, and border
color, write down the hex values, and track where each one is actually used,
all before they can even begin deciding on a sensible set of semantic tokens.

On real projects this is a swamp. Clarity reportedly burned ~200 hours on
colors; SpeakNow's color decisions churned for weeks. The expensive part isn't
the *deciding* — it's the *searching*: assembling a complete, accurate picture
of what colors exist, how often, and where, which today takes hours of manual
inspection and is never fully trustworthy.

These are frequently client files under NDA, so any tool that sends file
contents to an external service (AI or otherwise) is a non-starter.

## Solution

`tidy-color-finder` removes the manual hunting. The designer points it at the
pages they're working on; it scans the file entirely inside Figma (no AI,
nothing leaves the file) and produces a clean **Color Inventory** page: every
color grouped by role (Background / Text / Border), with its hex, opacity,
usage count, whether it's already bound to a variable/style or still raw, and
node-links straight to the containers where it appears.

The designer then works *from* that table instead of from a blank file. They can
see at a glance which colors are real and recurring versus one-off noise, spot
near-duplicates that should collapse into one token, and use an optional
`→ Token` column to write in semantic names by hand — turning the inventory into
the working sheet for the actual mapping decision.

The plugin makes **no semantic judgment calls** — it never guesses what's
"danger" or "primary". Categorization is purely mechanical (where the color sits
in the node tree), so the output is raw facts the senior designer acts on, not
opinions they have to second-guess. The half-day MVP ships exactly this:
an input panel and a generated inventory page.

## User Stories

1. As a designer cleaning up a client file, I want to scan selected pages for all colors, so that I don't have to hunt for them by hand.
2. As a designer, I want to choose exactly which pages get scanned, so that I only inventory the part of the file I'm working on.
3. As a designer, I want quick-scope buttons (Current page, Selected pages, All pages, Current selection), so that I can set common scopes in one click without ticking boxes.
4. As a designer, I want to multi-select pages with checkboxes and shift-click a range, so that I can pick an arbitrary set of pages quickly.
5. As a designer, I want to include or exclude Backgrounds, Text, and Borders independently, so that I can focus the inventory on the color role I care about right now.
6. As a designer, I want all three role toggles on by default, so that I can just hit Run without configuring anything.
7. As a designer, I want an option to skip colors already bound to a variable or style (off by default), so that I can choose to surface only the raw hex when I want to.
8. As a designer, I want raw and tokenized colors both shown by default with their token status marked, so that I can see what's already a token versus what still needs one rather than having tokenized colors hidden.
9. As a designer, I want an option to look inside component instances (off by default), so that by default I count design-level usage rather than every instance's internal repeats.
10. As a designer, I want a progress line while scanning ("Scanning 3 pages · 4,120 nodes"), so that I know the plugin is working on large files.
11. As a designer, I want a result line that links to the generated page when the scan finishes, so that I can jump straight to the output.
12. As a designer, I want the scan to run entirely inside Figma with nothing leaving the file, so that I can use it on NDA client work without approval.
13. As a designer, I want the output written to a new dedicated page named `Color Inventory — {scope} — {date}`, so that I can archive it and keep multiple inventories without clobbering each other.
14. As a designer, I want the inventory laid out in auto-layout, so that it stays clean and tidy if I resize or rearrange it.
15. As a designer, I want a summary block at the top (pages scanned; totals such as "38 unique colors — 19 background, 11 text, 8 border; 31 untokenized"), so that I get the headline numbers before reading the tables.
16. As a designer, I want three table sections — Backgrounds, Text, Borders — so that colors are grouped by the role they play.
17. As a designer, I want each section sorted by usage count, most-used first, so that the colors most worth tokenizing rise to the top.
18. As a designer, I want a color swatch on each row filled with the real color, so that I can see the actual color, not just read a hex string.
19. As a designer, I want the hex value on each row, with opacity shown when it isn't 100%, so that I can tell a translucent usage apart from a solid one.
20. As a designer, I want an optional HSL column, so that I can spot harmonic groups and near-duplicate colors by eye.
21. As a designer, I want a token-status column showing the bound variable/style name or "Raw", so that I can instantly tell what's already a token from what's loose hex.
22. As a designer, I want a usage count per color, so that I can distinguish recurring colors from one-off noise.
23. As a designer, I want a "where used" column listing the distinct containers a color appears in (component set / top-level frame / section), so that I know which parts of the design a color lives in.
24. As a designer, I want each "where used" entry to be a Figma node-link, so that I can click to jump straight to that container.
25. As a designer, I want "where used" to link to containers rather than individual nodes, so that "this red lives in Button, Card, and Banner" is actionable instead of a list of 200 node IDs.
26. As a designer, I want the "where used" list capped (top ~10 containers + "and N more"), so that a color used 200× doesn't explode the table.
27. As a designer, I want an optional empty `→ Token` column, so that I can write semantic names directly in the table and use it as my mapping worksheet.
28. As a designer, I want a color that appears in both a fill and a stroke to be counted under the correct role each time, so that the role tables reflect how the color is actually used.
29. As a designer, I want colors deduplicated by hex *and* opacity, so that the same hex at two different opacities is two rows, not one.
30. As a designer, I want gradients and image fills to be treated as Other or skipped rather than mis-reported as a solid color, so that the inventory stays accurate.
31. As a designer, I want the plugin to never auto-assign semantic meaning (primary/danger/etc.), so that I keep full control of the naming decision.
32. As a designer, I want to copy the inventory as a markdown table, so that I can paste it into a doc or ticket outside Figma.
33. As a designer, I want a sort-by-hue toggle, so that I can reorder the tables to group visually-similar colors instead of by usage count.
34. As a designer scanning a large multi-page file, I want pages loaded on demand as they're scanned, so that the scan completes without hitting Figma's lazy-page-loading limits.
35. As a designer, I want to re-run a scan and get a fresh dated page, so that I can compare before/after as I tokenize.
36. As a maintainer, I want this feature contained in the `tidy-color-finder` module's three-file pattern, so that it later drops into the Tidy DS Toolbox by copying the folder and adding three registration lines.

## Implementation Decisions

**Module.** The work lives entirely in the existing `tidy-color-finder` module
(`ui.tsx` / `logic.ts` / `types.ts` + a `utils/` folder), following the parent
Tidy DS Toolbox three-file convention. The current placeholder `scan-colors`
action and its UI are replaced. No shell, build, or registration changes outside
the module — migration into the toolbox stays "copy folder + register in
`moduleRegistry`, `moduleHandlers`, and the `PluginID` union".

**Bridge actions** (`TidyColorFinderAction` union, dispatched through the
existing `{ target, action, payload, requestId }` envelope):
- `list-pages` — return the document's pages (id, name, isCurrent) to populate
  the scope picker.
- `scan-colors` — given a resolved scope + options, run the scan, build the
  inventory page, and return a result summary plus the new page's node id.
- The main thread emits `progress` shell-style messages (`{ pagesScanned,
  totalPages, nodesScanned }`) during the scan; the UI renders the progress line.

**Scope resolution.** The `scan-colors` payload carries an explicit scope:
`{ mode: "current-page" | "selected-pages" | "all-pages" | "current-selection",
pageIds?: string[] }`. The handler resolves `mode` to a concrete set of root
nodes: whole pages for the page modes, `figma.currentPage.selection` for
`current-selection`. The generated page name's `{scope}` segment is a short
human label derived from the mode (e.g. "Current page", "3 pages", "Selection").

**Options.** `{ includeBackgrounds, includeText, includeBorders }` (all default
true), `skipTokenized` (default false), `lookInsideInstances` (default false).
When `lookInsideInstances` is false, traversal does not descend into the
children of `INSTANCE` nodes (the instance node's own fills/strokes are still
read). When `skipTokenized` is true, usages whose paint is bound to a variable
or style are dropped before aggregation.

**Categorization rule** (purely mechanical, the only role logic in the system):
- a visible SOLID fill on a `TEXT` node → **Text**
- any visible SOLID stroke (any node type) → **Border**
- any other visible SOLID fill → **Background**
- gradient / image / video paints → **Other**, excluded from the three tables
  (counted in an "Other/skipped" line of the summary, not rendered as a row).

Severity/accent is deliberately never inferred.

**Color identity.** A color is keyed by `hex` + `opacity` (paint opacity,
rounded to a stable precision). The same hex at two opacities is two distinct
colors. Hex is uppercase `#RRGGBB`. HSL is computed from the RGB for the
optional column / hue sort.

**Token status.** For each paint, the handler reads paint-level bound variables
(`boundVariables`) and the node's `fillStyleId` / `strokeStyleId`. If bound, the
status is the variable or style **name** (resolved via the async style/variable
lookups); otherwise "Raw". This is reported per usage and surfaced per color
(a color is "tokenized" if its usages are bound).

**Where-used container resolution.** For each usage, walk up the ancestor chain
to the nearest *container*: the enclosing `COMPONENT_SET`, else the nearest
`SECTION`, else the top-level frame/node directly under the page. Record that
container's `{ id, name, type }`. A color's where-used list is the **distinct**
set of such containers, capped at the top ~10 (by per-container usage count)
with an "and N more" remainder count. Rendered as Figma node-links.

**Pure aggregation core (the test seam).** Node traversal produces a flat,
serializable list of `ColorUsage` records — plain objects, no live Figma nodes:
`{ hex, opacity, role, container: { id, name, type }, tokenName: string | null }`.
A pure function — `buildColorInventory(usages, options)` — consumes that list
and returns the full inventory model with no Figma dependency:

```ts
// shape produced by the pure core (from prototype sketch — decision, not impl)
interface ColorInventory {
  summary: { pagesScanned: number; uniqueTotal: number;
             byRole: Record<Role, number>; untokenized: number; otherSkipped: number };
  sections: Array<{
    role: "background" | "text" | "border";
    colors: Array<{
      hex: string; opacity: number; hsl: { h: number; s: number; l: number };
      count: number; tokenName: string | null;
      whereUsed: Array<{ id: string; name: string; type: string }>; // capped
      whereUsedOverflow: number; // the "and N more" count
    }>;
  }>;
}
```

Grouping by role, dedup by hex+opacity, count summation, sort (usage-count desc
by default, by hue when the toggle is set), the where-used cap + overflow count,
and the summary totals all live in this pure function.

**Figma-bound adapters (thin, around the seam).** Three thin pieces sit on the
Figma side of the seam and are verified manually, not unit-tested: (a) the tree
walk that reads paints/styles/bound-variables and emits `ColorUsage[]`;
(b) async page loading for multi-page scopes (load each target page before
walking it); (c) the inventory-page renderer that turns a `ColorInventory` into
auto-layout frames — summary block, three table sections, rows with swatch /
hex+opacity / HSL / token-status / count / where-used node-links / empty
`→ Token` cell.

**Optional extras (in scope).**
- **Copy as markdown** — a UI action that serializes the current `ColorInventory`
  model into a markdown table string and copies it to the clipboard. The
  serializer is pure and tested alongside the aggregator.
- **Sort-by-hue toggle** — a UI toggle passed into `buildColorInventory` as a
  sort option; default remains usage-count descending.

**No-AI / no-network.** Manifest keeps `networkAccess.allowedDomains: ["none"]`.
Everything runs in the plugin sandbox + UI iframe.

## Testing Decisions

**What makes a good test here:** assert external behavior of the pure core, not
implementation details. Tests feed `buildColorInventory` (and the markdown
serializer) plain `ColorUsage[]` arrays and assert on the returned model — never
on how the traversal walked the tree or how frames were drawn.

**Single seam, unit-tested with Vitest** (added to this repo; mirrors the
parent's `iconfinder/hash/*.test.ts` pure-function tests):
- `buildColorInventory`:
  - groups usages into the correct role sections (text/border/background) per the categorization rule already applied upstream;
  - dedups by hex+opacity (same hex, different opacity → two colors; same hex+opacity across containers → one color);
  - sums usage counts correctly;
  - sorts by usage count descending by default, and by hue when the hue-sort option is set;
  - produces the distinct where-used container set, capped at the limit, with the correct "and N more" overflow count;
  - passes token names through and computes "untokenized" / per-role / unique totals in the summary;
  - counts gradient/image usages into the other/skipped summary line and excludes them from sections.
- markdown serializer: given a `ColorInventory`, emits a stable markdown table (headers, one row per color, where-used rendered as text, overflow noted).

**Not unit-tested (manual verification in Figma):** the Figma tree walk, async
page loading, token/variable name resolution, and the auto-layout page renderer.
These are runtime-bound adapters; they're checked by running the plugin on a
real multi-page file and confirming the page, swatches, node-links, and progress
behave. The PRD records this as manual verification by design.

## Out of Scope

- **Semantic role detection.** The plugin never infers primary/secondary/danger/etc. The `→ Token` column is filled in by hand.
- **Creating, binding, or applying tokens.** No variable/style creation, no auto-replacement of raw hex with tokens, no "collapse near-duplicates" action. The inventory is read-only analysis; collapsing is a human decision aided by the HSL column / hue sort.
- **Automatic near-duplicate clustering.** Visual aids only (HSL column, hue sort); no algorithmic "these 3 reds are the same token" grouping.
- **Non-fill/stroke color sources.** Effect colors (shadows/glows), gradient stop analysis, and image color extraction are not inventoried; gradient/image fills are only counted as Other/skipped.
- **Incremental re-scan / diffing.** Each run produces a fresh dated page; there's no updating or diffing of a prior inventory page.
- **Agent/MCP operations surface.** No `operations.ts` for this module in the MVP (the parent toolbox exposes some modules over MCP; this one can be agentified later).
- **Persisted settings.** Option/scope state need not persist across plugin reopens in the MVP.

## Further Notes

- **Migration.** The feature is intentionally confined to the `tidy-color-finder` module so the move into Tidy DS Toolbox stays trivial: copy `src/plugins/tidy-color-finder/`, then register it in `moduleRegistry.ts`, `moduleHandlers.ts`, and the `PluginID` union. Module-internal imports (`@shell/components`, `@shared/bridge`, `./types`) already resolve identically in both repos.
- **Why this ships first:** because it's fully local (no AI, nothing leaves the file), it works on every client regardless of NDA — unlike anything that would need an external service.
- **Motivating cost:** Clarity ~200 hours on colors; SpeakNow's color decisions churned for weeks. The plugin targets the searching/assembly cost, not the deciding.
- **Naming:** generated page is `Color Inventory — {scope} — {date}`.
- This PRD was authored from a detailed feature brief in conversation; the `ColorInventory` shape above is a sketch encoding decisions, not finished code.
