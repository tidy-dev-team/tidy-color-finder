/// <reference types="@figma/plugin-typings" />

import { ColorRole, ColorUsage, ScanOptions, UsageContainer } from "../types";
import { rgbToHex } from "./color";
import { roleFor, roundOpacity } from "./categorize";

/**
 * Figma-bound tree walk. Thin adapter around the pure aggregator: it reads
 * paints / styles / bound variables off live nodes and emits a serializable
 * `ColorUsage[]`. Verified manually in Figma, not unit-tested.
 */

export interface ScanResult {
  usages: ColorUsage[];
  otherSkipped: number;
  nodesScanned: number;
}

// Caches for token-name resolution within a single scan.
interface ResolveCaches {
  variables: Map<string, string | null>;
  styles: Map<string, string | null>;
}

export async function collectUsages(
  roots: readonly SceneNode[],
  options: ScanOptions,
  onProgress?: (nodesScanned: number) => void,
): Promise<ScanResult> {
  const usages: ColorUsage[] = [];
  const caches: ResolveCaches = { variables: new Map(), styles: new Map() };
  let otherSkipped = 0;
  let nodesScanned = 0;

  const queue: SceneNode[] = [...roots];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node.visible === false) continue;

    nodesScanned += 1;
    if (nodesScanned % 250 === 0) onProgress?.(nodesScanned);

    otherSkipped += await collectFromNode(node, options, caches, usages);

    if ("children" in node) {
      const isInstance = node.type === "INSTANCE";
      if (!isInstance || options.lookInsideInstances) {
        for (const child of node.children) queue.push(child);
      }
    }
  }

  onProgress?.(nodesScanned);
  return { usages, otherSkipped, nodesScanned };
}

async function collectFromNode(
  node: SceneNode,
  options: ScanOptions,
  caches: ResolveCaches,
  out: ColorUsage[],
): Promise<number> {
  let otherSkipped = 0;

  // Fills → text role on TEXT nodes, otherwise background.
  if ("fills" in node && Array.isArray(node.fills)) {
    const fillRole: ColorRole = roleFor(node.type, "fill");
    if (roleIncluded(fillRole, options)) {
      const styleName = await resolveStyleName(
        "fillStyleId" in node ? node.fillStyleId : "",
        caches,
      );
      for (const paint of node.fills as readonly Paint[]) {
        otherSkipped += await pushPaint(
          node,
          paint,
          fillRole,
          styleName,
          options,
          caches,
          out,
        );
      }
    }
  }

  // Strokes → border role.
  if ("strokes" in node && Array.isArray(node.strokes)) {
    if (roleIncluded("border", options)) {
      const styleName = await resolveStyleName(
        "strokeStyleId" in node ? node.strokeStyleId : "",
        caches,
      );
      for (const paint of node.strokes as readonly Paint[]) {
        otherSkipped += await pushPaint(
          node,
          paint,
          "border",
          styleName,
          options,
          caches,
          out,
        );
      }
    }
  }

  return otherSkipped;
}

// Returns 1 if the paint was a skipped (non-solid) "other" paint, else 0.
async function pushPaint(
  node: SceneNode,
  paint: Paint,
  role: ColorRole,
  styleName: string | null,
  options: ScanOptions,
  caches: ResolveCaches,
  out: ColorUsage[],
): Promise<number> {
  if (paint.visible === false) return 0;
  if (paint.type !== "SOLID") return 1; // gradient / image / video

  const variableName = await resolveVariableName(
    paint.boundVariables?.color?.id,
    caches,
  );
  const tokenName = variableName ?? styleName;

  if (options.skipTokenized && tokenName !== null) return 0;

  out.push({
    hex: rgbToHex(paint.color.r, paint.color.g, paint.color.b),
    opacity: roundOpacity(paint.opacity ?? 1),
    role,
    container: resolveContainer(node),
    tokenName,
  });
  return 0;
}

function roleIncluded(role: ColorRole, options: ScanOptions): boolean {
  if (role === "background") return options.includeBackgrounds;
  if (role === "text") return options.includeText;
  return options.includeBorders;
}

/**
 * Walk ancestors to the nearest meaningful container, in priority order:
 * an enclosing COMPONENT_SET, else the nearest INSTANCE/COMPONENT (so a color
 * used inside an instance is attributed to e.g. "Button"), else the nearest
 * SECTION, else the top-level node under the page. Falls back to the node
 * itself.
 */
function resolveContainer(node: SceneNode): UsageContainer {
  let componentSet: BaseNode | null = null;
  let instanceOrComponent: BaseNode | null = null;
  let section: BaseNode | null = null;
  let cur: BaseNode = node;

  while (
    cur.parent &&
    cur.parent.type !== "PAGE" &&
    cur.parent.type !== "DOCUMENT"
  ) {
    cur = cur.parent;
    if (cur.type === "COMPONENT_SET" && !componentSet) {
      componentSet = cur;
    } else if (
      (cur.type === "INSTANCE" || cur.type === "COMPONENT") &&
      !instanceOrComponent
    ) {
      instanceOrComponent = cur;
    }
    if (cur.type === "SECTION" && !section) section = cur;
  }

  const chosen = componentSet ?? instanceOrComponent ?? section ?? cur;
  return { id: chosen.id, name: chosen.name, type: chosen.type };
}

async function resolveVariableName(
  id: string | undefined,
  caches: ResolveCaches,
): Promise<string | null> {
  if (!id) return null;
  if (caches.variables.has(id)) return caches.variables.get(id)!;
  let name: string | null = null;
  try {
    const variable = await figma.variables.getVariableByIdAsync(id);
    name = variable ? variable.name : null;
  } catch {
    name = null;
  }
  caches.variables.set(id, name);
  return name;
}

async function resolveStyleName(
  styleId: string | typeof figma.mixed,
  caches: ResolveCaches,
): Promise<string | null> {
  if (typeof styleId !== "string" || styleId === "") return null;
  if (caches.styles.has(styleId)) return caches.styles.get(styleId)!;
  let name: string | null = null;
  try {
    const style = await figma.getStyleByIdAsync(styleId);
    name = style ? style.name : null;
  } catch {
    name = null;
  }
  caches.styles.set(styleId, name);
  return name;
}
