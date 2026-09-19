import { act, cleanup, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { vwap, type CandleData } from "@/lib/indicators";
import { formatUtcTradingDate, formatUtcTradingDateTime } from "@/lib/chart-plugins/helpers/time";
import { TooltipPrimitive } from "@/lib/chart-plugins/tooltip/tooltip";
import { DeltaTooltipPrimitive } from "@/lib/chart-plugins/delta-tooltip/delta-tooltip";
import type { Time } from "lightweight-charts";
import {
  snapshotBarsToNativeCandles,
  snapshotPriceDigits,
  tradingDateToUtcSeconds,
} from "@/pages/trading/utils";
import type { MarketSnapshot } from "@/services/marketSnapshot";
import { useChartDrawings } from "@/hooks/useChartDrawings";
import { marketSnapshotDrawings } from "@/services/marketSnapshotDrawings";
import type { DrawingLine } from "@/pages/trading/constants";

const bars: MarketSnapshot["bars"] = [
  {
    date: "2026-03-23",
    open: "73100",
    high: "74000",
    low: "72000",
    close: "72500",
    volume: null,
  },
  {
    date: "2026-03-24",
    open: "72500",
    high: "73000",
    low: "71000",
    close: "72000",
    volume: "0",
  },
];

describe("native manual-daily chart data", () => {
  it("maps a trading date to a finite UTC calendar coordinate and back", () => {
    const coordinate = tradingDateToUtcSeconds("2026-03-23");

    expect(coordinate).toBe(Date.UTC(2026, 2, 23) / 1000);
    expect(formatUtcTradingDate(coordinate)).toBe("2026-03-23");
    expect(() => tradingDateToUtcSeconds("2026-02-30")).toThrow("Invalid trading date");
  });

  it.each(["2026-03-08", "2026-11-01"])(
    "formats %s as the original day across Seoul and New York DST",
    (tradingDate) => {
      const coordinate = tradingDateToUtcSeconds(tradingDate);
      expect(formatUtcTradingDateTime(coordinate as Time)).toEqual([tradingDate, ""]);
      expect(dateInZone(coordinate, "Asia/Seoul")).toBe(tradingDate);
      expect(dateInZone(coordinate, "America/New_York")).toBe(
        formatUtcTradingDate(coordinate - 86_400),
      );
    },
  );

  it("wires the UTC trading-date formatter into both tooltip plugins", () => {
    const formatter = (time: Time): [string, string] => formatUtcTradingDateTime(time);
    const tooltip = new TooltipPrimitive({ dateFormatter: formatter });
    const delta = new DeltaTooltipPrimitive({ dateFormatter: formatter });

    expect(
      (tooltip as unknown as { _options: { dateFormatter: typeof formatter } })._options
        .dateFormatter(tradingDateToUtcSeconds("2026-09-18") as Time),
    ).toEqual(["2026-09-18", ""]);
    expect(
      (delta as unknown as { _options: { dateFormatter: typeof formatter } })._options
        .dateFormatter(tradingDateToUtcSeconds("2026-09-18") as Time),
    ).toEqual(["2026-09-18", ""]);
  });

  it("keeps missing volume absent and reported zero distinct", () => {
    expect(snapshotBarsToNativeCandles(bars)).toEqual([
      expect.objectContaining({ time: Date.UTC(2026, 2, 23) / 1000, volume: null }),
      expect.objectContaining({ time: Date.UTC(2026, 2, 24) / 1000, volume: 0 }),
    ]);
  });

  it("derives native price precision from validated decimal strings", () => {
    expect(snapshotPriceDigits(["127.2500", "127.2", null])).toBe(4);
    expect(snapshotPriceDigits(["72500", null])).toBe(0);
    expect(() => snapshotPriceDigits([`1.${"1".repeat(101)}`])).toThrow(
      "Unsupported snapshot precision",
    );
  });

  it("makes strict VWAP unavailable for missing volume", () => {
    const candles: CandleData[] = [
      { time: 1, open: 10, high: 11, low: 9, close: 10, volume: undefined },
      { time: 2, open: 11, high: 12, low: 10, close: 11, volume: 10 },
    ];

    expect(vwap(candles, true)).toEqual([]);
    expect(vwap(candles)).toHaveLength(2);
  });

  it("preserves reported zero without emitting a fabricated VWAP point", () => {
    const candles: CandleData[] = [
      { time: 1, open: 10, high: 11, low: 9, close: 10, volume: 0 },
      { time: 2, open: 20, high: 22, low: 18, close: 20, volume: 5 },
    ];

    expect(vwap(candles, true)).toEqual([{ time: 2, value: 20 }]);
  });

  it("persists drawing CRUD and undo/redo only inside the full identity scope", async () => {
    const scopeA = {
      account_id: "3f13f4c2-4dce-45ef-b8e4-b92e58f101d5",
      market: "US" as const,
      query_market: "NAS" as const,
      symbol: "MU",
    };
    const scopeB = { ...scopeA, query_market: "NYS" as const };
    const drawing: DrawingLine = {
      id: "line-1",
      type: "horizontal",
      price: 127.25,
      color: "#22c7a5",
    };
    const { result, rerender, unmount } = renderHook(
      ({ scope }) => useChartDrawings("MU", "1d", scope),
      { initialProps: { scope: scopeA as typeof scopeA | typeof scopeB } },
    );
    await waitFor(() => expect(result.current.drawings).toEqual([]));

    act(() => result.current.addDrawing(drawing));
    expect(result.current.drawings).toEqual([drawing]);
    await expect(marketSnapshotDrawings.list(scopeA)).resolves.toEqual([drawing]);

    act(() => result.current.undo());
    expect(result.current.drawings).toEqual([]);
    act(() => result.current.redo());
    expect(result.current.drawings).toEqual([drawing]);
    const updated = { ...drawing, price: 128 };
    act(() => result.current.updateDrawing(updated));
    expect(await marketSnapshotDrawings.list(scopeA)).toEqual([updated]);
    act(() => result.current.clearDrawings());
    expect(await marketSnapshotDrawings.list(scopeA)).toEqual([]);
    act(() => result.current.undo());
    expect(await marketSnapshotDrawings.list(scopeA)).toEqual([updated]);

    rerender({ scope: scopeB });
    await waitFor(() => expect(result.current.drawings).toEqual([]));
    expect(await marketSnapshotDrawings.list(scopeA)).toEqual([updated]);
    act(() => result.current.addDrawing({ ...drawing, id: "line-b" }));
    expect(await marketSnapshotDrawings.list(scopeB)).toHaveLength(1);

    rerender({ scope: scopeA });
    await waitFor(() => expect(result.current.drawings).toEqual([updated]));
    unmount();
    const reloaded = renderHook(() => useChartDrawings("MU", "1d", scopeA));
    await waitFor(() => expect(reloaded.result.current.drawings).toEqual([updated]));
    act(() => reloaded.result.current.removeDrawing(drawing.id));
    expect(await marketSnapshotDrawings.list(scopeA)).toEqual([]);
  });

  it("ignores a late drawing load from the previous identity", async () => {
    const scopeA = {
      account_id: accountId,
      market: "US" as const,
      query_market: "NAS" as const,
      symbol: "MU",
    };
    const scopeB = { ...scopeA, query_market: "NYS" as const };
    const late = deferred<DrawingLine[]>();
    const list = vi
      .spyOn(marketSnapshotDrawings, "list")
      .mockImplementationOnce(() => late.promise)
      .mockResolvedValueOnce([]);
    const drawing: DrawingLine = {
      id: "late",
      type: "horizontal",
      price: 1,
      color: "#fff",
    };
    const { result, rerender } = renderHook(
      ({ scope }) => useChartDrawings("MU", "1d", scope),
      { initialProps: { scope: scopeA as typeof scopeA | typeof scopeB } },
    );

    rerender({ scope: scopeB });
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    await act(async () => late.resolve([drawing]));
    expect(result.current.drawings).toEqual([]);
    list.mockRestore();
  });

  it("mounts the real ChartPanel manual factory with nullable legend and lifecycle guards", async () => {
    const candleSetData = vi.fn();
    const volumeSetData = vi.fn();
    const remove = vi.fn();
    const disconnect = vi.fn();
    const subscribeHistory = vi.fn();
    let crosshair: ((param: { time?: Time; seriesData: Map<unknown, unknown> }) => void) | undefined;
    const candleSeries = series(candleSetData);
    const volumeSeries = series(volumeSetData);
    const chart = {
      addCandlestickSeries: vi.fn(() => candleSeries),
      addHistogramSeries: vi.fn(() => volumeSeries),
      addLineSeries: vi.fn(() => series(vi.fn())),
      removeSeries: vi.fn(),
      priceScale: () => ({ applyOptions: vi.fn() }),
      timeScale: () => ({
        applyOptions: vi.fn(),
        subscribeVisibleLogicalRangeChange: subscribeHistory,
        unsubscribeVisibleLogicalRangeChange: vi.fn(),
        subscribeSizeChange: vi.fn(),
        unsubscribeSizeChange: vi.fn(),
        scrollToRealTime: vi.fn(),
        resetTimeScale: vi.fn(),
        fitContent: vi.fn(),
      }),
      subscribeCrosshairMove: vi.fn((callback) => {
        crosshair = callback;
      }),
      applyOptions: vi.fn(),
      remove,
    };
    const createChart = vi.fn((_container: HTMLElement, _options: unknown) => chart);
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    vi.doMock("lightweight-charts", async (importOriginal) => ({
      ...(await importOriginal<typeof import("lightweight-charts")>()),
      createChart,
    }));
    vi.doMock("@/lib/chart-plugins/drawing-tools/manager.ts", () => ({
      DrawingToolsManager: class {
        constructor() {
          return new Proxy(this, { get: (target, prop) => Reflect.get(target, prop) ?? vi.fn() });
        }
      },
    }));
    vi.doMock("@/pages/trading/useNewsOverlay.ts", () => ({
      useNewsOverlay: () => ({
        newsConfig: { enabled: false },
        setNewsConfig: vi.fn(),
        showNewsConfigDialog: false,
        setShowNewsConfigDialog: vi.fn(),
        newsPopup: null,
        setNewsPopup: vi.fn(),
      }),
    }));
    vi.doMock("@/pages/trading/useChallengeLevels.ts", () => ({ useChallengeLevels: vi.fn() }));
    vi.doMock("@/pages/trading/useSlTpDrag.ts", () => ({ useSlTpDrag: () => null }));

    const { ChartPanel } = await import("@/pages/trading/ChartPanel.tsx");
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const snapshot = snapshotWithVolume(null);
    const rendered = render(
      <QueryClientProvider client={queryClient}>
        <ChartPanel
          candles={snapshotBarsToNativeCandles(snapshot.bars)}
          selectedSymbol="MU"
          timeframe="1d"
          isDark
          activeIndicators={["VWAP"]}
          activePlugins={["tooltip", "delta-tooltip"]}
          drawingTool="none"
          drawings={[]}
          onAddDrawing={vi.fn()}
          onDrawingComplete={vi.fn()}
          positions={[]}
          orders={[]}
          pipDigits={4}
          dataMode="manual-daily"
          dataIdentityKey={`${accountId}:US:NAS:MU`}
          manualSnapshot={snapshot}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(candleSetData).toHaveBeenCalled());
    expect(volumeSetData).toHaveBeenLastCalledWith([]);
    expect(subscribeHistory).not.toHaveBeenCalled();
    expect(screen.getByText(/VWAP unavailable/)).toBeInTheDocument();
    expect(screen.getByText("시장 US")).toBeInTheDocument();
    expect(screen.getByText("조회 시장 NAS")).toBeInTheDocument();
    expect(createChart.mock.calls[0]![0]).toHaveClass("relative");
    const options = createChart.mock.calls[0]![1] as {
      localization: { timeFormatter: (time: Time) => string };
      timeScale: { tickMarkFormatter: (time: Time) => string };
    };
    expect(options.localization.timeFormatter(tradingDateToUtcSeconds("2026-09-18") as Time)).toBe(
      "2026-09-18",
    );
    expect(options.timeScale.tickMarkFormatter(tradingDateToUtcSeconds("2026-09-18") as Time)).toBe(
      "2026-09-18",
    );
    act(() => crosshair?.({ seriesData: new Map() }));
    expect(screen.queryByText(/^V$/)).not.toBeInTheDocument();

    rendered.rerender(
      <QueryClientProvider client={queryClient}>
        <ChartPanel
          candles={[]}
          selectedSymbol="MU"
          timeframe="1d"
          isDark
          activeIndicators={["VWAP"]}
          activePlugins={["tooltip", "delta-tooltip"]}
          drawingTool="none"
          drawings={[]}
          onAddDrawing={vi.fn()}
          onDrawingComplete={vi.fn()}
          positions={[]}
          orders={[]}
          pipDigits={4}
          dataMode="manual-daily"
          dataIdentityKey={`${accountId}:US:NAS:MU:cleared`}
          manualSnapshot={null}
        />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(chart.removeSeries).toHaveBeenCalled());
    expect(candleSetData).toHaveBeenLastCalledWith([]);

    for (const [reportedVolume, expected] of [["0", "0"], ["3200000", "3,200,000"]] as const) {
      const next = snapshotWithVolume(reportedVolume);
      rendered.rerender(
        <QueryClientProvider client={queryClient}>
          <ChartPanel
            candles={snapshotBarsToNativeCandles(next.bars)}
            selectedSymbol="MU"
            timeframe="1d"
            isDark
            activeIndicators={[]}
            activePlugins={["tooltip", "delta-tooltip"]}
            drawingTool="none"
            drawings={[]}
            onAddDrawing={vi.fn()}
            onDrawingComplete={vi.fn()}
            positions={[]}
            orders={[]}
            pipDigits={4}
            dataMode="manual-daily"
            dataIdentityKey={`${accountId}:US:NAS:MU`}
            manualSnapshot={next}
          />
        </QueryClientProvider>,
      );
      const candle = { time: tradingDateToUtcSeconds("2026-09-18") as Time, open: 127, high: 129, low: 126, close: 127.25 };
      act(() => {
        crosshair?.({
          time: candle.time,
          seriesData: new Map<unknown, unknown>([
            [candleSeries, candle],
            [volumeSeries, { time: candle.time, value: Number(reportedVolume) }],
          ]),
        });
        crosshair?.({ seriesData: new Map() });
      });
      expect(screen.getByText("V")).toBeInTheDocument();
      expect(screen.getByText(expected)).toBeInTheDocument();
    }
    const rebound = snapshotWithVolume("10");
    rendered.rerender(
      <QueryClientProvider client={queryClient}>
        <ChartPanel
          candles={snapshotBarsToNativeCandles(rebound.bars)}
          selectedSymbol="MU"
          timeframe="1d"
          isDark
          activeIndicators={[]}
          activePlugins={["tooltip", "delta-tooltip"]}
          drawingTool="none"
          drawings={[]}
          onAddDrawing={vi.fn()}
          onDrawingComplete={vi.fn()}
          positions={[]}
          orders={[]}
          pipDigits={2}
          dataMode="manual-daily"
          dataIdentityKey={`${accountId}:US:NAS:MU`}
          manualSnapshot={rebound}
        />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(createChart.mock.calls.length).toBeGreaterThanOrEqual(2));
    expect(candleSeries.attachPrimitive.mock.calls.length).toBeGreaterThanOrEqual(4);
    rendered.unmount();
    expect(remove).toHaveBeenCalledTimes(createChart.mock.calls.length);
    expect(disconnect).toHaveBeenCalled();
    cleanup();
  });

  it("repopulates fresh primary and overlay series after precision recreates the chart", async () => {
    vi.resetModules();
    const instances: Array<ReturnType<typeof chartInstance>> = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.doMock("lightweight-charts", async (importOriginal) => ({
      ...(await importOriginal<typeof import("lightweight-charts")>()),
      createChart: vi.fn(() => {
        const instance = chartInstance();
        instances.push(instance);
        return instance.chart;
      }),
    }));
    vi.doMock("@/lib/chart-plugins/drawing-tools/manager.ts", () => ({
      DrawingToolsManager: class {
        constructor() {
          return new Proxy(this, { get: (target, prop) => Reflect.get(target, prop) ?? vi.fn() });
        }
      },
    }));
    vi.doMock("@/pages/trading/useNewsOverlay.ts", () => ({
      useNewsOverlay: () => ({
        newsConfig: { enabled: false },
        setNewsConfig: vi.fn(),
        showNewsConfigDialog: false,
        setShowNewsConfigDialog: vi.fn(),
        newsPopup: null,
        setNewsPopup: vi.fn(),
      }),
    }));
    vi.doMock("@/pages/trading/useChallengeLevels.ts", () => ({ useChallengeLevels: vi.fn() }));
    vi.doMock("@/pages/trading/useSlTpDrag.ts", () => ({ useSlTpDrag: () => null }));

    const { ChartPanel } = await import("@/pages/trading/ChartPanel.tsx");
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const snapshot = snapshotWithVolume("10");
    const candles = snapshotBarsToNativeCandles(snapshot.bars);
    const panel = (pipDigits: number) => (
      <QueryClientProvider client={queryClient}>
        <ChartPanel
          candles={candles}
          selectedSymbol="MU"
          timeframe="1d"
          isDark
          activeIndicators={["SMA"]}
          activePlugins={["tooltip"]}
          drawingTool="none"
          drawings={[]}
          onAddDrawing={vi.fn()}
          onDrawingComplete={vi.fn()}
          positions={[]}
          orders={[]}
          pipDigits={pipDigits}
          dataMode="manual-daily"
          dataIdentityKey={`${accountId}:US:NAS:MU`}
          manualSnapshot={snapshot}
        />
      </QueryClientProvider>
    );
    const rendered = render(panel(4));
    await waitFor(() => expect(instances[0]?.candleSetData).toHaveBeenCalledWith(expect.any(Array)));
    expect(instances[0]!.volumeSetData).toHaveBeenCalledWith(expect.any(Array));
    expect(instances[0]!.addLineSeries).toHaveBeenCalled();
    expect(instances[0]!.candleSeries.attachPrimitive).toHaveBeenCalled();

    rendered.rerender(panel(2));
    await waitFor(() => expect(instances.length).toBeGreaterThanOrEqual(2));
    await waitFor(() => expect(instances[1]!.candleSetData).toHaveBeenCalledWith(expect.any(Array)));
    expect(instances[1]!.volumeSetData).toHaveBeenCalledWith(expect.any(Array));
    expect(instances[1]!.addLineSeries).toHaveBeenCalled();
    expect(instances[1]!.candleSeries.attachPrimitive).toHaveBeenCalled();
    rendered.unmount();
  });
});

function dateInZone(timestampSeconds: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestampSeconds * 1000));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

