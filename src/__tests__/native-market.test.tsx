import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MarketSnapshot } from "@/services/marketSnapshot";
import type { ManualDailyCandle } from "@/pages/trading/utils";

const accountId = "3f13f4c2-4dce-45ef-b8e4-b92e58f101d5";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("native KB market controls", () => {
  it("submits an arbitrary US ticker only from the existing toolbar", async () => {
    const snapshotRequests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/kb-api/accounts") return json(accountsPayload());
        snapshotRequests.push(url);
        return json(snapshotPayload("US", "NAS", "MU"));
      }),
    );
    const { chartPanel } = await renderNative();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    expect((await screen.findAllByRole("option", { name: "KB 조회 계좌" })).length).toBeGreaterThan(0);
    await user.type(screen.getAllByLabelText("종목 코드")[0]!, "mu");
    expect(snapshotRequests).toEqual([]);
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);

    await waitFor(() => {
      const props = chartPanel.mock.calls.at(-1)![0] as {
        selectedSymbol: string;
        timeframe: string;
        dataMode: string;
        dataIdentityKey: string;
        manualSnapshot: MarketSnapshot;
        candles: ManualDailyCandle[];
      };
      expect(props).toMatchObject({
        selectedSymbol: "MU",
        timeframe: "1d",
        dataMode: "manual-daily",
        dataIdentityKey: `${accountId}:US:NAS:MU`,
      });
      expect(props.manualSnapshot.symbol).toBe("MU");
      expect(props.candles[0]).toMatchObject({ tradingDate: "2026-09-18", volume: null });
    });
    expect(snapshotRequests).toHaveLength(1);
  });

  it("focuses the real KB ticker in the mobile popup and submits it with Enter", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) =>
        String(input) === "/kb-api/accounts"
          ? json(accountsPayload())
          : json(snapshotPayload("US", "NAS", "MU")),
      ),
    );
    const { chartPanel } = await renderNative();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    await screen.findAllByRole("option", { name: "KB 조회 계좌" });
    expect(screen.queryByPlaceholderText("Search symbols...")).not.toBeInTheDocument();
    const mobileTicker = screen.getAllByLabelText("종목 코드")[0]!;
    expect(mobileTicker).toHaveFocus();
    await user.type(mobileTicker, "MU{Enter}");

    await waitFor(() =>
      expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({
        selectedSymbol: "MU",
        timeframe: "1d",
      }),
    );
  });

  it("keeps KB snapshots daily without overwriting demo timeframe preferences", async () => {
    localStorage.setItem("tf_MU", "15m");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) =>
        String(input) === "/kb-api/accounts"
          ? json(accountsPayload())
          : json(snapshotPayload("US", "NAS", "MU")),
      ),
    );
    const { chartPanel } = await renderNative();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    await screen.findAllByRole("option", { name: "KB 조회 계좌" });
    await user.type(screen.getAllByLabelText("종목 코드")[0]!, "MU");
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);

    await waitFor(() =>
      expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({
        selectedSymbol: "MU",
        timeframe: "1d",
      }),
    );
    expect(screen.getByRole("button", { name: "1d" })).toHaveClass("bg-primary");
    expect(screen.getByRole("button", { name: "15m" })).not.toHaveClass("bg-primary");
    expect(localStorage.getItem("tf_MU")).toBe("15m");
  });

  it("persists native chart plugins without updating template subscribers during render", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn(async () => json(accountsPayload())));
    await renderNative(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByTitle("Chart Plugins"));
    await user.click(screen.getByRole("button", { name: /OHLCV Tooltip/ }));

    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("Cannot update a component");
    expect(localStorage.getItem("trader_prefs")).toContain("tooltip");
  });

  it("preserves Korean leading zeros and submits with Enter", async () => {
    const snapshotRequests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/kb-api/accounts") return json(accountsPayload());
        snapshotRequests.push(url);
        return json(snapshotPayload("KR", "KOSPI", "005930"));
      }),
    );
    const { chartPanel } = await renderNative();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    await screen.findAllByRole("option", { name: "KB 조회 계좌" });
    await user.selectOptions(screen.getAllByLabelText("시장")[0]!, "KR");
    await user.type(screen.getAllByLabelText("종목 코드")[0]!, "005930");
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({
        selectedSymbol: "005930",
        dataIdentityKey: `${accountId}:KR:KOSPI:005930`,
      }),
    );
    expect(snapshotRequests[0]).toContain("symbol=005930");
  });

  it("lets only the latest full market identity commit", async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    let snapshotCall = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input) === "/kb-api/accounts") return json(accountsPayload());
        snapshotCall += 1;
        return snapshotCall === 1 ? first.promise : second.promise;
      }),
    );
    const { chartPanel } = await renderNative();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    await screen.findAllByRole("option", { name: "KB 조회 계좌" });
    const ticker = screen.getAllByLabelText("종목 코드")[0]!;
    await user.type(ticker, "MU");
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);
    await user.click(screen.getByRole("button", { name: "MU" }));
    await user.selectOptions(screen.getAllByLabelText("시장")[0]!, "KR");
    await user.type(screen.getAllByLabelText("종목 코드")[0]!, "005930");
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);

    await act(async () => second.resolve(json(snapshotPayload("KR", "KOSPI", "005930"))));
    await waitFor(() =>
      expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({
        selectedSymbol: "005930",
        dataIdentityKey: `${accountId}:KR:KOSPI:005930`,
      }),
    );
    await act(async () => first.resolve(json(snapshotPayload("US", "NAS", "MU"))));
    expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({ selectedSymbol: "005930" });
  });

  it("invalidates the same symbol when its query market changes", async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    let snapshotCall = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input) === "/kb-api/accounts") return json(accountsPayload());
        snapshotCall += 1;
        return snapshotCall === 1 ? first.promise : second.promise;
      }),
    );
    const { chartPanel } = await renderNative();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    await screen.findAllByRole("option", { name: "KB 조회 계좌" });
    await user.type(screen.getAllByLabelText("종목 코드")[0]!, "MU");
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);
    await user.click(screen.getByRole("button", { name: "MU" }));
    await user.selectOptions(screen.getAllByLabelText("조회 시장")[0]!, "NYS");
    expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({ selectedSymbol: "", candles: [] });
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);

    await act(async () => second.resolve(json(snapshotPayload("US", "NYS", "MU"))));
    await waitFor(() =>
      expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({
        selectedSymbol: "MU",
        dataIdentityKey: `${accountId}:US:NYS:MU`,
      }),
    );
    await act(async () => first.resolve(json(snapshotPayload("US", "NAS", "MU"))));
    expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({
      dataIdentityKey: `${accountId}:US:NYS:MU`,
    });
  });

  it("clears on account change and aborts a pending request on unmount", async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    const signals: AbortSignal[] = [];
    let snapshotCall = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === "/kb-api/accounts") return json(accountsPayload());
        if (init?.signal) signals.push(init.signal);
        snapshotCall += 1;
        return snapshotCall === 1 ? first.promise : second.promise;
      }),
    );
    const { chartPanel, unmount } = await renderNative();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    await screen.findAllByRole("option", { name: "KB 조회 계좌" });
    await user.type(screen.getAllByLabelText("종목 코드")[0]!, "MU");
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);
    await user.click(screen.getByRole("button", { name: "MU" }));
    await user.selectOptions(screen.getAllByLabelText("계좌")[0]!, "03f15d37-e5cf-4560-a1a1-3e2e1fd89524");
    expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({
      selectedSymbol: "",
      candles: [],
      dataIdentityKey: undefined,
    });
    expect(signals[0]?.aborted).toBe(true);
    await act(async () => first.resolve(json(snapshotPayload("US", "NAS", "MU"))));
    expect(chartPanel.mock.calls.at(-1)![0]).toMatchObject({
      selectedSymbol: "",
      candles: [],
      dataIdentityKey: undefined,
    });

    const ticker = screen.getAllByLabelText("종목 코드")[0]!;
    await user.clear(ticker);
    await user.type(ticker, "NVDA");
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);
    const unmountSignal = signals[1];
    const callsAtUnmount = chartPanel.mock.calls.length;
    unmount();
    expect(unmountSignal?.aborted).toBe(true);
    await act(async () => second.resolve(json({
      ...snapshotPayload("US", "NAS", "NVDA"),
      account_id: "03f15d37-e5cf-4560-a1a1-3e2e1fd89524",
    })));
    expect(chartPanel.mock.calls).toHaveLength(callsAtUnmount);
  });

  it("keeps invalid and asynchronous failure feedback visible after the popup closes", async () => {
    let snapshots = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input) === "/kb-api/accounts") return json(accountsPayload());
        snapshots += 1;
        return new Response(
          JSON.stringify({
            error: { code: "connection_unavailable", message: "The connection is unavailable." },
          }),
          { status: 503, headers: { "content-type": "application/json" } },
        );
      }),
    );
    await renderNative();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    await screen.findAllByRole("option", { name: "KB 조회 계좌" });
    await user.selectOptions(screen.getAllByLabelText("시장")[0]!, "KR");
    await user.type(screen.getAllByLabelText("종목 코드")[0]!, "5930");
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);
    expect(await screen.findByRole("alert")).toHaveTextContent("6자리");
    expect(snapshots).toBe(0);

    await user.click(screen.getByRole("button", { name: "조회 종목" }));
    const ticker = screen.getAllByLabelText("종목 코드")[0]!;
    await user.clear(ticker);
    await user.type(ticker, "005930");
    await user.click(screen.getAllByRole("button", { name: "조회" })[0]!);
    expect(await screen.findByRole("alert")).toHaveTextContent("connection is unavailable");
    expect(snapshots).toBe(1);
  });
});

