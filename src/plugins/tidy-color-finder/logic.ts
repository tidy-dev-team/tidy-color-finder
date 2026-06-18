/// <reference types="@figma/plugin-typings" />

import {
  TidyColorFinderAction,
  ScanColorsPayload,
  ScanColorsResult,
  FoundColor,
} from "./types";

/**
 * Tidy Color Finder handler — processes messages from the UI.
 *
 * Signature matches the parent Tidy DS Toolbox module contract
 * `(action, payload, figma?) => Promise<any>` so it can be wired into the
 * toolbox's moduleHandlers without changes.
 *
 * NOTE: the scan below is a deliberately-thin PLACEHOLDER that proves the
 * UI -> logic -> figma -> UI round trip. The real "tidy" semantics (e.g.
 * flagging hardcoded colors that should be variables/styles) are not yet
 * decided — see the module README / open question.
 */
export async function tidyColorFinderHandler(
  action: string,
  payload: any,
  _figma?: PluginAPI,
): Promise<any> {
  switch (action as TidyColorFinderAction) {
    case "scan-colors":
      return scanColors(payload as ScanColorsPayload);

    default:
      console.warn(`Unknown action: ${action}`);
      return null;
  }
}

function scanColors(payload: ScanColorsPayload): ScanColorsResult {
  const scope = payload?.scope ?? "selection";

  const roots: readonly SceneNode[] =
    scope === "selection" && figma.currentPage.selection.length > 0
      ? figma.currentPage.selection
      : figma.currentPage.children;

  const counts = new Map<string, number>();
  let scannedNodes = 0;

  const visit = (node: SceneNode) => {
    scannedNodes++;
    collectSolidPaints(node, counts);
    if ("children" in node) {
      for (const child of node.children) {
        visit(child);
      }
    }
  };

  for (const root of roots) {
    visit(root);
  }

  const colors: FoundColor[] = [...counts.entries()]
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count);

  return {
    scope:
      scope === "selection" && figma.currentPage.selection.length > 0
        ? "selection"
        : "page",
    scannedNodes,
    colors,
  };
}

function collectSolidPaints(node: SceneNode, counts: Map<string, number>) {
  const paintSets: unknown[] = [];
  if ("fills" in node) paintSets.push(node.fills);
  if ("strokes" in node) paintSets.push(node.strokes);

  for (const paints of paintSets) {
    if (!Array.isArray(paints)) continue; // skip figma.mixed
    for (const paint of paints as readonly Paint[]) {
      if (paint.type !== "SOLID" || paint.visible === false) continue;
      const hex = rgbToHex(paint.color);
      counts.set(hex, (counts.get(hex) ?? 0) + 1);
    }
  }
}

function rgbToHex({ r, g, b }: RGB): string {
  const toByte = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}