function series(setData: ReturnType<typeof vi.fn>) {
  return {
    setData,
    update: vi.fn(),
    data: () => [],
    barsInLogicalRange: () => null,
    priceToCoordinate: () => 0,
    coordinateToPrice: () => 0,
    createPriceLine: () => ({}),
    removePriceLine: vi.fn(),
    setMarkers: vi.fn(),
    applyOptions: vi.fn(),
    priceScale: () => ({ applyOptions: vi.fn() }),
    attachPrimitive: vi.fn(),
    detachPrimitive: vi.fn(),
  };
}

function chartInstance() {
  const candleSetData = vi.fn();
  const volumeSetData = vi.fn();
  const candleSeries = series(candleSetData);
  const volumeSeries = series(volumeSetData);
  const addLineSeries = vi.fn(() => series(vi.fn()));
  return {
    candleSetData,
    volumeSetData,
    candleSeries,
    addLineSeries,
    chart: {
      addCandlestickSeries: () => candleSeries,
      addHistogramSeries: () => volumeSeries,
      addLineSeries,
      removeSeries: vi.fn(),
      priceScale: () => ({ applyOptions: vi.fn() }),
      timeScale: () => ({
        applyOptions: vi.fn(),
        subscribeVisibleLogicalRangeChange: vi.fn(),
        unsubscribeVisibleLogicalRangeChange: vi.fn(),
        subscribeSizeChange: vi.fn(),
        unsubscribeSizeChange: vi.fn(),
        scrollToRealTime: vi.fn(),
        resetTimeScale: vi.fn(),
        fitContent: vi.fn(),
      }),
      subscribeCrosshairMove: vi.fn(),
      applyOptions: vi.fn(),
      remove: vi.fn(),
    },
  };
}

const accountId = "3f13f4c2-4dce-45ef-b8e4-b92e58f101d5";

function snapshotWithVolume(volume: string | null): MarketSnapshot {
  return {
    account_id: accountId,
    market: "US",
    query_market: "NAS",
    symbol: "MU",
    currency: "USD",
    source: "kb",
    acquired_at: "2026-09-19T12:00:00Z",
    provider_as_of: null,
    provider_timezone: null,
    delay: { status: "delayed", minutes: 15 },
    quote: { last: "127.2500", bid: null, ask: null },
    bars: [
      {
        date: "2026-09-18",
        open: "127.0000",
        high: "129.0000",
        low: "126.0000",
        close: "127.2500",
        volume,
      },
    ],
  };
}
