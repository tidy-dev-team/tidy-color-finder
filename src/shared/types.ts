// Shared message types for the plugin system.
// Mirrors the envelope used by the parent Tidy DS Toolbox so that module code
// (src/plugins/tidy-color-finder/) can move over without edits.

export type PluginID = "tidy-color-finder" | (string & {});

export interface PluginMessage {
  target: PluginID;
  action: string;
  payload?: any;
  requestId?: string;
}

export interface ShellMessage {
  type:
    | "resize"
    | "response"
    | "error"
    | string;
  payload?: any;
  requestId?: string;
  result?: any;
}
