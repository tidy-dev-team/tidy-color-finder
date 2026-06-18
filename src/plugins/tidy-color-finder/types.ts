/// <reference types="@figma/plugin-typings" />

/**
 * Type definitions for the Tidy Color Finder module.
 *
 * Shape mirrors the parent Tidy DS Toolbox module convention: a string-literal
 * action union the handler switches on, plus payload/result interfaces shared
 * between ui.tsx and logic.ts.
 */

export type TidyColorFinderAction = "scan-colors";

// --- scan-colors ---

export interface ScanColorsPayload {
  // "selection" scans the current selection; "page" scans the whole page.
  scope?: "selection" | "page";
  requestId?: string;
}

export interface FoundColor {
  hex: string; // e.g. "#FF8800"
  count: number; // number of paint usages with this color
}

export interface ScanColorsResult {
  scope: "selection" | "page";
  scannedNodes: number;
  colors: FoundColor[];
}
