import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.doUnmock("@/services/demo/api.ts");
  vi.doUnmock("@/services/demo/feed.ts");
  vi.doUnmock("@/services/demo/bus.ts");
  vi.doUnmock("posthog-js");
});

describe("fixed runtime mode", () => {
  it("maps only kb explicitly and rejects unknown startup modes", async () => {
    const { resolveRuntimeMode } = await import("@/services/runtimeMode");

    expect(resolveRuntimeMode("kb")).toBe("kb");
    expect(resolveRuntimeMode("development")).toBe("demo");
    expect(resolveRuntimeMode("production")).toBe("demo");
    expect(resolveRuntimeMode("test")).toBe("demo");
    expect(() => resolveRuntimeMode("staging")).toThrow("Unsupported OpenCharts runtime mode");
  });

  it("does not evaluate demo API/feed/bus or telemetry in KB mode", async () => {
    vi.stubEnv("MODE", "kb");
    vi.stubEnv("VITE_POSTHOG_API_KEY", "configured-test-key");
    const demoApiLoaded = vi.fn();
    const feedLoaded = vi.fn();
    const busLoaded = vi.fn();
    const posthogClient = {
      init: vi.fn(),
      capture: vi.fn(),
      get_session_id: vi.fn(() => "session"),
    };
    vi.doMock("@/services/demo/api.ts", () => {
      demoApiLoaded();
      return { demoApi: {} };
    });
    vi.doMock("@/services/demo/feed.ts", () => {
      feedLoaded();
      return { startDemoFeed: vi.fn() };
    });
    vi.doMock("@/services/demo/bus.ts", () => {
      busLoaded();
      return { publish: vi.fn(), subscribeChannel: vi.fn() };
    });
    vi.doMock("posthog-js", () => ({ default: posthogClient }));

    const [{ api }, { wsClient }, analytics] = await Promise.all([
      import("@/services/api"),
      import("@/services/ws"),
      import("@/lib/posthog"),
    ]);

    for (const method of [
      "getSymbols",
      "getTick",
      "getCandlesWithMeta",
      "getPositions",
      "getOrders",
      "getAccountMetrics",
      "getMarketDataHealth",
      "placeOrder",
      "cancelOrder",
      "modifyOrder",
      "cancelAllOrders",
      "closePosition",
      "closeAllPositions",
      "modifyPosition",
      "setAccountLabel",
      "createJournalEntry",
      "updateJournalEntry",
      "deleteJournalEntry",
    ] as const) {
      await expect((api[method] as (...args: never[]) => Promise<unknown>)()).rejects.toMatchObject(
        { status: 403 },
      );
    }
    await expect(api.chartDrawings.list("MU")).resolves.toEqual([]);
    await expect(api.chartDrawings.save("MU", "1d", {} as never)).resolves.toEqual({
      saved: true,
    });
    wsClient.connect();
    const unsubscribe = wsClient.subscribe("market-data", vi.fn());
    wsClient.emit("market-data", {});
    unsubscribe();
    analytics.posthog.capture("direct-capture");
    analytics.capturePlatform("platform-capture");
    await Promise.resolve();

    expect(demoApiLoaded).not.toHaveBeenCalled();
    expect(feedLoaded).not.toHaveBeenCalled();
    expect(busLoaded).not.toHaveBeenCalled();
    expect(posthogClient.init).not.toHaveBeenCalled();
    expect(posthogClient.capture).not.toHaveBeenCalled();
    expect(wsClient.state).toBe("disconnected");
  });

  it("keeps the original demo facade and feed behavior", async () => {
    vi.stubEnv("MODE", "test");
    const getSymbols = vi.fn(async () => [{ name: "BTCUSD" }]);
    const startDemoFeed = vi.fn();
    const subscribeChannel = vi.fn(() => vi.fn());
    const chartDrawings = {
      list: vi.fn(async () => [{ id: "drawing" }]),
      save: vi.fn(async () => ({ saved: true })),
      remove: vi.fn(async () => ({ deleted: true })),
      clear: vi.fn(async () => ({ cleared: true })),
    };
    vi.doMock("@/services/demo/api.ts", () => ({ demoApi: { getSymbols, chartDrawings } }));
    vi.doMock("@/services/demo/feed.ts", () => ({ startDemoFeed }));
    vi.doMock("@/services/demo/bus.ts", () => ({ publish: vi.fn(), subscribeChannel }));

    const [{ api }, { wsClient }] = await Promise.all([
      import("@/services/api"),
      import("@/services/ws"),
    ]);

    await expect(api.getSymbols()).resolves.toEqual([{ name: "BTCUSD" }]);
    await expect(api.chartDrawings.list("BTCUSD")).resolves.toEqual([{ id: "drawing" }]);
    wsClient.connect();
    await vi.waitFor(() => expect(startDemoFeed).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(wsClient.state).toBe("connected"));
    const handler = vi.fn();
    wsClient.subscribe("market-data", handler);
    await vi.waitFor(() => expect(subscribeChannel).toHaveBeenCalledWith("market-data", handler));
  });

  it("does not start or subscribe a late demo module after disconnect", async () => {
    vi.stubEnv("MODE", "test");
    const startDemoFeed = vi.fn();
    const subscribeChannel = vi.fn(() => vi.fn());
    vi.doMock("@/services/demo/feed.ts", () => ({ startDemoFeed }));
    vi.doMock("@/services/demo/bus.ts", () => ({ publish: vi.fn(), subscribeChannel }));

    const { wsClient } = await import("@/services/ws");
    wsClient.connect();
    wsClient.disconnect();
    const unsubscribe = wsClient.subscribe("market-data", vi.fn());
    unsubscribe();
    await Promise.resolve();
    await Promise.resolve();

    expect(startDemoFeed).not.toHaveBeenCalled();
    expect(subscribeChannel).not.toHaveBeenCalled();
    expect(wsClient.state).toBe("disconnected");
  });
});
