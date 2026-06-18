import { useCallback, useEffect, useState } from "react";
import { Card } from "@shell/components";
import { postToFigma } from "@shared/bridge";
import { IconColorSwatch, IconRefresh } from "@tabler/icons-react";
import { FoundColor, ScanColorsResult } from "./types";

export function TidyColorFinderUI() {
  const [scope, setScope] = useState<"selection" | "page">("selection");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanColorsResult | null>(null);

  // Listen for responses from the plugin thread.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage || event.data;
      if (message?.type === "response" && message.result?.colors) {
        setResult(message.result as ScanColorsResult);
        setScanning(false);
      } else if (message?.type === "error") {
        setScanning(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleScan = useCallback(() => {
    setScanning(true);
    postToFigma({
      target: "tidy-color-finder",
      action: "scan-colors",
      payload: { scope },
      requestId: "scan-colors",
    });
  }, [scope]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--pixel-16, 16px)",
        padding: "var(--pixel-16, 16px)",
      }}
    >
      <div className="status-message">
        <strong>Placeholder feature.</strong> This scans solid fill &amp; stroke
        colors to prove the UI&nbsp;↔&nbsp;plugin bridge. The real
        color-tidying behaviour is still to be defined.
      </div>

      <Card title="Scan for colors">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--pixel-12, 12px)",
          }}
        >
          <div style={{ display: "flex", gap: "var(--pixel-8, 8px)" }}>
            <button
              className={scope === "selection" ? "" : "secondary"}
              onClick={() => setScope("selection")}
            >
              Selection
            </button>
            <button
              className={scope === "page" ? "" : "secondary"}
              onClick={() => setScope("page")}
            >
              Whole page
            </button>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--pixel-8, 8px)",
            }}
          >
            <IconRefresh size={16} stroke={1.5} />
            {scanning ? "Scanning…" : "Scan colors"}
          </button>
        </div>
      </Card>

      {result && (
        <Card
          title={`Found ${result.colors.length} color${
            result.colors.length === 1 ? "" : "s"
          }`}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--disabled-color)",
              marginBottom: "var(--pixel-12, 12px)",
            }}
          >
            Scanned {result.scannedNodes} node
            {result.scannedNodes === 1 ? "" : "s"} in {result.scope}.
          </div>

          {result.colors.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--pixel-8, 8px)",
                color: "var(--disabled-color)",
                fontSize: "13px",
              }}
            >
              <IconColorSwatch size={16} stroke={1.5} />
              No solid colors found.
            </div>
          ) : (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "var(--pixel-8, 8px)",
              }}
            >
              {result.colors.map((color: FoundColor) => (
                <li
                  key={color.hex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--pixel-12, 12px)",
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "var(--pixel-6, 6px)",
                      border: "1px solid var(--border-light)",
                      background: color.hex,
                      flex: "0 0 auto",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: "#111827",
                    }}
                  >
                    {color.hex}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "12px",
                      color: "var(--disabled-color)",
                    }}
                  >
                    ×{color.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
