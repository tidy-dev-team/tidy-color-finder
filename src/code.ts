/// <reference types="@figma/plugin-typings" />

import { RESIZE_DEFAULT, clampSize } from "./shared/resize";
import { tidyColorFinderHandler } from "./plugins/tidy-color-finder/logic";

// Module handlers map. In the parent Tidy DS Toolbox this lives in
// moduleHandlers.ts and routes many modules; here we route the one module.
const handlers: Record<
  string,
  (action: string, payload: unknown, figma: PluginAPI) => Promise<unknown>
> = {
  "tidy-color-finder": (action, payload, figma) =>
    tidyColorFinderHandler(action, payload, figma),
};

figma.showUI(__html__, RESIZE_DEFAULT);

// Shell-level commands coming from the UI (resize, etc.)
async function handleShellCommand(
  action: string,
  payload: unknown,
  requestId?: string,
) {
  switch (action) {
    case "resize-ui": {
      const p = payload as { width?: number; height?: number };
      const next = clampSize(
        Number(p?.width) || RESIZE_DEFAULT.width,
        Number(p?.height) || RESIZE_DEFAULT.height,
      );
      figma.ui.resize(next.width, next.height);
      figma.ui.postMessage({ type: "resize", payload: next, requestId });
      return;
    }
    default:
      console.warn(`Unknown shell action: ${action}`);
  }
}

function sendResponse(
  requestId: string | undefined,
  result: unknown,
  error?: string,
) {
  if (!requestId) return;
  figma.ui.postMessage({
    type: error ? "error" : "response",
    requestId,
    result: error ? undefined : result,
    error,
  });
}

figma.ui.onmessage = async (msg: unknown) => {
  const message = (msg as Record<string, unknown>)?.pluginMessage || msg;

  // Top-level external-link requests
  if (
    message &&
    typeof message === "object" &&
    "type" in message &&
    (message as { type: unknown }).type === "open-external-link" &&
    "url" in message &&
    typeof (message as { url: unknown }).url === "string"
  ) {
    figma.openExternal((message as { url: string }).url);
    return;
  }

  if (
    !message ||
    typeof message !== "object" ||
    !("target" in message) ||
    !("action" in message)
  ) {
    console.warn("Invalid message format", msg);
    return;
  }

  const { target, action, payload, requestId } = message as {
    target: string;
    action: string;
    payload?: unknown;
    requestId?: string;
  };

  try {
    if (target === "shell") {
      await handleShellCommand(action, payload, requestId);
      return;
    }

    if (!handlers[target]) {
      throw new Error(`Unknown module: ${target}`);
    }

    const result = await handlers[target](action, payload, figma);
    sendResponse(requestId, result);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    sendResponse(requestId, null, errorMessage);
    figma.notify(`⚠️ ${errorMessage}`, { error: true });
  }
};
