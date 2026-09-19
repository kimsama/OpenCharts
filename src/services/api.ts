/**
 * Runtime API facade.
 *
 * Demo mode lazily loads the original in-browser implementation. KB mode never
 * evaluates that module and rejects every legacy method at this shared boundary.
 */
import { isKbMode } from "./runtimeMode";

type DemoApi = typeof import("./demo/api.ts")["demoApi"];

export const API_BASE = "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// react-query rejects `undefined` query results, so resolve to null instead.
const benign = () => Promise.resolve(null);
const unavailable = () =>
  Promise.reject(new ApiError("Unavailable in KB read-only mode.", 403));
const kbLocalChartDrawings = {
  list: async () => [],
  save: async () => ({ saved: true }),
  remove: async () => ({ deleted: true }),
  clear: async () => ({ cleared: true }),
};

let demoApiPromise: Promise<Record<string, unknown>> | undefined;
function loadDemoApi(): Promise<Record<string, unknown>> {
  demoApiPromise ??= import("./demo/api.ts").then(
    ({ demoApi }) => demoApi as Record<string, unknown>,
  );
  return demoApiPromise;
}
const demoChartDrawings: DemoApi["chartDrawings"] = {
  list: (...args) =>
    loadDemoApi().then((implementation) =>
      (implementation.chartDrawings as DemoApi["chartDrawings"]).list(...args),
    ),
  save: (...args) =>
    loadDemoApi().then((implementation) =>
      (implementation.chartDrawings as DemoApi["chartDrawings"]).save(...args),
    ),
  remove: (...args) =>
    loadDemoApi().then((implementation) =>
      (implementation.chartDrawings as DemoApi["chartDrawings"]).remove(...args),
    ),
  clear: (...args) =>
    loadDemoApi().then((implementation) =>
      (implementation.chartDrawings as DemoApi["chartDrawings"]).clear(...args),
    ),
};

export const api = new Proxy({} as Record<string, unknown>, {
  get(_target, prop: string) {
    if (isKbMode) return prop === "chartDrawings" ? kbLocalChartDrawings : unavailable;
    if (prop === "chartDrawings") return demoChartDrawings;
    return (...args: unknown[]) =>
      loadDemoApi().then((implementation) => {
        const method = implementation[prop];
        return typeof method === "function" ? method(...args) : benign();
      });
  },
}) as DemoApi & Record<string, (...args: never[]) => Promise<unknown>>;
