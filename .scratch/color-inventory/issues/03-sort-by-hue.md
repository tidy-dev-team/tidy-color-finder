## What to build

A **sort-by-hue toggle** in the Color Inventory UI that reorders each table section by hue (HSL) instead of the default usage-count-descending order, so the designer can group visually-similar colors to spot near-duplicates that should collapse into one token.

The sort is a behavior of the pure `buildColorInventory` core (see #1): the sort mode is passed in as an option, and the core orders each section's colors accordingly. Default remains usage-count descending; the toggle switches to hue order (using the already-computed HSL). The UI exposes the toggle and re-renders / re-runs to reflect it.

## Acceptance criteria

- [ ] A sort toggle in the inventory UI switches between "by usage count" (default) and "by hue".
- [ ] With the toggle on, each section's colors are ordered by hue; with it off, by usage count descending.
- [ ] The sort option flows through `buildColorInventory` and is covered by Vitest: the same usages return count-desc vs hue-ordered sections depending on the option.

## Blocked by

- #1 (depends on the `buildColorInventory` core and HSL computation)
