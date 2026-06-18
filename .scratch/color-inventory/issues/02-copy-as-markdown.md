## What to build

A **Copy as markdown** action in the Color Inventory UI that serializes the current inventory into a markdown table string and copies it to the clipboard, so the designer can paste the inventory into a doc or ticket outside Figma.

The serializer is a **pure function** that takes the `ColorInventory` model produced by `buildColorInventory` (see #1) and returns a markdown string — no Figma dependency — so it's unit-tested alongside the aggregator. The UI exposes the action (button) and performs the clipboard write.

The markdown should preserve the inventory's structure: a section per role, one row per color with hex (+ opacity when ≠100%), token status, count, and where-used containers rendered as text with the "and N more" remainder noted (node-links degrade to container names in markdown).

## Acceptance criteria

- [ ] A "Copy as markdown" action is available in the inventory UI once a scan has produced a result.
- [ ] Triggering it copies a markdown table of the current inventory to the clipboard.
- [ ] The markdown has a section per role with a header row, one row per color (hex + opacity, token status, count, where-used containers as text + "and N more").
- [ ] The serializer is a pure function covered by Vitest: given a `ColorInventory`, it emits a stable, correctly-structured markdown table.

## Blocked by

- #1 (depends on the `ColorInventory` model and the inventory UI)
