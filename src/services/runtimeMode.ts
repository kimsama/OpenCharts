export type RuntimeMode = "demo" | "kb";

const DEMO_STARTUP_MODES = new Set(["", "development", "production", "test"]);

export function resolveRuntimeMode(mode: string | undefined): RuntimeMode {
  const normalized = mode?.trim().toLowerCase() ?? "";
  if (normalized === "kb") return "kb";
  if (DEMO_STARTUP_MODES.has(normalized)) return "demo";
  throw new Error(`Unsupported OpenCharts runtime mode: ${mode}`);
}

export const runtimeMode = resolveRuntimeMode(import.meta.env.MODE);
export const isKbMode = runtimeMode === "kb";
