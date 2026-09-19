import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  localStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
  vi.doUnmock("@/pages/TradingPage.tsx");
  vi.doUnmock("@/components/MarketDataBridge.tsx");
  vi.doUnmock("@/App.tsx");
  vi.doUnmock("@/services/store.tsx");
  vi.useRealTimers();
});

describe("native runtime bootstrap", () => {
  it("keeps persisted demo state untouched but does not hydrate it in KB mode", async () => {
    vi.stubEnv("MODE", "kb");
    const storedUser = JSON.stringify({ id: "stale-demo-user" });
    localStorage.setItem("access_token", "stale-demo-token");
    localStorage.setItem("refresh_token", "stale-demo-refresh");
    localStorage.setItem("user", storedUser);
    localStorage.setItem("is_demo", "true");
    localStorage.setItem("active_account", "stale-demo-account");

    const { useAuthStore, useTradingStore } = await import("@/services/store.tsx");

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      refreshToken: null,
      user: null,
      isDemo: false,
    });
    expect(useTradingStore.getState()).toMatchObject({
      activeAccountId: null,
      accounts: [],
      positions: [],
      orders: [],
      ticks: {},
      liveTicks: {},
      liveCandleUpdates: {},
    });
    await expect(useAuthStore.getState().demoLogin()).rejects.toMatchObject({ status: 403 });
    useTradingStore.getState().setActiveAccount("replacement");

    expect(localStorage.getItem("access_token")).toBe("stale-demo-token");
    expect(localStorage.getItem("refresh_token")).toBe("stale-demo-refresh");
    expect(localStorage.getItem("user")).toBe(storedUser);
    expect(localStorage.getItem("is_demo")).toBe("true");
    expect(localStorage.getItem("active_account")).toBe("stale-demo-account");
    expect(useTradingStore.getState().activeAccountId).toBeNull();
  });

  it("renders App to the native TradingPage without demo bootstrap in KB mode", async () => {
    vi.stubEnv("MODE", "kb");
    const demoLogin = vi.fn(async () => undefined);
    const loadSymbols = vi.fn(async () => undefined);
    const loadAccounts = vi.fn(async () => undefined);
    const authHook = Object.assign(
      (selector: (state: { demoLogin: typeof demoLogin }) => unknown) => selector({ demoLogin }),
      { setState: vi.fn() },
    );
    const tradingHook = (selector: (state: unknown) => unknown) =>
      selector({ loadSymbols, loadAccounts });
    vi.doMock("@/services/store.tsx", () => ({
      useAuthStore: authHook,
      useTradingStore: tradingHook,
    }));
    vi.doMock("@/pages/TradingPage.tsx", () => ({
      TradingPage: () => <main data-testid="native-trading-page">Native TradingPage</main>,
    }));

    const { App } = await import("@/App.tsx");
    render(<App />);

    expect(await screen.findByTestId("native-trading-page")).toBeInTheDocument();
    expect(demoLogin).not.toHaveBeenCalled();
    expect(loadSymbols).not.toHaveBeenCalled();
    expect(loadAccounts).not.toHaveBeenCalled();
    expect(authHook.setState).not.toHaveBeenCalled();
  });

  it("blocks direct KB auth actions before fetch, storage, or state effects", async () => {
    vi.stubEnv("MODE", "kb");
    const storedUser = JSON.stringify({ id: "stale-demo-user" });
    const sentinels = {
      access_token: "stale-demo-token",
      refresh_token: "stale-demo-refresh",
      user: storedUser,
      is_demo: "true",
      active_account: "stale-demo-account",
    };
    for (const [key, value] of Object.entries(sentinels)) localStorage.setItem(key, value);
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          accessToken: "replacement-token",
          refreshToken: "replacement-refresh",
          user: { id: "replacement-user" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { useAuthStore } = await import("@/services/store.tsx");
    await expect(useAuthStore.getState().googleLogin("credential", "firm")).rejects.toMatchObject({
      status: 403,
    });
    useAuthStore.getState().logout();
    await expect(useAuthStore.getState().restoreSession()).rejects.toMatchObject({ status: 403 });

    expect(fetchMock).not.toHaveBeenCalled();
    for (const [key, value] of Object.entries(sentinels)) {
      expect(localStorage.getItem(key)).toBe(value);
    }
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      refreshToken: null,
      user: null,
      isDemo: false,
    });
  });

  it("does not mount MarketDataBridge from the real root in KB mode", async () => {
    vi.stubEnv("MODE", "kb");
    const bridge = vi.fn(() => <div>bridge</div>);
    vi.doMock("@/components/MarketDataBridge.tsx", () => ({ MarketDataBridge: bridge }));
    vi.doMock("@/App.tsx", () => ({ App: () => <main data-testid="root-app">App</main> }));
    document.body.innerHTML = '<div id="root"></div>';

    await act(async () => {
      await import("@/main.tsx");
    });

    expect(await screen.findByTestId("root-app")).toBeInTheDocument();
    expect(bridge).not.toHaveBeenCalled();
  });

  it("preserves original demo App bootstrap", async () => {
    vi.stubEnv("MODE", "test");
    const demoLogin = vi.fn(async () => undefined);
    const loadSymbols = vi.fn(async () => undefined);
    const loadAccounts = vi.fn(async () => undefined);
    const authHook = Object.assign(
      (selector: (state: { demoLogin: typeof demoLogin }) => unknown) => selector({ demoLogin }),
      { setState: vi.fn() },
    );
    const tradingHook = (selector: (state: unknown) => unknown) =>
      selector({ loadSymbols, loadAccounts });
    vi.doMock("@/services/store.tsx", () => ({
      useAuthStore: authHook,
      useTradingStore: tradingHook,
    }));
    vi.doMock("@/pages/TradingPage.tsx", () => ({
      TradingPage: () => <main data-testid="native-trading-page">Native TradingPage</main>,
    }));

    const { App } = await import("@/App.tsx");
    render(<App />);

    await waitFor(() => expect(demoLogin).toHaveBeenCalledOnce());
    await waitFor(() => expect(loadSymbols).toHaveBeenCalledOnce());
    await waitFor(() => expect(loadAccounts).toHaveBeenCalledOnce());
    expect(await screen.findByTestId("native-trading-page")).toBeInTheDocument();
    expect(localStorage.getItem("is_demo")).toBe("false");
  });

  it("runs the real TradingPage shell without legacy reads or trading panels in KB mode", async () => {
    vi.stubEnv("MODE", "kb");
    vi.useFakeTimers();
    const legacyCall = vi.fn((method: string) =>
      Promise.reject(new Error(`Unexpected legacy call: ${method}`)),
    );
    const chartDrawings = {
      list: vi.fn(async () => []),
      save: vi.fn(async () => ({ saved: true })),
      remove: vi.fn(async () => ({ deleted: true })),
      clear: vi.fn(async () => ({ cleared: true })),
    };
    const api = new Proxy(
      { chartDrawings },
      {
        get(target, prop: string) {
          if (prop === "chartDrawings") return target.chartDrawings;
          return (..._args: unknown[]) => legacyCall(prop);
        },
      },
    );
    const chartPanel = vi.fn((_props: Record<string, unknown>) => (
      <div data-testid="native-chart-panel" />
    ));
    const bottomPanel = vi.fn(() => <div>bottom-panel</div>);
    const orderPanel = vi.fn(() => <div>order-panel</div>);
    const domPanel = vi.fn(() => <div>dom-panel</div>);
    const mobileTradingPanel = vi.fn(() => <div>mobile-trading-panel</div>);
    vi.doMock("@/services/api.ts", () => ({ api }));
    vi.doMock("@/components/ConnectionIndicator.tsx", () => ({
      useIsFeedConnected: () => false,
    }));
    vi.doMock("@/components/MobileTradingPanel.tsx", () => ({
      MobileAccountBar: () => <div>mobile-account-bar</div>,
      MobileTradingPanel: mobileTradingPanel,
    }));
    vi.doMock("@/components/TradingDialogs.tsx", () => ({
      OrderConfirmDialog: () => null,
      OrderModifyDialog: () => null,
      PositionModifyDialog: () => null,
    }));
    vi.doMock("@/components/TradingPowerFeatures.tsx", () => ({ NewsFeed: () => null }));
    vi.doMock("@/components/TradingViewWidgets.tsx", () => ({
      TradingViewTechnicalAnalysis: () => null,
    }));
    vi.doMock("@/pages/AiTraderPage.tsx", () => ({ AiTraderPanel: () => null }));
    vi.doMock("@/pages/trading/BottomPanel.tsx", () => ({ BottomPanel: bottomPanel }));
    vi.doMock("@/pages/trading/ChartPanel.tsx", () => ({ ChartPanel: chartPanel }));
    vi.doMock("@/pages/trading/DOMPanel.tsx", () => ({ DOMPanel: domPanel }));
    vi.doMock("@/pages/trading/OrderPanel.tsx", () => ({ OrderPanel: orderPanel }));
    vi.doMock("@/pages/trading/WatchlistPanel.tsx", () => ({ WatchlistPanel: () => null }));

    const [{ TradingPage }] = await Promise.all([import("@/pages/TradingPage.tsx")]);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <TradingPage />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("native-chart-panel")).toBeInTheDocument();
    expect(screen.getByText("Trading activity unavailable")).toBeInTheDocument();
    expect(screen.getByText("Panel unavailable")).toBeInTheDocument();
    expect(screen.getByText(/Portfolio unavailable/)).toBeInTheDocument();
    expect(bottomPanel).not.toHaveBeenCalled();
    expect(orderPanel).not.toHaveBeenCalled();
    expect(domPanel).not.toHaveBeenCalled();
    expect(mobileTradingPanel).not.toHaveBeenCalled();
    const props = chartPanel.mock.calls.at(-1)![0];
    expect(props.onQuickOrder).toBeUndefined();
    expect(props.onModifyPosition).toBeUndefined();
    expect(props.tick).toBeUndefined();
    expect(props.liveCandle).toBeUndefined();
    expect(props.positions).toEqual([]);
    expect(props.orders).toEqual([]);

    await act(async () => {
      vi.advanceTimersByTime(5 * 60_000);
      await Promise.resolve();
    });
    expect(legacyCall).not.toHaveBeenCalled();
    expect(chartDrawings.list).not.toHaveBeenCalled();
  });

  it("does not query the economic calendar for a currency-bearing KB symbol", async () => {
    vi.stubEnv("MODE", "kb");
    vi.useFakeTimers();
    const getEconomicCalendar = vi.fn(async () => []);
    vi.doMock("@/services/api.ts", () => ({ api: { getEconomicCalendar } }));

    const { useNewsOverlay } = await import("@/pages/trading/useNewsOverlay.ts");
    function NewsOverlayHarness() {
      const containerRef = useRef<HTMLDivElement>(null);
      const chartRef = useRef(null);
      useNewsOverlay(containerRef, chartRef, "USDF", true, []);
      return <div ref={containerRef}>news-overlay</div>;
    }
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: true } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <NewsOverlayHarness />
      </QueryClientProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(30 * 60_000);
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });
    expect(getEconomicCalendar).not.toHaveBeenCalled();
  });
});