async function renderNative(strict = false) {
  vi.stubEnv("MODE", "kb");
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const chartPanel = vi.fn((_props: Record<string, unknown>) => (
    <div data-testid="native-chart-panel" />
  ));
  vi.doMock("@/components/ConnectionIndicator.tsx", () => ({
    useIsFeedConnected: () => false,
  }));
  vi.doMock("@/components/MobileTradingPanel.tsx", () => ({
    MobileAccountBar: () => null,
    MobileTradingPanel: () => null,
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
  vi.doMock("@/pages/trading/ChartPanel.tsx", () => ({ ChartPanel: chartPanel }));
  vi.doMock("@/pages/trading/BottomPanel.tsx", () => ({ BottomPanel: () => null }));
  vi.doMock("@/pages/trading/DOMPanel.tsx", () => ({ DOMPanel: () => null }));
  vi.doMock("@/pages/trading/OrderPanel.tsx", () => ({ OrderPanel: () => null }));
  vi.doMock("@/pages/trading/WatchlistPanel.tsx", () => ({ WatchlistPanel: () => null }));

  const { TradingPage } = await import("@/pages/TradingPage.tsx");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let rendered!: ReturnType<typeof render>;
  await act(async () => {
    const page = (
      <QueryClientProvider client={queryClient}>
        <TradingPage />
      </QueryClientProvider>
    );
    rendered = render(strict ? <StrictMode>{page}</StrictMode> : page);
  });
  return { chartPanel, unmount: rendered.unmount };
}

function accountsPayload() {
  return {
    accounts: [
      { id: accountId, alias: "KB 조회 계좌", status: "active", base_currency: "USD" },
      {
        id: "03f15d37-e5cf-4560-a1a1-3e2e1fd89524",
        alias: "KB 보조 계좌",
        status: "active",
        base_currency: "USD",
      },
    ],
    common_base_currency: "USD",
  };
}

function snapshotPayload(
  market: "US" | "KR",
  queryMarket: "NAS" | "NYS" | "KOSPI",
  symbol: string,
) {
  return {
    account_id: accountId,
    market,
    query_market: queryMarket,
    symbol,
    currency: market === "US" ? "USD" : "KRW",
    source: "kb",
    acquired_at: "2026-09-19T12:00:00Z",
    provider_as_of: null,
    provider_timezone: null,
    delay: market === "US" ? { status: "delayed", minutes: 15 } : { status: "unknown", minutes: null },
    quote: { last: market === "US" ? "127.2500" : "72500", bid: null, ask: null },
    bars: [
      {
        date: "2026-09-18",
        open: market === "US" ? "127.0000" : "73100",
        high: market === "US" ? "129.0000" : "74000",
        low: market === "US" ? "126.0000" : "72000",
        close: market === "US" ? "127.2500" : "72500",
        volume: null,
      },
    ],
  };
}

function json(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}
