// Standalone-shell window sizing. This is shell infrastructure and is NOT part
// of the migrating module — the parent Tidy DS Toolbox supplies its own.

export const RESIZE_DEFAULT = {
  width: 420,
  height: 640,
};

export const RESIZE_LIMITS = {
  MIN_WIDTH: 320,
  MAX_WIDTH: 720,
  MIN_HEIGHT: 480,
  MAX_HEIGHT: 900,
};

export function clampSize(width: number, height: number) {
  const nextWidth = Math.min(
    Math.max(Math.round(width), RESIZE_LIMITS.MIN_WIDTH),
    RESIZE_LIMITS.MAX_WIDTH,
  );
  const nextHeight = Math.min(
    Math.max(Math.round(height), RESIZE_LIMITS.MIN_HEIGHT),
    RESIZE_LIMITS.MAX_HEIGHT,
  );
  return { width: nextWidth, height: nextHeight };
}
