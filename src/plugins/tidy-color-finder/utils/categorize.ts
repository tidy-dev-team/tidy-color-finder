import { ColorRole } from "../types";

/**
 * The mechanical categorization rule (issue #1): which role table a paint
 * lands in, based purely on the node type and whether the paint is a fill or a
 * stroke. No semantic guessing. Pure — unit-tested directly.
 *
 * - any stroke            → border
 * - a fill on a TEXT node → text
 * - any other fill        → background
 */
export function roleFor(
  nodeType: string,
  source: "fill" | "stroke",
): ColorRole {
  if (source === "stroke") return "border";
  if (nodeType === "TEXT") return "text";
  return "background";
}

/** Round paint opacity to a stable precision so float noise doesn't split a
 * single color into multiple inventory rows. */
export function roundOpacity(opacity: number): number {
  return Math.round(opacity * 1000) / 1000;
}
